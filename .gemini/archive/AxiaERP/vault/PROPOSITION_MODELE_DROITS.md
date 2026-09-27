# Modèle de droits — proposition pour tenir la montée en charge

**14 septembre 2026** · chiffres mesurés sur le dépôt actuel, pas estimés

---

## Le problème n'est pas la sécurité, c'est la croissance

Le modèle actuel tient. Il grossit simplement sur **deux axes à la fois**, et les deux sont
ceux qui vont augmenter.

### Axe 1 — le catalogue est recopié par société

| | mesuré | à 100 clients | à 500 clients |
|---|---|---|---|
| Lignes dans `Permissions` (Identity) | **7 003** pour 5 sociétés | ~140 000 | ~700 000 |
| Lignes dans `RolePermissions` | **18 224** pour 5 sociétés | ~365 000 | ~1 800 000 |

Une permission est une **définition** — « lire un article » veut dire la même chose pour tous
les clients. La recopier par société multiplie un catalogue immuable par le nombre de clients.
Seuls les **octrois** (quel rôle a quoi) sont propres à un client.

### Axe 2 — une permission par endpoint

1321 routes aujourd'hui, 1116 permissions au grain de l'endpoint. **Chaque nouvelle route crée
une permission**, donc une migration, donc une reprise des octrois de chaque client.

C'est ça qui coûte cher. Ajouter `Articles.GetPagedBySociete` demande aujourd'hui : créer la
permission, la rattacher à une function, à un module, à un pack, puis l'accorder aux rôles
concernés **de chaque société**. Pour un endpoint qui ne fait rien de nouveau — lire des
articles.

### Axe 3 — résolution à chaque requête

Le résolveur interroge Identity par utilisateur et par société, avec un cache de 5 minutes.
À 8 API et 200 utilisateurs actifs, c'est environ 1 600 requêtes toutes les 5 minutes rien
que pour les droits — et une fenêtre de 5 minutes pendant laquelle un droit retiré agit encore.

---

## Le modèle proposé — cinq règles

### 1. Une permission = `solution:ressource:verbe`

```
structure:article:lire          production:gamme:publier
vente:facture:creer             subscription:pack:modifier
```

Trois effets immédiats :

- **Les 64 slugs en collision disparaissent** — `facturelignes.create` existe aujourd'hui pour
  Achat *et* pour Vente, et Identity n'a pas de colonne pour les distinguer. Accorder l'un
  accorde l'autre.
- **Un nouvel endpoint ne crée plus de permission.** `GetAll`, `GetById`, `GetPaged`,
  `GetPagedBySociete`, `Exists` partagent tous `…:lire`. On peut ajouter dix routes de lecture
  sans toucher au catalogue ni aux octrois.
- Le catalogue passe de 1321 à **760 permissions**, mesuré sur les routes réelles.

### 2. Le verbe est déduit, sauf pour les actions métier

Sur les 1321 routes actuelles :

| | nombre | part |
|---|---|---|
| Verbe déduit du nom de méthode | **1 158** | 87 % |
| Annotation manuelle nécessaire | **163** | 12 % |

Les 163 sont `Valider`, `Annuler`, `Publier`, `Cloturer`, `Calculer`, `Imputer`, `Decider`,
`Regenerate`… — précisément celles qui **doivent** avoir un droit distinct. On ne veut pas que
« qui peut modifier une facture » implique « qui peut la valider ».

```csharp
[HttpPost("{id:int}/publier")]
[Droit("production:gamme:publier")]        // explicite, parce que ce n'est pas du CRUD
public async Task<IActionResult> Publier(int id) { … }
```

**Règle de sûreté : une méthode non-CRUD sans attribut est REFUSÉE, pas autorisée.** C'est
l'inverse du défaut habituel, et c'est volontaire — l'oubli doit se voir tout de suite, pas
passer inaperçu pendant six mois.

### 3. Le catalogue devient global, les octrois restent par client

```
Permissions        760 lignes, UNE fois.  Plus de colonne IdSociete.
AspNetRoles        par société, comme aujourd'hui
RolePermissions    par société, mais pointe vers le catalogue global
```

