# AxiaERP — audit complet et plan de correction

**11 septembre 2026** · back .NET 8 (10 solutions), front React, 12 bases PostgreSQL

---

## Périmètre, et ce qui n'a pas pu être vérifié

Quatre audits statiques ont été menés en parallèle sur le code : sécurité, validation et
robustesse, front, et extension du cloisonnement. Aucun build, aucune exécution — analyse de
fichiers uniquement.

**Trois limites, à connaître avant de lire la suite :**

1. **Les bases n'ont pas été auditées.** L'hôte `172.0.1.72` est hors de mon allowlist réseau.
   Trois scripts sont livrés (`A1`, `A2`, `A3`) — les constats « base » de ce rapport sont donc
   des *attentes à vérifier*, pas des mesures.
2. **La synchronisation depuis `develop` n'a pas eu lieu.** Le distant `172.0.1.172` est
   également bloqué. `AppelOffre`, `Btp` et `Dao` **n'existent pas dans le local** : ni
   solution, ni projet, ni entité. Tout ce qui les concerne est hors de portée de cet audit.
3. **Ce qui tourne réellement en production n'est pas connu** : variables d'environnement,
   `appsettings.Production.json`, valeur de `ASPNETCORE_ENVIRONMENT`, reverse proxy,
   `pg_hba.conf`. Plusieurs constats ci-dessous s'aggravent ou s'atténuent selon ces réponses.

---

## CRITIQUE

### 1. Une chaîne complète de compromission, en trois maillons

Pris isolément, chacun est grave. Enchaînés, ils donnent le contrôle total de toutes les
sociétés à **n'importe quel utilisateur authentifié**, quelle que soit sa société et son rôle.

