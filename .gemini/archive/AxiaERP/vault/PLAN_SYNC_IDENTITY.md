# Plan — synchroniser Identity depuis Subscription

État relevé dans les 10 CSV. Rien n'est encore écrit.

---

## Ce que les données montrent

### 1. Les 18 nouveaux modules ne sont dans aucun pack

| pack | modules | APIs | couverture |
|---|---:|---:|---:|
| Basic *(retiré)* | 0 | 0 | 0 % |
| Demo | 5 | 233 | 20 % |
| Standard | 11 | 531 | 47 % |
| Premium | 14 | 632 | 56 % |
| Gold | 16 | 666 | 59 % |
| VIP | 17 | 687 | 61 % |

Le catalogue compte **1116 APIs sur 36 modules**. Les 18 modules créés hier en représentent
**332, soit 29 %**, et aucun pack ne les contient. Concrètement, personne ne peut acheter :

    Production 52 · Achat 134 · Abonnement 66 · Stock 38 · Tresorerie 38 · GestionEtat 7

Les trois sociétés abonnées ont toutes le pack VIP. Tant que ces modules n'y entrent pas,
synchroniser Identity ne changera rien pour Production : il n'y a rien à propager.

### 2. Les droits d'Identity sont distribués de façon très inégale

| société | droits |
|---|---:|
| 26 | 160 |
| 27 | 160 |
| NULL *(global)* | 58 |
| 2 | 9 |
| 3 | 9 |
| 6 | 9 |

Les sociétés 2, 3 et 6 ont neuf droits chacune. Or la société 3 — Gloulou Groupe — porte un
abonnement VIP et trois comptes. Elle ne peut accorder que ce qu'elle détient : ses rôles sont
donc structurellement incapables d'ouvrir quoi que ce soit.

### 3. Les noms de droits ne correspondent pas entre les deux bases

    Identity        module « StructureService », nom « deleteadressdeleteadressclient »
    Subscription    solution « Structure », slug « adress.deleteadressclient »

Les modules d'Identity — `StructureService`, `AuthService`, `Roles`, `Users`, `Encaissements`,
`Decaissements` — ne correspondent ni aux 10 solutions ni aux 36 modules. Un rapprochement
ligne à ligne est impossible : c'est un remplacement, pas une fusion. Et remplacer les droits
invalide les 1908 lignes de `RolePermissions`, qui devront être reconstruites.

### 4. Les comptes et les rôles

```
a.boukadida@gst.com.tn      soc=NULL   Root[global] + SuperAdmin[26] + SuperAdmin[27]
Admin@axiasolution.tn       soc=3      SuperAdmin[3]
admin@authservice.local     soc=3      SuperAdmin[3]
s.gharbi@gst.com.tn         soc=3      SuperAdmin[3]
ahmedboukadida.axia@gmail   soc=26     SuperAdmin[26]
ahmedboukadida.ts@gmail     soc=27     SuperAdmin[27]
a.karoui@gst.com.tn         soc=3      (aucun rôle)
m.chouchene@gst.com.tn      soc=3      (aucun rôle)
```

Quatre écarts avec ce que vous décrivez :

- **`a.boukadida` cumule trois rôles.** Root suffit : c'est le mode développeur, hors société.
  Les deux `SuperAdmin` sont d'ailleurs sans effet — son `IdSociete` est NULL, donc le filtre
  `r.IdSociete == user.IdSociete || r.IdSociete == null` les écarte tous les deux.
- **Trois `SuperAdmin` sur la société 3.** Un propriétaire d'entreprise, en principe un seul.
- **Six rôles n'ont aucun compte** : Admin[2], Admin[6], Admin[26], Admin[27], Manager[3],
  User[3].
- **Rôles manquants** : pas d'`Admin` sur la société 3 ; pas de `Manager` ni de `User` sur 2, 6,
  26 et 27.

### 5. Les sociétés 2 et 6 n'ont pas d'abonnement

Ce sont les sous-sociétés de 3 (Axia Solution et SOBIG). Elles portent des rôles mais aucun
abonnement propre. Elles héritent donc de celui de 3 — ce qui est cohérent avec « le Super
admin gère sa société et ses sous-sociétés », mais doit être écrit quelque part.