Le nombre de lignes de `Permissions` devient **constant** quel que soit le nombre de clients.
7 003 → 760, et 700 000 → 760 à 500 clients.

### 4. Des jokers pour les octrois

```
*                          Root
structure:*                tous les droits sur Structure
production:gamme:*         tout sur les gammes
*:*:lire                   lecture seule, partout
```

Un rôle « responsable production » se décrit en 3 lignes au lieu de 130. Les octrois cessent
de croître avec le catalogue.

### 5. Résolution en mémoire, invalidée par version

Chaque API tient en mémoire une table `rôle → ensemble de permissions`, chargée au démarrage.
Une colonne `catalogue_version` est incrémentée à chaque modification d'octroi ; les API la
relisent toutes les quelques secondes — ou par `LISTEN/NOTIFY` PostgreSQL — et rechargent.

Les permissions sont **internées en entiers** : 760 permissions tiennent sur 760 bits, soit
**95 octets par rôle**. 500 clients × 5 rôles = 2 500 rôles = **240 Ko en mémoire**, pour la
totalité du système.

Le contrôle devient : union des rôles du jeton (un OU binaire), puis test d'un bit.

| | aujourd'hui | proposé |
|---|---|---|
| Requêtes base par contrôle | 1 par utilisateur × société × API, toutes les 5 min | **0** |
| Révocation d'un droit | effective sous 5 minutes | **immédiate** (version) |
| Coût du contrôle | requête SQL + comparaison de 1258 chaînes | **un test de bit** |
| Mémoire | cache par utilisateur, jusqu'à 1258 chaînes chacun | 240 Ko au total |

---

## Migration — cinq étapes, aucune bloquante

Rien ici n'exige de tout arrêter. Chaque étape laisse le système fonctionnel.

| # | Étape | Effet | Risque |
|---|---|---|---|
| 1 | Préfixer les slugs par la solution | Règle les 64 collisions | faible — c'est déjà décidé (D3) |
| 2 | Regrouper par `ressource:verbe`, table de correspondance ancien → nouveau | 1321 → 760 | moyen : un octroi mal reporté retire un droit |
| 3 | Retirer `IdSociete` de `Permissions` | 7 003 → 760 lignes | faible, une fois 2 fait |
| 4 | Attribut `[Droit]` sur les 163 actions métier, déduction pour le reste | Le catalogue cesse de croître | faible, mécanique |
| 5 | Catalogue en mémoire + version | Zéro requête par contrôle | moyen : c'est le cœur du contrôle d'accès |

L'étape 2 est la seule qui demande de la vigilance : il faut vérifier, client par client, que
l'ensemble des droits effectifs est identique avant et après. C'est vérifiable par calcul — on
compare les deux ensembles pour chaque rôle — et la campagne Playwright sert de filet.

---

## Ce qu'on perd, et qu'il faut assumer

**La granularité par endpoint.** On ne pourra plus accorder `Articles.GetPagedBySociete` sans
accorder `Articles.GetAll`. En pratique personne ne fait ça — mais si un cas métier l'exige un
jour, il faudra un verbe dédié plutôt qu'un retour au grain de l'endpoint.

**Les identifiants de permission deviennent structurants.** Avec un champ de bits, un
identifiant ne se réutilise jamais : une permission supprimée laisse un trou. C'est une
discipline, pas une contrainte technique.

**Le catalogue en mémoire est un point de défaillance unique par API.** S'il ne se charge pas
au démarrage, l'API doit **refuser de démarrer** — pas démarrer sans contrôle. Même logique que
le 503 posé hier sur le résolveur : ne pas savoir n'autorise pas.

**163 annotations à écrire à la main**, et chaque nouvelle action métier en demandera une. Le
refus par défaut fait que l'oubli se voit immédiatement.

---

## Ce que je ferais en premier

L'étape 1 est déjà décidée et débloque les collisions. L'étape 4 est celle qui arrête
l'hémorragie : tant que chaque endpoint crée une permission, chaque microservice ajouté
multiplie le travail d'administration.

Les étapes 3 et 5 sont celles qui font la différence à 100 clients. Elles peuvent attendre le
deuxième ou troisième microservice — mais pas le dixième.
