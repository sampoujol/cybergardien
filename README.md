# 🛡️ CyberGardien

[![CI](https://github.com/sampoujol/cybergardien/actions/workflows/ci.yml/badge.svg)](https://github.com/sampoujol/cybergardien/actions/workflows/ci.yml)

> *Tuer les bugs dans l'œuf.*
> Plateforme pédagogique d'exercices JavaScript interactifs, 100 % navigateur, sans backend.

L'élève lit un mémo et une consigne, corrige une fonction dans un éditeur de code, puis :

- **▶ Lancer** : exécute le programme complet (avec `prompt`, `affiche`…) ;
- **🧪 Tester** : lance les tests automatiques définis par l'enseignant et affiche le verdict de chaque cas.

Chaque exercice est un simple fichier `.js` annoté : pas de build, pas de serveur applicatif.

**▶ Essayer en ligne : <https://sampoujol.github.io/cybergardien/cybergardien.html>**

---

## Sommaire

- [Démarrage rapide](#-démarrage-rapide)
- [Structure du projet](#-structure-du-projet)
- [Créer un exercice](#-créer-un-exercice)
- [Référence du format](#-référence-du-format)
- [Exercices avec base de données](#-exercices-avec-base-de-données)
- [Fonctions disponibles pour l'élève](#-fonctions-disponibles-pour-lélève)
- [Fonctionnement du moteur](#-fonctionnement-du-moteur)
- [Tests du moteur](#-tests-du-moteur)
- [Limites connues](#-limites-connues)
- [Intégration continue et publication](#-intégration-continue-et-publication)
- [Roadmap](#-roadmap)
- [Historique](#-historique)

---

## 🚀 Démarrage rapide

Les modules ES et le `fetch` des exercices nécessitent un serveur HTTP (l'ouverture en `file://` ne fonctionne pas).

```bash
git clone https://github.com/sampoujol/cybergardien.git
cd cybergardien
python3 -m http.server 8000     # ou : npx serve -l 8000
```

Puis ouvrir <http://localhost:8000/app/cybergardien.html>.

Seul le dossier `app/` est nécessaire au fonctionnement de l'application : c'est lui qu'il faut publier sur un serveur web (Apache, etc.). Il est aussi publié automatiquement sur GitHub Pages, voir [Intégration continue et publication](#-intégration-continue-et-publication).

Pour lancer les tests du moteur, voir [Tests du moteur](#-tests-du-moteur).

L'éditeur ([CodeMirror 5](https://codemirror.net/5/)) est chargé depuis un CDN : une connexion Internet est nécessaire.

---

## 🏗️ Structure du projet

```
cybergardien/
├── app/
│   ├── cybergardien.html    # Page principale
│   ├── style.css
│   ├── config.json          # Liste des exercices à charger
│   ├── ui.js                # Chargement des exercices et rendu des sections
│   ├── engine.js            # Extraction de fonction, exécution, tests
│   ├── utils.js             # Parsing du format d'exercice
│   ├── confort.js           # Alias pédagogiques + affiche / echoue
│   ├── sgbd.js              # Base SQLite des exercices @sql
│   ├── vendor/sql.js/       # SQLite en WebAssembly (sql.js 1.14.2, MIT)
│   └── exercices/
│       ├── niveau1.js       # Conversion des saisies
│       ├── niveau2.js       # Vérification des bornes (menu)
│       ├── niveau3.js       # Validation de format (code PIN)
│       ├── niveau4.js       # Cas limites sur une liste (moyenne)
│       └── niveau5.js       # Injection SQL (connexion)
├── tests/                   # Tests du moteur (node --test)
│   ├── helpers.js           # Utilitaires partagés par les tests
│   ├── utils.test.js
│   ├── confort.test.js
│   ├── engine.test.js
│   ├── sgbd.test.js
│   ├── app.test.js
│   └── exercices.test.js    # Solutions de référence des exercices
├── .github/workflows/ci.yml # Tests et publication sur GitHub (Actions)
├── package.json             # Script npm test
├── CHANGELOG.md             # Historique des versions
└── README.md
```

| Module      | Rôle |
|-------------|------|
| `ui.js`     | Lit `config.json`, récupère chaque exercice, crée une section (mémo, consigne, éditeur, boutons, sortie). Un exercice défectueux est remplacé par un message d'erreur sans bloquer les suivants. |
| `utils.js`  | `parserExercice` découpe le fichier en métadonnées / code avant / zone élève / code après / main. |
| `engine.js` | `chargerFonction`, `runExo` (bouton Lancer), `testExo` (bouton Tester). |
| `confort.js`| `ALIASES`, `AIDE` et `createAliases(output)` qui fournit `affiche` et `echoue` liés à la zone de sortie de l'exercice. |
| `sgbd.js`   | `creerBase(script)` crée une base SQLite en mémoire et fournit `requete` / `requetePreparee` ; `decrireBase(script)` liste les tables pour les afficher. |

---

## ✏️ Créer un exercice

1. Créer un fichier dans `app/exercices/`, par exemple `niveau2.js` (voir le format ci-dessous).
2. L'ajouter dans `app/config.json` :

   ```json
   {
     "exercices": [
       "exercices/niveau1.js",
       "exercices/niveau2.js"
     ]
   }
   ```

3. Ajouter sa solution de référence (le contenu attendu de la zone élève) dans `SOLUTIONS`, en tête de `tests/exercices.test.js`.
4. Lancer `npm test` : chaque exercice de `config.json` est vérifié automatiquement (voir [Tests du moteur](#-tests-du-moteur)).
5. Recharger la page. Les exercices s'affichent dans l'ordre de la liste.

Si un exercice est mal formé (tag manquant, JSON invalide, fichier introuvable…), la page affiche à sa place une section rouge avec le message d'erreur ; les autres exercices restent utilisables.

### Exemple complet

```js
/*
@title Niveau 1 – On ne mélange pas les choux et les carottes

@memo
Tout ce qui vient d'une saisie est une string.
"10" + "5" donne "105".
Utilise Number(...) pour faire des calculs.

@consigne
Corrige la fonction calculerTotal pour qu'elle fasse une vraie addition.
Si une valeur n'est pas un nombre, appelle echoue("Saisie invalide").

@tests
[
  { "args": ["10","5"], "attendu": 15 },
  { "args": ["1","2"], "attendu": 3 },
  { "args": ["abc","5"], "erreur": true }
]
@testable calculerTotal
*/

function calculerTotal(prix1, prix2) {
    // @STUDENT-START
    return prix1 + prix2;
    // @STUDENT-END
}

/* @main */
let p1 = prompt("prix 1");
let p2 = prompt("prix 2");
let resultat = calculerTotal(p1, p2);
affiche(resultat);
```

---

## 📚 Référence du format

### Métadonnées

Placées dans le commentaire `/* ... */` en tête de fichier. Le contenu d'un tag s'étend jusqu'au tag suivant ou jusqu'à `*/`.

| Tag         | Obligatoire | Description |
|-------------|:-----------:|-------------|
| `@title`    | oui | Titre de la section. |
| `@memo`     | oui | Rappel de cours. Les retours à la ligne sont conservés. |
| `@consigne` | oui | Objectif de l'exercice. Interprété comme du HTML. |
| `@tests`    | oui | Tableau **JSON strict** des cas de test (voir ci-dessous). |
| `@testable` | oui | Nom de la fonction testée par le bouton Tester. L'exercice peut contenir d'autres fonctions, y compris fléchées. |
| `@sql`      | non | Script SQL (SQLite) qui crée et remplit la base de l'exercice. Voir [Exercices avec base de données](#-exercices-avec-base-de-données). |

> ⚠️ Le caractère `@` termine un tag : ne pas l'utiliser dans le texte d'un mémo ou d'une consigne.

### Cas de test

```json
{ "args": ["10", "5"], "attendu": 15 }
```

La fonction est appelée avec `args` ; le résultat doit être **strictement égal** (`===`) à `attendu`.

```json
{ "args": ["abc", "5"], "erreur": true }
```

La fonction doit refuser la saisie en appelant `echoue(...)`. Un plantage (par exemple une `TypeError`) n'est **pas** considéré comme un refus.

Comme c'est du JSON, les valeurs `undefined`, `NaN` ou les fonctions ne sont pas exprimables.

### Zone élève

```js
// @STUDENT-START
// code modifiable par l'élève
// @STUDENT-END
```

Seul ce qui se trouve entre ces deux marqueurs est éditable ; le reste du code est affiché en lecture seule. Les marqueurs doivent être écrits exactement ainsi, et il ne peut y en avoir qu'une paire par fichier.

### Bloc `@main`

Optionnel. Tout ce qui suit `/* @main */` (écrit exactement ainsi) est exécuté par le bouton **▶ Lancer**, après la définition de la fonction. Il est affiché à l'élève en lecture seule, sous la fonction.

---

## 🗄️ Exercices avec base de données

Un exercice peut déclarer une base SQLite avec le tag `@sql`. SQLite tourne dans le navigateur grâce à [sql.js](https://sql.js.org) (WebAssembly) : la base est en mémoire, rien ne sort de la page, et l'élève peut la « casser » sans conséquence.

```js
/*
@title ...
@sql
CREATE TABLE utilisateurs (login TEXT, mdp TEXT);
INSERT INTO utilisateurs VALUES ('alice', 'secret');
INSERT INTO utilisateurs VALUES ('o''brien', 'trèfle');

@tests
...
*/
```

- Les tables et leur contenu sont affichés à l'élève dans un encadré **🗄️ Base de données**.
- L'élève interroge la base avec `requete(sql)` (texte exécuté tel quel, donc vulnérable à l'injection) ou `requetePreparee(sql, valeurs)` (valeurs liées aux `?`, sans risque).
- **Tester** crée une base neuve pour chaque cas : une requête destructrice (`DELETE`, `DROP TABLE`) ne fausse pas les cas suivants.
- **Lancer** affiche chaque requête réellement exécutée (`🗄️ SELECT ... WHERE login = '' OR '1'='1'`) : l'élève voit l'injection se produire.
- sql.js (~700 Ko) n'est chargé que si au moins un exercice déclare `@sql`.

Contraintes d'écriture du script : pas de `@` (il terminerait le tag) ni de ligne vide (elle perturberait le masquage des métadonnées dans le code affiché).

sql.js est copié dans `app/vendor/sql.js/` plutôt que chargé depuis un CDN : la page et les tests utilisent le même fichier, et l'application fonctionne sur un réseau qui filtre les CDN. Un serveur qui ne connaît pas le type MIME `application/wasm` fonctionne quand même (chargement un peu plus lent).

---

## 🧰 Fonctions disponibles pour l'élève

| Nom                  | Équivalent / effet |
|----------------------|--------------------|
| `affiche(msg)`       | Écrit une ligne dans la zone de sortie de l'exercice. |
| `echoue(msg)`        | Refuse la saisie : interrompt la fonction. Tester l'affiche comme un refus, Lancer affiche `❌ msg`. |
| `nombre(x)`          | `Number(x)` |
| `mauvaisNombre(x)`   | `isNaN(x)` |
| `estEntier(x)`       | `Number.isInteger(x)` |

Dans la page, ces fonctions sont mises en évidence :

- une **🧰 Boîte à outils** en haut de page les liste avec leur description ;
- leurs appels apparaissent **en orange** dans le code, l'éditeur, le mémo et la consigne, avec la description au survol. Seuls les appels (`nombre(`) sont colorés, pas le mot « nombre » dans une phrase.

Pour ajouter un alias, compléter `ALIASES` **et** `AIDE` dans `app/confort.js` :

```js
export const ALIASES = {
    mauvaisNombre: isNaN,
    nombre: Number,
    estEntier: Number.isInteger
};

export const AIDE = {
    // ...
    estEntier: ["estEntier(x)", "Vrai si x est un nombre entier : estEntier(3) donne true, estEntier(2.5) donne false."]
};
```

`npm test` échoue si une fonction de `ALIASES` n'a pas d'entrée dans `AIDE`.

---

## ⚙️ Fonctionnement du moteur

**▶ Lancer** (`runExo`) :

1. recompose le code : partie avant + code de l'élève + partie après ;
2. l'exécute suivi du bloc `@main` via `new Function`, les alias étant rendus accessibles par un `with (aliases)` ;
3. affiche un refus (`echoue`) sous la forme `❌ message`, et toute autre erreur sous la forme `💥 Erreur : ...`.

**🧪 Tester** (`testExo`) : exécute le même code, **sans** le bloc `@main`, et récupère la fonction nommée par `@testable` (`chargerFonction`). Le code n'est jamais découpé à la main : c'est le moteur JavaScript du navigateur qui le lit, donc chaînes, commentaires et expressions régulières sont gérés correctement. Chaque cas produit une seule ligne, qui rappelle l'appel effectué :

| Affichage | Signification |
|-----------|---------------|
| `✅ calculerTotal("10", "5") → 15`                        | Résultat correct. |
| `⚠️ calculerTotal("10", "5") → "105" au lieu de 15`       | Mauvais résultat. |
| `✅ calculerTotal("abc", "5") refusé : Saisie invalide`   | Refus attendu, obtenu avec `echoue`. |
| `❌ calculerTotal("abc", "5") → "abc5" au lieu d'être refusé` | Refus attendu, mais la fonction a renvoyé une valeur. |
| `❌ calculerTotal("1", "2") refusé à tort : Saisie invalide` | La fonction a refusé une saisie valide. |
| `💥 f(null) plante au lieu d'appeler echoue (TypeError : …)` | Refus attendu, mais la fonction a planté : un plantage ne compte pas comme un refus. |
| `💥 f(1) plante (Error : …)`                               | La fonction a planté sur un cas valide. |

Les chaînes sont affichées entre guillemets pour distinguer `"15"` de `15`, les tableaux au format JSON. Les messages de `affiche` écrits par l'élève restent visibles, juste avant le verdict du cas concerné.

Un bilan termine la sortie : `🎉 Bilan : 3/3 tests réussis` quand tout passe, `📊 Bilan : 1/3 tests réussis` sinon.

---

## 🧪 Tests du moteur

À ne pas confondre avec les tests `@tests` des exercices, qui vérifient le code de l'élève : ceux-ci vérifient **le code de CyberGardien lui-même**.

Tous les tests utilisent le runner intégré à Node.js (`node:test`). Il faut Node.js 22 ou plus, sans aucune dépendance à installer.

### Lancer les tests

Depuis la racine du dépôt :

```bash
npm test                                     # tous les tests
node --test tests/engine.test.js             # un seul fichier
node --test --watch "tests/**/*.test.js"     # relance à chaque sauvegarde
node --test --test-name-pattern="testExo" "tests/**/*.test.js"   # filtre par nom
```

Exemple de sortie :

```
▶ testExo
  ✔ résultat correct (0.5ms)
  ✔ mauvais résultat (0.2ms)
  ✔ les alias sont disponibles dans la fonction testée (0.7ms)
...
ℹ tests 57
ℹ pass 56
ℹ fail 0
ℹ todo 1
```

Le détail de chaque échec (valeur obtenue / attendue) est affiché en fin de rapport. La commande se termine avec un code d'erreur si au moins un test échoue, ce qui permet de l'utiliser telle quelle en intégration continue.

### Organisation

| Fichier                  | Contenu |
|--------------------------|---------|
| `tests/utils.test.js`    | Parsing : `extraire`, `collapseTags`, `parserExercice` (dont les messages d'erreur). |
| `tests/confort.test.js`  | Alias, `affiche` et `echoue`. |
| `tests/engine.test.js`   | `chargerFonction`, `runExo`, chaque verdict de `testExo` et les résultats qu'il renvoie, exercices avec base. |
| `tests/sgbd.test.js`     | `creerBase` (requêtes, injection, requêtes préparées, isolation, journal) et `decrireBase`. |
| `tests/app.test.js`      | Fichiers référencés par `cybergardien.html` et présence de sql.js, validité de chaque exercice listé dans `config.json` (y compris son script `@sql`). |
| `tests/exercices.test.js`| Pour chaque exercice : une solution de référence existe, le code de départ échoue au moins un test, la solution les passe tous. |
| `tests/helpers.js`       | `fausseSortie()`, `lignes(sortie)`, `lireFichier(chemin)`, `chargerSql()` (charge sql.js sous Node). |

`ui.js` n'est pas testé : il dépend du DOM et de CodeMirror.

Un fichier de test qui utilise une base commence par `await chargerSql();`.

### Écrire un test

Tout fichier `tests/*.test.js` est pris en compte automatiquement.

```js
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { testExo } from '../app/engine.js';
import { fausseSortie, lignes } from './helpers.js';

describe("testExo", () => {
    test("résultat correct", () => {
        const sortie = fausseSortie();          // remplace le <pre class="output">
        testExo("function add(a, b) { return a + b; }", "add", [{ args: [1, 2], attendu: 3 }], sortie);
        assert.deepEqual(lignes(sortie), ["✅ add(1, 2) → 3", "🎉 Bilan : 1/1 test réussi"]);
    });
});
```

- `fausseSortie()` remplace la zone de sortie du navigateur par un objet `{ textContent: "" }`, ce qui permet de tester le moteur sans DOM.
- Une limite connue, qu'on ne compte pas corriger tout de suite, s'écrit avec `{ todo: "raison" }` : le test est exécuté et affiché, mais ne fait pas échouer la suite.

```js
test("un @ dans le texte ne coupe pas le tag", { todo: "limite connue du format" }, () => { ... });
```

### Ajouter un exercice

Les exercices listés dans `app/config.json` sont vérifiés automatiquement par `tests/app.test.js` : le fichier existe, il est lisible par le parseur, ses cas de test sont bien formés et la fonction nommée par `@testable` existe. Lancer `npm test` après chaque nouvel exercice.

---

## ⚠️ Limites connues

- **Sécurité** : le code est exécuté tel quel dans la page via `new Function`. Aucun bac à sable : réservé à un usage pédagogique en environnement maîtrisé.
- **Boucles infinies** : un `while (true)` dans le code de l'élève gèle l'onglet.
- **Code hors `@main` exécuté par Tester** : tout le code de l'exercice (hors `@main`) est exécuté avant les tests ; il ne doit contenir que des déclarations.
- **Comparaison stricte** : les résultats de type objet ou tableau ne peuvent pas être comparés.
- **Mode strict impossible** en l'état, à cause de l'utilisation de `with`.

---

## 🤖 Intégration continue et publication

Le workflow `.github/workflows/ci.yml` s'exécute sur GitHub à chaque push et à chaque pull request :

1. **Tests** : `npm test` sous Node.js 22 et 24. Le résultat s'affiche à côté de chaque commit (✅ / ❌) et dans le badge en haut de ce README.
2. **Publication** : si les tests passent sur `main`, le dossier `app/` est publié sur GitHub Pages, à l'adresse <https://sampoujol.github.io/cybergardien/cybergardien.html>. Un commit qui casse les tests n'est donc jamais mis en ligne.

Seul `app/` est publié : les solutions de référence de `tests/exercices.test.js` ne sont pas accessibles aux élèves.

Mise en place, une seule fois : dans le dépôt GitHub, *Settings → Pages → Build and deployment → Source : **GitHub Actions***. GitHub Pages nécessite un dépôt public, ou un compte payant pour un dépôt privé. Sans Pages, les tests fonctionnent quand même, seule l'étape de publication échoue.

Le workflow peut aussi être relancé à la main depuis l'onglet *Actions* (*Run workflow*).

---

## 🗺️ Roadmap

- [ ] Protection contre les boucles infinies (Web Worker)
- [ ] Comparaison profonde d'objets et de tableaux
- [ ] Export des résultats en JSON
- [ ] Support TypeScript

---

## 📝 Historique

Les évolutions de chaque version sont décrites dans [CHANGELOG.md](CHANGELOG.md).

---

## 📄 Licence

Projet pédagogique, libre d'adaptation.