---

## Décisions nécessaires avant d'écrire le SQL

### D1 — Quels packs reçoivent les 18 nouveaux modules ?

Proposition, du plus petit au plus complet :

| pack | ajouts proposés |
|---|---|
| Demo | Stock Operations |
| Standard | + Purchase Requisitions, Purchase Orders & Receipts, Supplier Invoicing, Cash Management, Receipts & Payments |
| Premium | + Reporting & Dashboards, Customer Contracts, Recurring Billing, Internal Requests |
| Gold | + Production Master Data, Production Engineering, Shop Floor Execution |
| VIP | + Production Planning & MRP, Production Costing, Quality Management, Maintenance Management, Project & Site Works |

Un pack contient tout ce que contient le pack inférieur. Production entre à partir de Gold ;
la Production complète — planning, coûts, qualité, maintenance, chantiers — reste VIP.

### D2 — Les sous-sociétés ont-elles leurs propres lignes de droits ?

- **Option A** — chaque société, y compris 2 et 6, reçoit son jeu complet de droits, copié de
  l'abonnement de sa société racine. Simple à interroger, mais 5 × ~700 lignes.
- **Option B** — seules les sociétés abonnées (3, 26, 27) portent des droits ; les
  sous-sociétés utilisent ceux de leur parent. Moins de lignes, mais
  `GetUserPermissionsAsync` filtre sur `IdSociete` **sans remonter au parent** — il faudrait
  modifier le code.

Option A est la seule qui fonctionne sans toucher au back.

### D3 — Définition des cinq rôles

| rôle | société | droits |
|---|---|---|
| Root | NULL (global) | tout le catalogue, Subscription comprise |
| SuperAdmin | la sienne | tout ce que son abonnement ouvre, **sauf** la solution Subscription ; plus l'édition société et la lecture de son abonnement |
| Admin | la sienne | comme SuperAdmin, **sans** l'édition société ni l'accès abonnement |
| Manager | la sienne | lecture partout, écriture métier ; ni utilisateurs ni rôles |
| User | la sienne | aucun droit ; ils s'accordent un par un |

Distinction Admin / SuperAdmin telle que vous l'avez définie : l'Admin ne peut pas modifier les
informations de la société ni consulter l'abonnement.

### D4 — Que faire des comptes sans rôle ?

`a.karoui@gst.com.tn` et `m.chouchene@gst.com.tn`, société 3. Manager, User, ou on les laisse
sans rôle ?

---

## Ordre d'exécution

| # | fichier | base | effet |
|---|---|---|---|
| **S1** | `S1_packs_nouveaux_modules.sql` | Subscription | ajoute les 18 modules aux packs (D1) et propage aux 3 abonnements |
| **S2** | `S2_identity_permissions.sql` | Identity | vide `Permissions`, la reconstruit depuis Subscription, par société |
| **S3** | `S3_identity_roles.sql` | Identity | crée les 4 rôles manquants par société |
| **S4** | `S4_identity_role_permissions.sql` | Identity | reconstruit `RolePermissions` selon D3 |
| **S5** | `S5_identity_user_roles.sql` | Identity | un seul Root, chaque autre compte sur sa société |

S2 supprime des lignes auxquelles `RolePermissions` renvoie : S2 et S4 doivent donc s'exécuter
dans la même session, et S3 entre les deux. S1 est indépendant et peut passer avant.

**Après S5 : déconnexion et reconnexion obligatoires.** Les droits sont inscrits dans le jeton
à la connexion ; un jeton déjà émis ne les gagne pas.

---

## Ce qu'il me faut pour écrire ces fichiers

1. **D1** — la répartition des modules dans les packs. Ma proposition, ou la vôtre.
2. **D2** — option A ou B.
3. **D3** — validation des cinq définitions, en particulier ce que « Manager » recouvre.
4. **D4** — le sort des deux comptes sans rôle.

Sans D1, S1 ne peut pas s'écrire, et sans S1 la synchronisation ne propagera jamais Production
— il n'y aurait rien à propager.
