# Fusion de develop — commandes à lancer

## Pourquoi vous, et pas moi

J'ai lancé la fusion et elle n'a pas abouti : chacune de mes commandes est plafonnée à environ
trois minutes, et `E:` m'est présenté par un montage réseau. Sur les 542 fichiers de develop, même
un simple `git status` dépasse ce plafond. Sur votre poste, `E:` est un disque local — l'opération
prend quelques secondes.

**Rien n'a été abîmé.** J'ai vérifié : pas de `MERGE_HEAD`, index inchangé (09:22, antérieur à ma
tentative de 09:42), et aucun fichier propre à develop présent sur le disque — `GestionEtatAPI`,
`AchatAPI/Controllers/BonAvoirEntetes`, `StockAPI/Controllers/StockDocumentsController.cs` sont
tous absents. Le dépôt est propre sur `626071d`. J'ai aussi posé une branche de sécurité,
`Ahmed-avant-merge-2026-09-10`, qui pointe sur l'état d'avant.

## Ce que la fusion va faire

J'ai calculé l'intersection des fichiers touchés de part et d'autre — ça ne lit que les objets
git, donc c'était à ma portée.

| | nos commits | develop | fichiers en commun |
|---|---:|---:|---:|
| **back** | 32 fichiers | 542 fichiers | **0** |
| **front** | 41 fichiers | 75 fichiers | **1** |

**Le back fusionne sans un seul conflit.** Le front en a exactement un, `src/config.js`, et il est
déjà résolu dans `config.js.resolu` à la racine.

---

## Back

```powershell
cd E:\AxiaProjects\AxiaERP\erp-back
git merge origin/develop --no-edit
git push origin Ahmed
```

24 commits arrivent, dont ceux qui changent la surface d'API :

- **`GestionEtatAPI`, une solution entièrement nouvelle** — `EtatDefinitionsController`,
  `WidgetsController`. Ça fera onze solutions au lieu de dix.
- **14 contrôleurs Achat** : BonAvoir, BonCommande, BonReception, BonRetour, FactureAvoir,
  FactureComptabilisee, Facture, FactureRetour — entêtes et lignes.
- **4 contrôleurs `Reporting/ReportingQueryController.cs`**, dans Stock, Structure, Tresorerie
  et Vente.
- **3 contrôleurs Stock** : ArticleStockConfigs, StockDocuments, Stocks.

## Front

```powershell
cd E:\AxiaProjects\AxiaERP\erp-front
git merge origin/Develop --no-edit
```

La fusion s'arrêtera sur `src/config.js`. Alors :

```powershell
copy /Y E:\AxiaProjects\AxiaERP\config.js.resolu E:\AxiaProjects\AxiaERP\erp-front\src\config.js
git add src/config.js
git commit --no-edit
git push origin ahmed
```

### Ce que ce conflit cachait

develop conserve les ports d'origine : **63601** pour Vente, **64581** pour Production, **64569**
pour Stock. Ces trois-là tombent dans les plages que Windows réserve dynamiquement sur votre poste
(63533–63632 et 64537–64636) — c'est précisément la cause des échecs de démarrage de Kestrel qu'on
a mis du temps à identifier. Prendre la version de develop les réintroduirait, et le projet
cesserait de démarrer en local.

develop apporte en revanche une ligne que nous n'avions pas : `API_URL_GESTIONETAT`, sur le port
7501 — hors plages réservées, donc gardée telle quelle.

La résolution est donc : **nos ports, plus leur ligne.** C'est ce que contient `config.js.resolu`.

---

## Ensuite : ré-extraction

```powershell
cd E:\AxiaProjects\AxiaERP\erp-back\scripts\extraction_apis
python extraire_apis.py --sortie apis_inventaire.json --csv apis_inventaire.csv
git diff --stat apis_inventaire.csv
```

Le `git diff` sur le CSV chiffre exactement ce que les 24 commits ont ajouté à la surface d'API.
C'est pour ça que le CSV est versionné et le JSON non.

Ne lancez pas encore `generer_permissions.py` : sa convention de nommage ne correspond pas à celle
déjà en place dans la base — voir le point suivant.