**Maillon 1 — lecture de fichier arbitraire**
`StructureAPI/Controllers/DocController.cs:67-80` — `Download(string chemin)` fait
`Path.Combine(_env.ContentRootPath, chemin)` puis `PhysicalFile(...)`, sans normalisation ni
contrôle de confinement. `Path.Combine` honore un chemin absolu, et `..\` n'est pas filtré.

**Maillon 2 — les secrets sont dans les fichiers ainsi lisibles**
Les 21 `appsettings*.json` sont suivis par git (`.gitignore` du back n'a aucune règle
`appsettings*`). Ils contiennent :

| Secret | Valeur | Où |
|---|---|---|
| Clé de signature JWT | `CHANGE_ME_SUPER_SECRET_KEY_MIN_32_CHARACTERS_LONG_PLEASE`, **identique dans les 10 API** | 10 fichiers |
| Mot de passe PostgreSQL | `Demo123*`, utilisateur **`postgres`** (superutilisateur), hôte `172.0.1.72` | 10 fichiers |
| Mot de passe SMTP | compte réel `support@gst.com.tn` sur `SSL0.OVH.NET` | `VenteAPI/appsettings.json:21-24` |
| Compte d'amorçage | `admin@authservice.local` / `Admin@123456!`, rôle Admin toutes permissions | `AuthentificationAPI/appsettings.json:14-16` + `DbSeeder.cs:145-146` |

**Maillon 3 — la clé JWT est acceptée partout**
Même clé, même `Issuer`, même `Audience` sur les 10 API. Un jeton forgé avec `role=Root` et
n'importe quel `id_societe` est accepté par toutes.

**Ce que ça donne concrètement :** un utilisateur Manager de la société 3 appelle
`GET /Doc/Download?chemin=..\appsettings.json`, récupère la clé, forge un jeton Root, et lit
ou modifie les données de toutes les sociétés sur les 10 API. Le cloisonnement qu'on vient de
poser et le filtre de permissions sont contournés — ils s'appuient tous deux sur le contenu du
jeton.

Accessoirement, le mot de passe `postgres` donne un accès superutilisateur direct aux 8 bases
depuis tout hôte joignant `172.0.1.72`, y compris `Identitydb`.

### 2. Le filtre de permissions échoue en mode ouvert

`PermissionAuthorizationFilter.cs:85-95` — identique dans les 8 API. Toute exception de
résolution des droits est journalisée, puis `return` : **la requête passe**.

C'est mon code, et c'était un mauvais arbitrage. Je l'avais écrit ainsi après un incident où le
filtre renvoyait 500 sur toute l'API Structure, en me disant qu'une panne de résolution ne
devait pas bloquer l'application. Mais les chaînes de connexion plafonnent à
`Maximum Pool Size=5` : il suffit de saturer le pool de la base Identity pour que le contrôle
de droits fin disparaisse sur les 8 API. Il ne reste alors que « être authentifié ».

### 3. Le front est cassé par le retrait des permissions du jeton

`erp-front/src/helpers/permissions.js:99-102` lit un claim `permission` qui n'existe plus
depuis qu'on a retiré les droits du jeton pour régler les HTTP 431. Le `Set` est désormais
**toujours vide**, et `hasPermission()` renvoie `false` pour tout.

Aggravant : ligne 113, `toutPuissant` n'est vrai que si un rôle vaut littéralement
`superadmin`. **`Root` ne correspond pas.**

**Ce que l'utilisateur voit :** connecté en Root — le rôle le plus élevé — les menus
Production, Maintenance et Qualité disparaissent, et toute URL Production affiche « Écran non
accessible ». Seul un compte SuperAdmin garde le module. Le gating touche
`EcranProtege` (23 usages dans `allRoutes.js`) et `useDroits` (33 appels dans 17 fichiers).

Second effet, plus insidieux : `useNavigation.js:47-53` et `useSidebarNav.js:15-21` mémoïsent
sur `${toutPuissant}|${permissions.size}`. Avec un `Set` toujours vide, **l'empreinte ne change
jamais** — le menu ne se recalculera pas même après correction du back.

### 4. La garde de route du front est désactivée

`erp-front/src/Routes/AuthProtected.js:13-31` — tout le corps est commenté. Le composant rend
ses enfants sans condition. Une URL protégée tapée sans session monte la page complète et
déclenche ses appels ; l'éjection n'a lieu qu'au premier 401.

### 5. Achat : 21 entités, aucune notion de société

`AchatDomain` ne contient **aucune** propriété contenant `societ` ou `company`. Les 10 entêtes
(commandes, réceptions, factures, avoirs, retours, offres de prix) et leurs 10 lignes n'ont
aucune colonne sur laquelle filtrer.

Ce n'est pas un filtre à poser : c'est un schéma à modifier, une migration à écrire, et des
données existantes à rattacher. **Tant que ce n'est pas fait, toutes les sociétés partagent
leurs achats.**

---

## ÉLEVÉ

### 6. Vente : 7 tables de document sans société

8 entités sur 15 portent `SocietyId`. Les 7 restantes sont les **lignes** de document
(`BonCommandeLigne`, `FactureLigne`, `DevisLigne`…) et `Echeance`. Le filtre couvrirait les
entêtes mais pas leur contenu : une ligne reste lisible par identifiant direct.

`ICurrentUserService` n'existe pas dans Vente — interface, implémentation et enregistrement
sont à créer.

### 7. Aucun mécanisme de validation n'est branché : 63 validateurs sur 73 ne s'exécutent jamais

- `IPipelineBehavior` : **0 occurrence dans tout le dépôt**.
- `ProductionAPI/Program.cs:121` et `AbonnementAPI/Program.cs:59` enregistrent leurs
  validateurs, mais **aucun filtre ni behavior ne les invoque** → 54 validateurs Production +
  9 Abonnement sont du code mort.
- Seule Authentification applique réellement, via `ValidationFilter` (8 validateurs actifs).
- **335 commandes Create/Update** existent (Structure 183, Achat 88, Vente 60, GestionEtat 4).
  **Aucune** n'a de validateur : les 73 validateurs ciblent des DTO, pas des commandes.

### 8. Aucun contrôle de concurrence, nulle part

`RowVersion` : 0. `xmin` : 0. `[ConcurrencyCheck]` : 0. `DbUpdateConcurrencyException` : 0.
Les 6 `IsConcurrencyToken` trouvés sont le `ConcurrencyStamp` d'ASP.NET Identity, généré, pas
un choix applicatif.

Deux utilisateurs qui modifient la même fiche : le second écrase le premier, sans avertissement
ni trace.

### 9. Suppression physique généralisée : 161 sites

`.Remove` / `.RemoveRange` / `ExecuteDeleteAsync` hors migrations — Structure 89,
Subscription 26, Achat 21, Vente 14. La suppression logique existe presque uniquement dans
Subscription (65 occurrences).

L'anomalie : `IsDeleted` est présent en masse (Production 544, Stock 86, Structure 80) mais les
routes `Delete` de Structure suppriment quand même physiquement. Exemple :
`FamilleRepository.cs:160-172` — `RemoveRange` des catégories comptables puis `Remove` de la
famille. Perte définitive, aucune trace.

### 10. Aucune limitation de débit, y compris sur la connexion

Aucun `AddRateLimiter` dans tout le back. `AuthController.cs:42-44` (`login`), `:119-121`
(`forgot-password`) et `:28-30` (`register`) sont anonymes et sans quota. Le verrouillage
Identity (5 essais / 15 min) protège un compte, pas contre l'énumération multi-comptes.

`register` est d'ailleurs ouvert à tous sur un SaaS multi-société.

### 11. Téléversement sans filtrage

`DocController.cs:41-62` — extension reprise telle quelle de `file.FileName` (l. 46), aucune
liste blanche, aucun plafond de taille, aucun contrôle de type MIME. À rapprocher du maillon 1 :
on dépose, puis on relit.

Contraste utile : `ModeleImpressionController.cs:124-137` fait le travail correctement
(10 Mo, jpg/jpeg/png/webp). Le modèle existe déjà dans le dépôt.

### 12. 23 méthodes écrivent plusieurs fois sans transaction

168 fichiers ont au moins deux `SaveChangesAsync` ; 142 n'ouvrent aucune transaction. 23
méthodes en ont 2 ou 3 dans le même corps sans `BeginTransaction` — Structure 12,
Subscription 7.

Cas net : `FamilleRepository.cs:70` — `SaveChanges` ligne 91 (la famille), puis ligne 110 (ses
catégories comptables). Échec au second : famille enregistrée sans ses catégories,
définitivement.

`CreateExecutionStrategy` : 0 occurrence — les 59 transactions existantes casseront si
`EnableRetryOnFailure` est un jour activé.

---

## MOYEN

### 13. Pagination : 50 routes sur 547, et aucun plafond

6 solutions sur 10 n'ont **aucune** route paginée. 103 routes `GetAll` sans template chargent
la table entière avec ses navigations. Le seul plafond de `pageSize` du dépôt est
`UserService.cs:46` (`Math.Min(pageSize, 100)`) ; `AbonnementApplication/Common/PagedRequest.cs`
autorise jusqu'à **10 000**.

### 14. 240 requêtes exposent des entités du domaine

Sur 963 `IRequest<>`, 240 renvoient une entité EF plutôt qu'un DTO (Structure 162,
Subscription 65) — navigations et colonnes internes sérialisées vers le client.

### 15. Contrats de réponse incohérents

Trois formats d'erreur (8 API en `{code,message}`, Authentification en
`{status,title,errors,traceId}`, **Subscription n'a aucun gestionnaire global**) et deux
enveloppes de succès (`ResponseMessage` vs `Result<T>`). `FamillesController` à lui seul
renvoie trois formes différentes selon la route.

### 16. Le front ne sait pas distinguer les codes d'erreur

`api_helper.js:138-139` rejette une **chaîne** au lieu d'un objet. **35 emplacements** testent
`err?.response?.status` sur une chaîne — le test ne correspond jamais. Aucun écran ne peut
réagir différemment à un 403 qu'à un 500.

Le comportement de l'intercepteur lui-même est correct : rafraîchissement sur 401 seulement,
403 sans déconnexion (l. 92, 197).

### 17. 180 entrées de menu sur 204 ne sont filtrées par rien

`navigationRegistry.js` — 24 entrées portent un attribut `droit:`, aucune ne porte de
contrainte de rôle. Un Manager voit « SaaS Configuration », « Sociétés », « Utilisateurs »,
« Rôles », « Permissions » — et reçoit 403 en cliquant.

Le seul filtrage par rôle du front, `ProfileDropdown.js:24`, est **inversé** : il masque la
gestion des utilisateurs à Admin et Manager, alors que le back l'autorise à Admin et la refuse
à Manager.

### 18. Root casse le contexte société du front

Root n'a pas d'`id_societe` → `getCurrentCompanyId()` renvoie `null` → les appelants forcent
`0` (`salesDevisApi.js:33-39`, `printTemplateApi.js:40,46,63`, `gestionEtatApi.js:68,86,108`).
Les modèles d'impression, les états et les documents de vente arrivent vides pour Root.

Aucun sélecteur de société n'existe : `SocieteSelector|CompanySelector` → 0 résultat, et aucun
des 63 slices Redux ne porte de société courante.

### 19. Redirection après connexion aveugle au rôle

`thunk.js:47` et `:68` → `navigate("/")` sans condition. `HomePage` déclenche 8 appels
Structure. Un compte Root ou User atterrit sur un tableau de bord dont plusieurs appels
reviendront vides ou en 403.

### 20. L'internationalisation est un squelette

26 clés par langue. **29 fichiers sur 1321** importent `useTranslation`, soit 2,2 % — et
uniquement les écrans de géographie. Tout l'ERP est en français en dur, libellés de menu
compris. Basculer en arabe ne change ni les écrans ni le sens de lecture.

### 21. Deux API sans redirection HTTPS

`StructureAPI/Program.cs:356-359` et `TresorerieAPI/Program.cs:186-189` n'appellent pas
`UseHttpsRedirection`, présent dans les 8 autres. Jeton porteur en clair si le client attaque
en HTTP.

### 22. CORS figé sur des valeurs de développement

`AchatAPI/Program.cs:173-176` et `VenteAPI/Program.cs:153-156` :
`WithOrigins("http://localhost:3000", "https://votre-domaine-frontend.com")` + `AllowCredentials()`.
Le domaine de production est un texte de remplacement jamais renseigné. Toutes les sections
`Cors:AllowedOrigins` des appsettings ne listent que `localhost`.

### 23. Configuration du front incomplète

`API_URL_COMPANY` (port 30271) : **0 usage**, clé morte. `API_URL_ABONNEMENT` : **absente de
`config.js`** alors que « consulter son abonnement » est un droit SuperAdmin attendu — le front
n'a aucun moyen d'appeler cette API. `.env` ne définit que 4 des 11 bases, et sa première ligne
définit `REACT_APP_API_URL`, que `config.js` ne lit pas.

`nginx.conf` n'a aucun bloc `location /api` et `.gitlab-ci.yml:29` lance `docker build` sans
`--build-arg` — **à vérifier côté infra** avant conclusion.

---

## Ce qui est sain, et mérite d'être dit

- **Validation JWT** : `ValidateIssuer`, `ValidateAudience`, `ValidateIssuerSigningKey`,
  `ValidateLifetime` tous à `true`, `ClockSkew = Zero`, HMAC-SHA256 vérifié explicitement à la
  relecture — pas de faille `alg: none`.
- **Jetons de rafraîchissement** : 64 octets d'aléa cryptographique, **rotation à chaque
  usage**, révocation tracée.
- **Mots de passe** : PBKDF2 d'ASP.NET Identity, aucun hachage maison, verrouillage après 5
  échecs.
- **Injection SQL** : aucune concaténation de données utilisateur dans tout le dépôt.
  `FromSqlInterpolated` (paramétré par EF), `NpgsqlCommand` avec `AddWithValue`, et le tri
  dynamique de `DocumentHistoriqueRepository` passe par une liste blanche.
- **Fuite d'erreurs** : aucun `UseDeveloperExceptionPage`, Swagger systématiquement sous
  `IsDevelopment()`, aucun mot de passe ni jeton journalisé.
- **Front** : aucune URL absolue en dur — les 11 bases passent toutes par `config.js`. Et le
  front délègue correctement le filtrage société au back (`Articles/by-societe` sans paramètre).
- **Production** : la seule solution qui vérifie ses droits endpoint par endpoint, et la seule
  dont les 60 entités portent déjà une colonne société.

---

## Plan de correction

### Lot 0 — Urgences (avant toute autre chose)

| # | Action | Dépend de |
|---|---|---|
| 0.1 | Corriger la traversée de chemin de `DocController.Download` | — |
| 0.2 | Générer une clé JWT aléatoire par environnement, hors dépôt ; révoquer l'actuelle | — |
| 0.3 | Créer un rôle PostgreSQL restreint par base ; retirer `postgres`/`Demo123*` | — |
| 0.4 | Révoquer le mot de passe SMTP `support@gst.com.tn` | — |
| 0.5 | Sortir tous les secrets des `appsettings*.json` ; ajouter la règle `.gitignore` | 0.2–0.4 |
| 0.6 | Purger l'historique git des secrets | 0.5 |
| 0.7 | Faire échouer le filtre de permissions en mode **fermé** (403/503) | — |
| 0.8 | Réactiver `AuthProtected` côté front | — |
| 0.9 | Filtrer type et taille au téléversement (reprendre `ModeleImpressionController`) | 0.1 |

> 0.1 et 0.2 sont indissociables : tant que l'un des deux tient, la chaîne est ouverte.

### Lot 1 — Mesurer les bases *(scripts livrés, à exécuter)*

| # | Action |
|---|---|
| 1.1 | `A1_audit_generique.sql` sur les 12 bases, une par une |
| 1.2 | `A2_audit_subscription.sql` sur Subscription |
| 1.3 | `A3_audit_identity.sql` sur Identitydb |
| 1.4 | Synchroniser `develop` — sans quoi AppelOffre, Btp et Dao restent hors périmètre |

### Lot 2 — Réaligner le front sur le back

| # | Action | Dépend de |
|---|---|---|
| 2.1 | Exposer `GET /me/permissions` côté back | — |
| 2.2 | Charger les droits au login dans un slice Redux ; `getDroits()` lit cet état | 2.1 |
| 2.3 | Ajouter `root` à `ROLE_TOUT_PUISSANT` ; corriger l'empreinte de mémoïsation | 2.2 |
| 2.4 | Ajouter `roles:` aux 13 entrées de menu réservées ; corriger `ProfileDropdown` | — |
| 2.5 | Rejeter un `Error` enrichi (`status`, `data`) au lieu d'une chaîne | — |
| 2.6 | Slice société + sélecteur dans l'en-tête, option « Toutes » réservée à Root | — |
| 2.7 | Redirection après connexion selon le rôle | 2.2 |
| 2.8 | Ajouter `API_URL_ABONNEMENT`, retirer `API_URL_COMPANY`, compléter `.env` | — |

### Lot 3 — Étendre le cloisonnement, par effort croissant

| # | Solution | Effort | Blocage |
|---|---|---|---|
| 3.1 | GestionEtat | faible | aucun — 1/1 entité couverte |
| 3.2 | Stock | faible | rendre le contexte `partial` |
| 3.3 | Tresorerie | faible | 1 entité à compléter (`ReglementImputation`) |
| 3.4 | Production | moyen | `ConfigureBaseEntity` pose déjà un filtre — **à fusionner, pas à ajouter** |
| 3.5 | Vente | moyen | créer `ICurrentUserService` ; migration pour 7 tables de lignes |
| 3.6 | Abonnement | lourd | 11 entités à doter ; nom `CompanyNumber` à réconcilier |
| 3.7 | Achat | lourd | 21 entités, aucune colonne ; migration + reprise de données |
| 3.8 | Finir `Article.ArRef` — `ArtGamme` a besoin d'une colonne société | moyen | C7 s'est arrêté là |
| 3.9 | Filtrer `Companies` avec la chaîne `parent_id` des sous-sociétés | moyen | — |

> 3.4 est un piège : un second `HasQueryFilter` **remplace** le premier. Poser le filtre société
> sur Production sans fusionner effacerait le filtre de suppression logique des 60 entités.

### Lot 4 — Robustesse

| # | Action |
|---|---|
| 4.1 | `ValidationBehavior` MediatR dans les 10 solutions — débloque 63 validateurs existants |
| 4.2 | Validateurs sur les 335 commandes Create/Update |
| 4.3 | Gestionnaire d'exception global pour `SubscriptionAPI` |
| 4.4 | `xmin` en jeton de concurrence sur les entités modifiables ; 409 sur conflit |
| 4.5 | Transactions sur les 23 méthodes à écritures multiples |
| 4.6 | `PagedRequest` partagé plafonné à 100 ; paginer les `GetAll` |
| 4.7 | Suppression logique sur les routes `Delete` métier |
| 4.8 | Limitation de débit sur `login`, `register`, `forgot-password`, `refresh-token` |
| 4.9 | `UseHttpsRedirection` sur Structure et Tresorerie ; CORS par configuration |

### Lot 5 — Dette

| # | Action |
|---|---|
| 5.1 | DTO de sortie pour les 240 requêtes qui exposent une entité |
| 5.2 | Enveloppe de réponse unique dans un projet partagé |
| 5.3 | i18n par domaine — commencer par le menu |
| 5.4 | 28 slugs en collision entre solutions (`facturelignes.create` = Achat + Vente) |
| 5.5 | Statuer sur `ERPNEW` : coquille, passerelle ou résidu |

---

## Ce qu'il faut décider

1. **Lot 0 d'abord, ou en parallèle du reste ?** Mon avis : 0.1 + 0.2 avant tout — la chaîne de
   compromission rend tout le reste théorique.
2. **`register` ouvert** : le laisser public, ou le réserver à une invitation ?
3. **Achat** : ajouter la société aux 21 entités, ou l'assumer mono-société à court terme ?
4. **i18n** : trois langues réellement, ou français seul et on retire le sélecteur ?
