# G0 — remettre l'état des migrations d'aplomb

**12 septembre 2026** · bloque tout le flux D · les commandes sont à exécuter par Ahmed

---

## Pourquoi ce préalable existe

Tu as tranché : le schéma passe par une migration EF, les données par du SQL. C'est le bon
choix — il supprime la dérive du `ModelSnapshot`, qui était le risque le plus sérieux du plan
précédent.

Mais **ce choix n'est pas exécutable en l'état sur six solutions sur dix.** J'ai comparé les
fichiers de migration présents dans le code au contenu de `__EFMigrationsHistory` :

| Solution | Fichiers | En base | État |
|---|---|---|---|
| Production | 9 | 9 | **aligné** |
| Stock | 6 | 6 | **aligné** |
| Authentification | 2 | 2 (`Identitydb`) | **aligné** |
| Structure | 4 | **10** | 6 appliquées sans fichier |
| Tresorerie | **0** | **6** | appliquées, aucun fichier ni snapshot |
| Ventes | 0 | *table absente* | aucun système |
| Achat | 0 | *table absente* | aucun système |
| Subscription | 0 | *table absente* | aucun système |
| GestionEtat | 0 | *table absente* | aucun système |
| AppelOffre · Btp · Dao | *code absent* | 14 · 6 · 8 | appliquées par un code que je n'ai pas |

Sur les quatre bases sans table du tout, `dotnet ef migrations add` ne produirait pas un
`ALTER TABLE` : faute de `ModelSnapshot` auquel se comparer, il produirait un **`CREATE TABLE`
de toute la base**. Appliqué, il échoue sur des tables existantes — et s'il n'échouait pas, ce
serait pire.

---

## Étape 1 — lire ce que les bases déclarent

Joue `erp-back/scripts/audit_bases/G0_etat_migrations.sql` sur **Structure** et **Tresorerie**
d'abord. Ce sont les deux cas ambigus.

Envoie-moi les deux grilles. Ce que j'y cherche : les identifiants des migrations déclarées
appliquées mais dont le fichier manque. Un `InitialCreate` ancien ne raconte pas la même chose
qu'un `AddCaisseSolde` récent — dans le premier cas la base a été montée puis les fichiers
nettoyés, dans le second des fichiers ont été perdus et il faut les récupérer.

En parallèle, vérifie si l'historique git les contient encore :

```bash
cd erp-back
git log --oneline --diff-filter=D -- "StructureInfrastructure/Migrations/*"
git log --oneline --diff-filter=D -- "TresorerieInfrastructure/Migrations/*"
```

Si des suppressions apparaissent, les fichiers sont récupérables et c'est la voie à prendre —
restaurer vaut toujours mieux que reconstruire.

---

## Étape 2 — les trois solutions alignées : rien à faire

**Production, Stock, Authentification.** Le code et la base concordent. Les migrations y sont
sûres immédiatement, sans précaution particulière.

C'est aussi pourquoi Production est le bon terrain pour le premier essai du flux C.

---

## Étape 3 — poser une base de départ sur les quatre solutions sans système

**Ventes, Achat, Subscription, GestionEtat.**

Le principe : produire une migration qui décrit l'état *actuel*, puis la déclarer appliquée
sans l'exécuter. La base ne change pas ; ce qui change, c'est qu'EF sait désormais où elle en
est, et les migrations suivantes ne décriront que les écarts.

Pour **chacune** des quatre, en remplaçant `Vente` par `Achat`, `Subscription`, `GestionEtat` :

