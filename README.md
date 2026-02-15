# 🛡️ CyberGardien

> Plateforme pédagogique d’exercices JavaScript interactifs — 100% navigateur, modulaire, extensible et testable.

CyberGardien permet de créer et exécuter des exercices JavaScript avec :

- ✏️ Édition de code étudiant
- ▶️ Exécution interactive
- 🧪 Tests automatiques intégrés
- 🧩 Alias pédagogiques (ex: `mauvaisNombre` au lieu de `isNaN`)
- 🏗️ Architecture modulaire ES Modules
- 🧪 Runner de tests navigateur

---

# ✨ Features

- Multi-exercices dynamiques
- Isolation des sorties par section
- Extraction automatique de fonction testable
- Format d’exercice simple basé sur commentaires
- Tests JSON intégrés
- Alias pédagogiques injectés automatiquement
- Aucun backend requis

---

# 📦 Installation

Clone le projet :

    git clone https://github.com/votre-repo/cybergardien.git
    cd cybergardien

Lancer un serveur local (recommandé pour ES modules) :

    npx serve

ou

    python -m http.server

Puis ouvrir :

    http://localhost:8000

---

# 🏗️ Structure du projet

    cybergardien/
    │
    ├── app/
    │   ├── engine.js
    │   ├── confort.js
    │   ├── ui.js
    │   └── utils.js
    │
    ├── exercices/
    │   └── niveau1.js
    │
    ├── tests/
    │   ├── test_extractFunction.js
    │   └── tests.html
    │
    ├── config.json
    ├── index.html
    └── README.md

---

# 🧠 Philosophie

CyberGardien est conçu pour :

- Simplifier l’apprentissage
- Encadrer les erreurs
- Rendre les tests visibles et compréhensibles
- Séparer moteur / UI / parsing
- Être extensible sans complexité

---

# 🧩 Format d’un exercice

Les exercices sont des fichiers JavaScript annotés.

Ils contiennent :

- Un bloc de métadonnées
- Une fonction testable
- Une zone étudiante
- Un bloc main optionnel

---

## 📄 Exemple complet

    /*
    @title Niveau 1 – On ne mélange pas les choux et les carottes

    @memo
    Tout ce qui vient d’une saisie est une string.
    "10" + "5" donne "105".
    Utilise Number(...) pour faire des calculs.

    @consigne
    Corrige la fonction calculerTotal pour qu’elle fasse une vraie addition.
    Si une valeur n’est pas un nombre, appelle echoue("Saisie invalide").

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

---

# 🏷️ Documentation du format

## Métadonnées

Déclarées dans un commentaire initial `/* ... */`.

### @title
Titre affiché dans l’interface.

### @memo
Rappel pédagogique.

### @consigne
Objectif de l’exercice.

### @tests
Tableau JSON décrivant les tests automatiques.

Structure test valide :

    {
      "args": [val1, val2],
      "attendu": valeur
    }

Structure test erreur attendue :

    {
      "args": [...],
      "erreur": true
    }

### @testable
Nom de la fonction à tester automatiquement.

---

## Zone étudiante

Délimitée par :

    // @STUDENT-START
    // code modifiable
    // @STUDENT-END

Seule cette zone est éditable.

---

## Bloc @main

Optionnel.

Permet d’exécuter du code interactif via le bouton "Lancer".

Exemple :

    /* @main */
    affiche(maFonction(5));

---

# 🧪 Tests automatiques

Le moteur :

1. Extrait la fonction définie par `@testable`
2. Injecte les alias pédagogiques
3. Exécute les cas définis dans `@tests`
4. Compare le résultat attendu
5. Affiche :

- ✅ Succès
- ⚠️ Mauvais résultat
- ❌ Erreur inattendue

---

# 🧩 Alias pédagogiques

Définis dans `confort.js` :

    export const ALIASES = {
        mauvaisNombre: isNaN,
        nombre: Number
    };

Fonctions injectées automatiquement :

- affiche(msg)
- echoue(msg)

---

# 🧪 Tests internes du moteur

Disponible dans :

    tests/tests.html

Permet de tester :

- extractTestableFunction
- runExo
- testExo

---

# 🔒 Sécurité

Le code étudiant est exécuté via :

    new Function(...)

Projet destiné à un usage pédagogique contrôlé.

---

# 🚀 Roadmap

- [ ] Comparaison profonde d’objets
- [ ] Mode strict optionnel
- [ ] Export résultats JSON
- [ ] Support TypeScript
- [ ] Intégration CI

---

# 📄 Licence

Projet pédagogique — libre d’adaptation.

---

# 🛡️ CyberGardien

Apprendre à coder.  
Comprendre ses erreurs.  
Devenir autonome.
