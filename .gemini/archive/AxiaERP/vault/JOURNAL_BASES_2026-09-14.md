# Journal des bases — ce qui a été exécuté, et ce que ça a changé

**14 septembre 2026** · reconstitué depuis les fichiers présents sur disque et les résultats
que tu m'as renvoyés à chaque étape

---

## 1 · Pourquoi Root ne voit plus Production dans le menu, et pas admin@axiasolution

**C'est nous qui l'avons causé, en corrigeant autre chose.**

`erp-front/src/helpers/permissions.js` :

```js
const ROLE_TOUT_PUISSANT = "superadmin";                                   // ligne 34
toutPuissant: roles.some((r) => r.toLowerCase() === ROLE_TOUT_PUISSANT)    // ligne 113
const permissions = new Set(enListe(charge?.permission)...)                // lignes 100-102
hasPermission = (slug) => toutPuissant || permissions.has(slug)            // ligne 126
```

Et le fichier le dit lui-même, ligne 26 :

> « Attention : "Root" n'est pas "superadmin". Un rôle nommé Root doit porter ses permissions
> explicitement, sans quoi il n'a rien. »

Deux chemins, donc :

| Compte | Rôle | `toutPuissant` | Source des droits | Résultat |
|---|---|---|---|---|
| `admin@axiasolution.tn` | SuperAdmin | **vrai** — égalité exacte | jamais consultée | menu complet |
| `a.boukadida@gst.com.tn` | Root | **faux** — « root » ≠ « superadmin » | claim `permission` du jeton | **menu vide** |

Root n'a jamais été dans `ROLE_TOUT_PUISSANT`. Ce n'était pas un problème tant qu'il portait ses
1258 droits en claims dans le jeton : `permissions.has(slug)` répondait vrai.

Puis on a retiré ces claims du jeton, pour régler les « 431 Request Header Fields Too Large » —
1258 claims faisaient un en-tête d'environ 50 Ko, Kestrel plafonne à 32 Ko. **La seule source de
droits de Root a disparu avec eux.** Le `Set` est désormais toujours vide, `hasPermission()`
renvoie faux pour tout slug, et `filtrerSurDroits` retire chaque entrée portant un `droit:`.

L'entrée de domaine « Production » porte `droit: TOUS_LES_DROITS` (`navigationRegistry.js:388`).
Elle est donc retirée entièrement, avec ses sous-menus — 24 entrées sur 204 portent un `droit:`,
toutes dans Production, Maintenance et Qualité. Les 180 autres n'ont aucune contrainte : elles
restent visibles pour tout le monde.

SuperAdmin n'a rien vu passer parce qu'il n'a jamais eu besoin des claims : le raccourci de la
ligne 113 le couvrait déjà.

**Correction** — c'est B2 et B3 du plan : charger les droits depuis `GET /Me` au login dans un
slice Redux, et ajouter `root` à `ROLE_TOUT_PUISSANT`. Les deux sont nécessaires : le second
seul remettrait Root debout, mais laisserait Admin et Manager sans droits.

---

## 2 · Pourquoi admin@axiasolution reçoit des 404 sur Production

Rien à voir avec les droits — il les a tous. Ce sont des **routes que le front appelle et que le
back n'expose pas**. Matrice complète des 25 ressources déclarées par `crud()` dans
`productionService.js`, confrontée aux 123 routes réelles de ProductionAPI :

| Manque | Nombre | Effet réel |
|---|---|---|
| `GET …/exists` | **19 ressources sur 25** | 404 |
| `GET /Nomenclatures/{id}` | 1 | 404 |
| `POST`, `PUT`, `DELETE` sur `Besoins` | 3 | **aucun** — jamais appelées, les besoins se calculent par `POST /Besoins/calculer` |

Six ressources seulement ont leur `exists` : `Sites`, `MotifsArret`, `PostesCharge`,
`Equipements`, `Equipes`, `Operations`.

Mais `exists` n'est appelé qu'à un seul endroit — `useAutoCode`, via
`GenericResourceFormModal` — et ce composant n'est utilisé que par **trois écrans** :

```
Gammes/GammesTablePage.js
Nomenclatures/components/NomenclatureFormModal.js
Operateurs/OperateursTablePage.js
```

Aucun des trois n'a son `exists` côté back.

**Ce qu'il voit concrètement :**

- il tape un code dans le formulaire de création d'une **Gamme**, d'un **Opérateur** ou d'une
  **Nomenclature** → `GET .../exists` → 404, et l'indicateur « code disponible » ne répond
  jamais ;
- il ouvre le détail d'une **Nomenclature** → `GET /Nomenclatures/{id}` → 404.

**Quatre routes à ajouter**, pas dix-neuf : `Gammes/exists`, `Operateurs/exists`,
`Nomenclatures/exists`, `GET /Nomenclatures/{id}`. Le modèle existe déjà sur les six
contrôleurs qui l'implémentent.

---

## 3 · Ce qui a été exécuté sur les bases

### Subscription — le catalogue commercial

