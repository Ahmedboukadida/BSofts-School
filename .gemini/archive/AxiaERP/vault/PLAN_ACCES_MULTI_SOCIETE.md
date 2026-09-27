# Plan — droits, rôles et sélection de société

Rédigé après lecture du code fusionné (1321 routes, 11 solutions) et de l'état réel des deux
bases. À relire avant toute exécution.

---

## Ce que le code impose aujourd'hui

Quatre constats déterminent le plan. Les trois premiers sont des contraintes, le quatrième est un
défaut.

**1. Le jeton ne porte qu'une seule société.**

```csharp
// AuthentificationInfrastructure/Services/TokenService.cs:45
if (user.IdSociete.HasValue)
    claims.Add(new Claim("id_societe", user.IdSociete.Value.ToString()));
```

Une valeur, et seulement si elle existe. `Root` a `IdSociete = NULL` dans Identity : **le claim
n'est pas émis du tout pour lui**, et tous les filtres des modules comparent alors à `NULL`. Le
compte le plus privilégié du projet est aujourd'hui celui qui voit le moins de données.

**2. Les modules lisent la société du jeton et de nulle part ailleurs.**

```csharp
// ProductionAPI/Services/CurrentUserService.cs — commentaire d'origine
// Le corps de la requête n'est jamais consulté : c'est ce qui empêche un appelant
// de se déclarer d'une autre société.
```

C'est une propriété de sécurité voulue, et votre menu déroulant la contredit frontalement : il
demande au client de choisir la société. `helpers/companyContext.js` existe déjà côté front et
stocke un `companyId` en `sessionStorage` — mais **rien ne l'envoie au back, et le back
l'ignorerait**. Le sélecteur est décoratif dans l'état actuel.

**3. `superadmin` est une chaîne codée en dur.**

```csharp
private const string RoleSuperAdmin = "superadmin";
if (estSuperAdmin) return true;   // court-circuite tout contrôle de droit
```

Renommer ce rôle, ou l'écrire « SuperAdmin » dans une base et « superadmin » dans l'autre, ouvre
ou ferme silencieusement l'accès total. La comparaison est insensible à la casse, ce qui sauve la
mise — mais c'est un équilibre fragile pour un privilège de ce niveau.

**4. Il existe déjà une fuite entre sociétés.** `FamillesController` expose deux lectures :

```csharp
[HttpGet]              GetAll()          → aucun filtre de société, renvoie tout
[HttpGet("by-societe")] GetAllBySociete() → filtré sur _currentUserService.IdSociete
```

Il y a **85 méthodes `GetAll` dans 63 contrôleurs Structure**. Je n'ai vérifié que celle-ci ; il
faut les auditer une par une. Tant qu'une seule route non filtrée subsiste, le cloisonnement par
société est une convention, pas une garantie — et le sélecteur de société n'y changera rien.

---

## Deux points de votre cahier des charges qui ne passent pas tels quels

**« L'Admin ne peut pas voir les logs. »** Il n'existe aucun contrôleur de logs, d'audit ni de
journal d'activité dans le back — j'ai cherché sur les 165 fichiers de contrôleur. La distinction
Admin / Super admin ne peut donc reposer sur rien aujourd'hui. Soit on crée la fonctionnalité (un
chantier à part), soit on choisit un autre critère de distinction, soit Admin et Super admin
restent identiques et on l'assume.

**« L'Admin peut travailler sur le compte du Super admin. »** Cette phrase inverse la hiérarchie :
un subordonné qui modifie le compte de son supérieur peut s'octroyer ses droits, donc la
distinction disparaît à la première utilisation. Je l'ai lue comme une coquille et j'ai supposé
l'inverse — le Super admin gère les comptes Admin. **À confirmer**, parce que le reste en dépend.

---

## La décision qui bloque tout le reste

« All » et le basculement entre sociétés sont impossibles avec un claim `id_societe` unique.
Trois façons d'en sortir :

### A. Ré-émettre le jeton à chaque changement de société

Le front appelle `POST /Auth/switch-company/{id}`, le back vérifie que la société est permise et
renvoie un jeton neuf.

- Conserve intacte la propriété « la société vient du jeton, donc le client ne peut pas mentir ».
- Aucun filtre à réécrire : `IdSociete` reste un `int?`.
- **« All » reste impossible** — un jeton ne peut porter qu'une société. Root verrait une société
  à la fois.
- Un aller-retour par bascule, et le jeton précédent reste valide jusqu'à expiration.

### B. Liste des sociétés permises dans le jeton, société choisie par en-tête *(recommandé)*

Le jeton porte `societes_autorisees: [3,26,27]`. Chaque requête envoie
`X-Societe-Courante: 26`, ou rien pour « All ». Le back **valide que la valeur demandée est dans
la liste du jeton** — le client choisit, mais seulement dans ce qu'on lui a accordé.

- Seule option qui rend « All » possible.
- Le client ne gagne aucun pouvoir : la liste est signée dans le jeton.
- **Coût réel** : `IdSociete` devient un couple *(société courante, sociétés autorisées)*, et tout
  filtre `WHERE id_societe = X` devient `IN (…)`. Il y a **117 usages dans 22 contrôleurs
  Structure** plus les dépôts et les autres solutions. C'est le gros du travail.

### C. Faire confiance au client

Non. À mentionner seulement pour dire que c'est exclu.

**Je recommande B**, parce que « All » figure dans votre cahier des charges et que A ne peut pas
le fournir. Mais B est un refactor de plusieurs jours, et A se livre en une demi-journée. Si
« All » peut attendre, A débloque le multi-société tout de suite et B se fait ensuite sans rien
jeter : la liste des sociétés autorisées est utile dans les deux cas.

