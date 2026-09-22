# Changelog

Toutes les évolutions notables de CyberGardien sont consignées dans ce fichier.

Le format s'inspire de [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/) et le projet suit le [versionnage sémantique](https://semver.org/lang/fr/). Tant que la version est en `0.x`, une version mineure peut introduire des changements incompatibles ; ils sont signalés par **⚠️ Incompatible**.

## [Non publié]

### Ajouté
- Suite de tests du moteur avec le runner intégré à Node.js (`npm test`) : parsing, alias, exécution, chaque verdict de `testExo`, test d'intégration sur `niveau1.js`.
- Vérification automatique de chaque exercice listé dans `config.json` : fichier présent, format lisible, cas de test bien formés, fonction `@testable` existante.
- Vérification des fichiers référencés par `cybergardien.html`.
- `chargerFonction(code, nom, aliases)` : exécute le code de l'exercice et renvoie la fonction nommée, en laissant le moteur JavaScript lire le code.
- Un exercice peut contenir plusieurs fonctions, des fonctions fléchées et des noms accentués.
- Un exercice défectueux (fichier introuvable, tag manquant, JSON invalide…) est remplacé par une section d'erreur au lieu de bloquer l'affichage des suivants.
- Messages d'erreur explicites pour un marqueur `@STUDENT-START` / `@STUDENT-END` manquant et pour un JSON `@tests` invalide.
- `package.json` avec le script `npm test`.
- Ce fichier `CHANGELOG.md`.

### Modifié
- **⚠️ Incompatible** : `@testable` est désormais obligatoire et désigne réellement la fonction testée (elle était auparavant ignorée au profit de la première fonction du fichier).
- **⚠️ Incompatible** : `testExo(code, tests, sortie)` devient `testExo(code, nom, tests, sortie)`.
- `runExo` et `testExo` partagent le même chemin d'exécution.
- `parserExercice` renvoie `testable` et sépare le bloc `@main` de la partie `after`.
- README réécrit : démarrage rapide, création d'un exercice, référence du format, fonctionnement du moteur, tests, limites connues.

### Corrigé
- La page ne chargeait aucun exercice : l'import `./app/ui.js` pointait vers un fichier inexistant.
- Erreur de syntaxe au chargement : `confort.js` était inclus comme script classique alors qu'il contient un `export`.
- Les alias (`nombre`, `echoue`…) n'étaient pas disponibles pendant les tests : une solution correcte échouait, et un cas d'erreur attendu ne passait que par accident.
- Une accolade dans une chaîne, un commentaire ou une regex faussait l'extraction de la fonction.

### Supprimé
- `extractTestableFunction` et `extraireSignature`, remplacés par `chargerFonction`.
- Ancien runner navigateur `tests/tests.html` et `tests/test_extractFunction.js`, dont les cas sont repris dans `tests/engine.test.js`.

## [0.3.0] - 2026-02-15

### Modifié
- Nouvelle architecture en modules ES : `ui.js`, `engine.js`, `utils.js`, `confort.js`.
- Extraction de la fonction testée par comptage d'accolades.
- Zone de sortie propre à chaque exercice.
- README détaillé.

### Ajouté
- Premiers tests de `extractTestableFunction` dans un runner navigateur (`tests/tests.html`).

## [0.2.0] - 2026-01-14

### Ajouté
- Format d'exercice générique basé sur des annotations (`@title`, `@memo`, `@consigne`, `@tests`, zone `@STUDENT-START` / `@STUDENT-END`, bloc `@main`).
- Chargement des exercices listés dans `config.json`.
- Premier exercice : `niveau1.js`.

## [0.1.0] - 2026-01-13

### Ajouté
- Première version : page `cybergardien.html`, feuille de style, alias pédagogiques (`confort.js`).

[Non publié]: https://github.com/sampoujol/cybergardien/compare/v0.3.0...HEAD
[0.3.0]: https://github.com/sampoujol/cybergardien/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/sampoujol/cybergardien/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/sampoujol/cybergardien/releases/tag/v0.1.0
