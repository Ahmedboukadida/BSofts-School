# Transmission à l'équipe Structure — `DocumentController`

**12 septembre 2026** · relevé lors de l'audit de sécurité du 11/09 · trois défauts liés

Fichier : `erp-back/StructureAPI/Controllers/DocController.cs`
Classe : `DocumentController` — le nom du fichier et celui de la classe diffèrent, la route
réelle est donc `/api/Structure/Document/…` et non `/api/Structure/Doc/…`.

Ces trois points sortent du périmètre que je traite (Authentification, Subscription,
Production, Companies). Ils sont documentés ici pour être repris par qui maintient Structure.

---

## 1 · Lecture de n'importe quel fichier du serveur — le plus grave

**`DocController.cs:66-81`**

```csharp
[HttpGet("Download")]
public IActionResult Download(string chemin)
{
    var fullPath = Path.Combine(_env.ContentRootPath, chemin);   // ← ligne 72
    if (!System.IO.File.Exists(fullPath)) return NotFound(...);
    return PhysicalFile(fullPath, mime, fileName);
}
```

`chemin` vient de la chaîne de requête et n'est ni normalisé ni confiné. Deux failles dans la
même ligne :

- `..\` n'est pas filtré, donc on remonte l'arborescence ;
- `Path.Combine` **honore un chemin absolu** : si le second argument commence par `C:\` ou `/`,
  le premier est purement ignoré. Ce n'est pas un détail d'implémentation, c'est le
  comportement documenté.

**Reproduction** — n'importe quel compte authentifié, quelle que soit sa société et son rôle :

```
GET /api/Structure/Document/Download?chemin=..\appsettings.json
GET /api/Structure/Document/Download?chemin=C:\Windows\win.ini
```

Le premier renvoie la clé de signature JWT et la chaîne de connexion PostgreSQL. Comme la clé
est identique sur les dix API, cela permet de forger un jeton `role=Root` accepté partout.

**Correction**

```csharp
var racine = Path.GetFullPath(Path.Combine(_env.ContentRootPath, "uploads", "documents"));
var demande = Path.GetFullPath(Path.Combine(racine, chemin));

// GetFullPath résout « .. » AVANT la comparaison — c'est ce qui rend le contrôle fiable.
// Le séparateur final évite qu'un dossier « documents-public » passe le test de préfixe.
if (!demande.StartsWith(racine + Path.DirectorySeparatorChar, StringComparison.Ordinal))
    return NotFound("Fichier introuvable");
```

`NotFound` plutôt que `Forbid` : un 403 confirmerait à l'appelant que le chemin visé existe.

Plus sûr encore, si le temps le permet : ne plus accepter de chemin du tout, mais un
identifiant de document, et lire `CheminStockage` en base.

---

## 2 · Téléversement sans aucun filtre

**`DocController.cs:40-62`**

```csharp
var ext = Path.GetExtension(file.FileName).ToLowerInvariant();   // ← ligne 46
var physicalName = $"{Guid.NewGuid()}{ext}";
```

L'extension est reprise telle quelle du nom fourni par le client. Aucune liste blanche, aucun
plafond de taille, aucun contrôle du type MIME.

Le nom physique est un GUID, ce qui limite la portée — un fichier déposé n'est pas atteignable
par devinette. Mais combiné au point 1, il devient lisible dès qu'on connaît son chemin, et
`GetAllDocClient` le donne (voir point 3). Et sans plafond de taille, saturer le disque ne
demande aucun droit particulier.

**Correction** — le modèle existe déjà dans le dépôt, à reprendre tel quel :
`StructureAPI/Controllers/ModeleImpressions/ModeleImpressionController.cs:124-137` plafonne à
10 Mo et n'accepte que `jpg`, `jpeg`, `png`, `webp`. Ici la liste doit couvrir les types
déclarés dans `_mimeTypes` (lignes 17-30), et **seulement** ceux-là.

---

## 3 · Les documents ne sont pas cloisonnés par société

**`DocController.cs:83-88`, et les trois routes équivalentes pour Employé, Fournisseur,
Prospect**

```csharp
[HttpGet("GetAllDocClient")]
public async Task<IActionResult> GetAllDocClient()
    => Ok(await _mediator.Send(new GetAllDocClientQuery()));
```

Vérifié : **aucune** des quatre entités `DocumentsClient`, `DocumentsEmploye`,
`DocumentsFournisseur`, `DocumentsProspect` ne porte de propriété `IdSociete`. Elles échappent
donc au filtre de cloisonnement global posé le 11/09 sur `StructureDbContext`, qui ne s'applique
qu'aux entités ayant cette propriété.

Conséquence : un compte de la société 26 appelle `GetAllDocClient`, obtient la liste des
documents de **toutes** les sociétés avec leur `chemin_stockage`, puis les télécharge un à un.
Le point 1 n'est même pas nécessaire — les chemins sont fournis par l'API.

**Correction** — dans cet ordre, conformément à la règle retenue le 12/09 : propriété C#
d'abord, migration EF ensuite, données en SQL en dernier.

1. `public int? IdSociete { get; set; }` sur les quatre entités
2. `dotnet ef migrations add DocumentsIdSociete` puis `database update`
3. `UPDATE "DocumentsClient" SET "IdSociete" = 3 WHERE "IdSociete" IS NULL` — et de même pour
   les trois autres ; la société 3 est propriétaire de l'intégralité des données historiques,
   établi par l'audit du 11/09
4. Le filtre global les prendra alors en charge **sans autre modification** : il balaie les
   entités par réflexion sur la présence de `IdSociete`

Colonne **nullable avec valeur par défaut** : une colonne obligatoire ferait échouer tout
`INSERT` venant d'un code qui ne porte pas encore la propriété.

---

## Ordre suggéré

`1` d'abord — c'est le seul qui expose des fichiers hors application. `3` ensuite, parce qu'il
donne accès aux documents de tous les clients sans aucune astuce. `2` en dernier : réel, mais
son exploitation dépend des deux autres.

Aucun de ces trois points n'est corrigé à ce jour.