---

## Phases

### Phase A — les données (bases)

| | | dépend de |
|---|---|---|
| **A1** | Relevé lecture seule : arbre des sociétés, `AspNetUsers`, `AspNetRoles`, `AspNetUserRoles`, `Permissions` d'Identity | — |
| **A2** | Régénérer les permissions **à votre convention** (`auth.login`, racine par contrôleur) depuis les 1321 routes, et réconcilier avec les 898 existantes | A1 |
| **A3** | Ajouter les 5 solutions absentes du catalogue : Achat, Stock, Tresorerie, Abonnement, GestionEtat | A2 |
| **A4** | Câbler Production : 18 `functions`, 52 `functions_permissions`, un module, ses `packs_lines`, ses `subscriptions_features` | A2 |
| **A5** | Définir les 5 rôles dans les deux bases, et leurs droits | A2, A4 |
| **A6** | Synchroniser Identity depuis Subscription | A5 |

Sur A2, le point important : la base utilise **votre** schéma à deux niveaux — une racine par
contrôleur (`auth`, id 509), un enfant par endpoint (`auth.login`). Mon générateur avait inventé
trois niveaux et d'autres slugs ; exécuté tel quel il aurait **dupliqué les 898 lignes au lieu de
les réconcilier**. Je le réécris à votre convention. Les 52 slugs Production (`production.of.lire`
…) restent intouchés : ils sont comparés à la lettre dans le code.

Sur A5, l'état actuel : Subscription contient `superadmin` (896 droits), `admin`, `manager`,
`user` — ces trois derniers à **zéro droit** — et **aucun `root`**. Identity contient `Admin` en
cinq exemplaires (sociétés 26, 2, 27, 6, 3), `Root` (société NULL), `SuperAdmin` (27 et 26),
`Manager` et `User` (société 3). Les deux jeux ne se correspondent pas, et rien ne les
synchronise.

### Phase B — jeton et cloisonnement back

| | | dépend de |
|---|---|---|
| **B1** | Trancher A ou B ci-dessus | vous |
| **B2** | `TokenService` : rôle, sociétés autorisées, permissions | B1, A6 |
| **B3** | `CurrentUserService` : société courante validée contre la liste du jeton | B2 |
| **B4** | **Audit des 85 `GetAll`** et pose du filtre manquant | B3 |
| **B5** | Fermer les 164 routes non protégées (Abonnement 66, Subscription 97, ERPNEW 1) | — |

B5 est indépendant et peut partir tout de suite. Il est plus urgent qu'il n'y paraît : parmi ces
97 routes Subscription ouvertes sans jeton se trouvent `PermissionsController`, `RolesController`
et `RolePermissionsController`, en GET, POST, PUT et DELETE. **Ce sont les tables que la phase A
va remplir.** Les peupler sans fermer ces routes, c'est ranger derrière une porte ouverte.

### Phase C — front

| | | dépend de |
|---|---|---|
| **C1** | `CompanyProvider` (contexte React) à partir de `helpers/companyContext.js`, qui existe déjà | B2 |
| **C2** | Intercepteur axios qui envoie la société choisie à chaque requête | C1, B3 |
| **C3** | Menu déroulant des sociétés dans l'en-tête, avec les règles d'affichage par rôle | C1 |
| **C4** | Connexion : rôle → société → permissions → redirection (opérateur vers le terminal) | C1 |
| **C5** | Filtrage du menu par permissions | B2 |

Sur C3, vos règles telles que je les ai comprises :

| rôle | comportement |
|---|---|
| Root | « All » par défaut, toutes les sociétés dans la liste |
| Super admin / Admin, plusieurs sociétés | « All » par défaut, bascule entre les sous-sociétés |
| Super admin / Admin, une seule société | aucun menu — la société est fixée |
| Manager / User | aucun menu — société imposée |

`Company.ParentId` existe déjà en base, donc l'arbre société / sous-sociétés est représentable
sans changement de schéma.

### Phase D — vérification

| | |
|---|---|
| **D1** | Requête qui prend un e-mail et déroule toute la chaîne : compte → sociétés → rôles → droits → fonctions → modules → abonnement |
| **D2** | Test de fuite : un compte de la société 26 ne doit rien obtenir de la société 27, sur chaque `GetAll` |

D2 est la seule preuve que le cloisonnement tient. Sans elle, on aura déplacé le problème sans
savoir s'il est réglé.

---

## Ordre de livraison proposé

1. **A1** — vous lancez un script de lecture, je vois enfin les comptes et l'arbre des sociétés.
2. **B5** — fermer les 164 routes ouvertes. Indépendant, rapide, et à faire avant de remplir les
   tables de droits.
3. **A2 → A3 → A4** — le catalogue : réconcilier, compléter, câbler Production.
4. **A5 → A6** — les rôles, puis la synchronisation d'Identity.
5. **B1** décidé, puis **B2 → B3 → B4**.
6. **C1 → C5**.
7. **D1, D2**.

Chaque étape touchant les données suit la même règle : je livre d'abord un script de lecture, vous
me collez la sortie, puis j'écris le script de mise à jour. Deux allers-retours par étape.

---

## Ce dont j'ai besoin pour continuer

1. **A ou B** pour le jeton — c'est la décision qui conditionne les phases B et C.
2. **La distinction Admin / Super admin** : créer les logs, choisir un autre critère, ou les
   traiter à l'identique ?
3. **Confirmation** que c'est bien le Super admin qui gère les comptes Admin, et non l'inverse.
4. **Le relevé A1**, dès que le script est prêt.