| Script | Effet |
|---|---|
| `A3_inserer_permissions_manquantes` | 396 permissions ajoutées → **898 → 1294** (178 parents, 1116 endpoints) |
| `A4_functions_et_modules` | Suppression puis reconstruction : **95 functions**, **36 modules**, 178 `functions_permissions`, 95 `modules_functions` |
| `S1_packs_nouveaux_modules` | 18 nouveaux modules entrés progressivement dans les packs (Demo → VIP) → 111 `packs_lines` |
| `S8_subscription_roles_permissions` | Droits des rôles du catalogue |

Vérifié le 11/09 par `A2_audit_subscription` : la chaîne tient de bout en bout — 0 parent sans
function, 0 function hors module, 0 module vide, 0 abonnement sans fonctionnalité.
**Restent 4 points** : 1 module dans aucun pack, 1 pack sans module, 1 rôle sans droit, et
**64 permissions au slug en double**.

### Identitydb — ce que la connexion lit réellement

| Script | Effet |
|---|---|
| `S2_identity_permissions` · `S6_identity_catalogue_complet` | Reconstruction des droits par société → **7003 lignes** (sociétés 2, 3, 6, 26, 27 + global) |
| `S3_identity_roles` · `S7_identity_correctifs_roles` | **21 rôles** : Root, SuperAdmin, Admin, Manager, User par société |
| `S4_identity_role_permissions` | **18 224 liens** rôle↔droit, remplaçant les 1908 précédents |
| `S5_identity_user_roles` | Rattachement des comptes ; c'est là que `Admin@axiasolution.tn` a retrouvé un rôle — il n'en avait **aucun** |
| `S9_purge_droits_orphelins` | Nettoyage |
| `A1b_root_pour_admin_axiasolution` | Attribution du rôle |
| `D2_deverrouiller_compte_essai` | Déverrouillage de `s.gharbi`, verrouillé par mes propres tests |

Vérifié le 11/09 par `A3_audit_identity` : **0 compte sans rôle, 0 lien orphelin, 0 doublon
réel, 0 compte rattaché au rôle d'une autre société.** Les 5 rôles sans droit sont les rôles
`User` — conforme à ta règle.

### Structure — le référentiel

| Script | Effet |
|---|---|
| `C1_societe_27_manquante` | Société 27 créée dans `companies` |
| `C3_rattacher_lignes_orphelines` | `id_societe = 3` sur toutes les lignes qui n'en avaient pas, **41 tables** — dont 81 emplacements, 9 employés, 4 fournisseurs |
| `C4_semer_reference_26_27` | **13 tables de référence copiées** vers les sociétés 26 et 27 : devises, unités, taxes, natures, statuts de document, journaux, paliers, qualifications, fonctions, numérotation, modèles d'impression, types de nature, pièces |
| `C6_elargir_contraintes_societe` | **17 contraintes d'unicité élargies** à la société — un code n'est plus unique sur toute la base mais par société |
| `C7` | **Arrêté sans rien modifier** : `ArtGamme` référence `Article(ArRef)` et n'a pas de colonne société |
| `D0_documents_societe` | **Aucun effet** — la colonne n'existe pas encore, le script l'a dit et s'est arrêté |

Puis `Cloisonnement:Enforce` est passé à `true` dans `StructureAPI/appsettings.json`, et les
26 tests Playwright sont passés.

### Cette nuit — les migrations

| Base | Ce qui s'est passé |
|---|---|
| Ventes · Achat · GestionEtat | `__EFMigrationsHistory` **créée, vide**. La migration `Depart` a échoué sur `relation already exists` et **s'est intégralement annulée** — le DDL PostgreSQL est transactionnel. Aucune table touchée. |
| Subscription | **Rien** : `More than one DbContext was found`. L'API en enregistre trois. |

Cause : les quatre commandes ont été collées d'un bloc, donc l'étape de vidage du `Up()` a été
sautée. Les `Up()` et les `Down()` sont vidés depuis, et les `Controle` parasites supprimés.

### Lecture seule — n'ont rien modifié

`A1_audit_generique` (12 bases) · `A2_audit_subscription` · `A3_audit_identity` ·
`G0_etat_migrations` · `C2` et `C2b` · `C5` · `D1` · `A1_arbre_societes` ·
`A2b`, `A4a`, `A5a`, `A6a`, `A6b` (exports) · les diagnostics du 09/09.

---

## Ce qui reste ouvert sur les bases

| | |
|---|---|
| **Achat** | 22 tables, **aucune colonne société** — 210 lignes seulement, c'est un changement de schéma, pas une reprise de données |
| **Ventes** | 6 tables de lignes sans société (53 lignes) · 6 contraintes sur `piece` bloquantes |
| **Subscription** | 64 slugs en double · 1 module hors pack · 1 pack vide · 1 rôle sans droit |
| **Structure** | `Article.ArRef` encore unique globalement · documents sans société |
| **AppelOffre · Btp · Dao** | 64 tables, aucun code local — hors périmètre tant que le sync n'a pas eu lieu |

Aucune de ces bases n'a d'orphelin de clé étrangère. Vérifié sur les douze.