```bash
cd erp-back

# 1. Générer la migration de départ. Elle contiendra un CREATE TABLE de toute la base :
#    c'est normal et attendu à ce stade.
dotnet ef migrations add Depart -p VenteInfrastructure -s VenteAPI

# 2. VIDER LE CORPS DE Up() ET DE Down() — l'étape qui compte, et la seule à ne pas sauter.
#    Ouvre VenteInfrastructure/Migrations/<horodatage>_Depart.cs et remplace le contenu des
#    DEUX méthodes par un commentaire. Ne touche NI au .Designer.cs, NI au ModelSnapshot :
#    ce sont eux qui portent l'état du modèle.
#
#    Correction du 14/09 : j'avais écrit « ne touche pas à Down() ». C'était faux. Le Down()
#    généré contient un DropTable de TOUTES les tables de la base — « database update 0 »
#    aurait détruit l'intégralité des données. Une base de départ ne se révoque pas.
#
#    N'EXÉCUTE PAS LES QUATRE COMMANDES D'UN SEUL COLLAGE. Lancées d'affilée, l'étape 2 est
#    sautée et le « database update » tente de créer des tables qui existent déjà.

# 3. Appliquer. Crée __EFMigrationsHistory et y inscrit la ligne. Aucune table n'est touchée.
dotnet ef database update -p VenteInfrastructure -s VenteAPI

# 4. Vérifier que le modèle et la base concordent vraiment : cette commande doit répondre
#    qu'aucun changement n'est détecté. Si elle génère quoi que ce soit, le modèle C# et la
#    base divergent — NE L'APPLIQUE PAS, envoie-moi le fichier produit.
dotnet ef migrations add Controle -p VenteInfrastructure -s VenteAPI
```

L'étape 4 est le vrai contrôle. Une migration `Controle` vide prouve que la base de départ est
juste. Une migration `Controle` non vide dit exactement en quoi le code et la base diffèrent —
information précieuse, à me transmettre plutôt qu'à appliquer. Supprime ensuite le fichier
`Controle` dans les deux cas.

---

## Étape 4 — Structure et Tresorerie, après l'étape 1

Le traitement dépend de ce que montrent les grilles. Deux cas :

**Les fichiers sont récupérables dans git.** On les restaure, et les deux solutions rejoignent
le groupe aligné. Rien d'autre à faire.

**Ils ne le sont pas.** Alors on applique la procédure de l'étape 3, en retirant d'abord les
lignes orphelines de `__EFMigrationsHistory` — mais seulement une fois qu'on aura vu de quoi
il s'agit. Je n'écrirai ce script qu'avec les grilles sous les yeux : supprimer une ligne
d'historique sans savoir ce qu'elle recouvre, c'est exactement le genre de geste qui se paie
trois semaines plus tard.

---

## Étape 5 — la première migration réelle : les documents

Une fois Structure d'aplomb, la colonne société des quatre tables documentaires suit le chemin
normal. J'ai déjà ajouté les propriétés C# aux quatre entités.

```bash
dotnet ef migrations add DocumentsIdSociete -p StructureInfrastructure -s StructureAPI
```

**Avant d'appliquer, ouvre le fichier généré et lis `Up()`.** Il doit contenir **exactement
quatre `AddColumn<int>`**, sur `DocumentsClient`, `DocumentsEmploye`, `DocumentsFournisseur`,
`DocumentsProspect`, colonne `id_societe`, nullable.

S'il contient autre chose — une table créée, une colonne supprimée, un index modifié — c'est
que le `ModelSnapshot` ne reflète pas la base. **Ne l'applique pas, envoie-le-moi.** C'est
précisément le genre d'écart que cette relecture existe pour attraper, et l'appliquer
détruirait des données.

Si c'est propre :

```bash
dotnet ef database update -p StructureInfrastructure -s StructureAPI
```

Puis, dans pgAdmin sur la base **Structure** :

```
erp-back/StructureInfrastructure/manual_sql/2026-09-12_D0_documents_societe.sql
```

Il rattache les documents existants à la société 3 et affiche le compte par table. Ensuite le
filtre global les prend en charge **sans aucune autre modification** : il balaie les entités
par réflexion sur la présence de la propriété `IdSociete`.

---

## Ce que ça donne, dans l'ordre

```
1. G0_etat_migrations.sql sur Structure et Tresorerie   → m'envoyer les grilles
2. git log --diff-filter=D sur les deux dossiers        → m'envoyer la sortie
3. Base de départ sur Ventes, Achat, Subscription, GestionEtat
4. Structure et Tresorerie, selon 1 et 2
5. Migration DocumentsIdSociete + relecture + D0
```

Les étapes 3 et 5 sont indépendantes l'une de l'autre. Tu peux lancer 3 pendant que j'attends
les grilles de 1.
