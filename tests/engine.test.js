import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { chargerFonction, runExo, testExo } from '../app/engine.js';
import { createAliases } from '../app/confort.js';
import { parserExercice } from '../app/utils.js';
import { fausseSortie, lignes, lireFichier } from './helpers.js';

describe("chargerFonction", () => {
    const charger = (code, nom) => chargerFonction(code, nom, createAliases(fausseSortie()));

    test("renvoie la fonction nommée", () => {
        const f = charger("function add(a, b) { return a + b; }", "add");
        assert.equal(f(1, 2), 3);
    });

    test("choisit la fonction par son nom, pas la première", () => {
        const f = charger("function a() { return 1; }\nfunction b() { return 2; }", "b");
        assert.equal(f(), 2);
    });

    test("les autres fonctions de l'exercice sont accessibles", () => {
        const f = charger("function carre(x) { return x * x; }\nfunction f(x) { return carre(x) + 1; }", "f");
        assert.equal(f(3), 10);
    });

    test("accepte une fonction fléchée", () => {
        const f = charger("const double = x => x * 2;", "double");
        assert.equal(f(21), 42);
    });

    test("accepte les accents dans le nom", () => {
        const f = charger("function vérifier(x) { return x > 0; }", "vérifier");
        assert.equal(f(1), true);
    });

    test("accolades dans une chaîne, un commentaire ou une regex", () => {
        const f = charger(`function f(s) {
            // }
            const re = /\}/;
            return "}" + \`{\${s}}\` + re.test("}");
        }`, "f");
        assert.equal(f("x"), "}{x}true");
    });

    test("les alias sont accessibles", () => {
        const f = charger("function f(x) { return nombre(x) + 1; }", "f");
        assert.equal(f("41"), 42);
    });

    test("fonction introuvable", () => {
        assert.throws(() => charger("function a() {}", "b"), /Fonction b introuvable/);
    });

    test("nom qui n'est pas une fonction", () => {
        assert.throws(() => charger("const b = 3;", "b"), /Fonction b introuvable/);
    });

    test("nom invalide", () => {
        assert.throws(() => charger("function a() {}", "a; alert(1)"), /Nom de fonction invalide/);
    });

    test("erreur de syntaxe", () => {
        assert.throws(() => charger("function a() { return ; ", "a"), SyntaxError);
    });

    test("n'exécute pas le code de la fonction", () => {
        const sortie = fausseSortie();
        chargerFonction('function f() { affiche("appel"); }', "f", createAliases(sortie));
        assert.equal(sortie.textContent, "");
    });
});

describe("runExo", () => {
    const code = "function double(x) { return x * 2; }";

    test("exécute main après la fonction", () => {
        const sortie = fausseSortie();
        runExo(code, "affiche(double(21));", sortie);
        assert.deepEqual(lignes(sortie), ["42"]);
    });

    test("les alias sont disponibles dans main", () => {
        const sortie = fausseSortie();
        runExo(code, 'affiche(double(nombre("5")));', sortie);
        assert.deepEqual(lignes(sortie), ["10"]);
    });

    test("les alias sont disponibles dans la fonction", () => {
        const sortie = fausseSortie();
        runExo('function f(x) { affiche("dans f"); return nombre(x); }', 'affiche(f("3") + 1);', sortie);
        assert.deepEqual(lignes(sortie), ["dans f", "4"]);
    });

    test("une erreur est capturée et affichée", () => {
        const sortie = fausseSortie();
        assert.doesNotThrow(() => runExo(code, "inconnue();", sortie));
        assert.match(sortie.textContent, /💥 Erreur : inconnue is not defined/);
    });

    test("une erreur de syntaxe est signalée", () => {
        const sortie = fausseSortie();
        runExo("function f( {", "", sortie);
        assert.match(sortie.textContent, /💥 Erreur : /);
    });

    test("main n'est exécuté qu'une fois", () => {
        const sortie = fausseSortie();
        runExo(code, 'affiche("main");', sortie);
        assert.deepEqual(lignes(sortie), ["main"]);
    });
});

describe("testExo", () => {
    const addition = "function add(a, b) { return a + b; }";

    test("résultat correct", () => {
        const sortie = fausseSortie();
        testExo(addition, "add", [{ args: [1, 2], attendu: 3 }], sortie);
        assert.deepEqual(lignes(sortie), ["✅ 1, 2 --> 3"]);
    });

    test("mauvais résultat", () => {
        const sortie = fausseSortie();
        testExo(addition, "add", [{ args: ["1", "2"], attendu: 3 }], sortie);
        assert.deepEqual(lignes(sortie), ["⚠️ 12 retourné au lieu de 3"]);
    });

    test("erreur attendue et levée", () => {
        const sortie = fausseSortie();
        testExo('function f(a) { throw new Error("non"); }', "f", [{ args: [1], erreur: true }], sortie);
        assert.deepEqual(lignes(sortie), ["✅ Erreur détectée comme attendu"]);
    });

    test("erreur attendue mais valeur renvoyée", () => {
        const sortie = fausseSortie();
        testExo(addition, "add", [{ args: [1, 2], erreur: true }], sortie);
        assert.deepEqual(lignes(sortie), ["❌ Ces paramètres ne sont pas acceptables : [1,2]"]);
    });

    test("erreur inattendue", () => {
        const sortie = fausseSortie();
        testExo('function f(a) { throw new Error("oups"); }', "f", [{ args: [1], attendu: 1 }], sortie);
        assert.deepEqual(lignes(sortie), ["❌ Erreur inattendue"]);
    });

    test("un verdict par cas, dans l'ordre", () => {
        const sortie = fausseSortie();
        testExo(addition, "add", [
            { args: [1, 2], attendu: 3 },
            { args: [2, 2], attendu: 5 }
        ], sortie);
        assert.deepEqual(lignes(sortie), ["✅ 1, 2 --> 3", "⚠️ 4 retourné au lieu de 5"]);
    });

    test("fonction introuvable", () => {
        const sortie = fausseSortie();
        testExo("const x = 1;", "f", [], sortie);
        assert.deepEqual(lignes(sortie), ["💥 Fonction f introuvable"]);
    });

    test("les alias sont disponibles dans la fonction testée", () => {
        const sortie = fausseSortie();
        testExo("function f(a, b) { return nombre(a) + nombre(b); }", "f", [{ args: ["10", "5"], attendu: 15 }], sortie);
        assert.deepEqual(lignes(sortie), ["✅ 10, 5 --> 15"]);
    });

    test("echoue est réellement appelé sur un cas d'erreur", () => {
        const sortie = fausseSortie();
        testExo('function f(a) { echoue("Saisie invalide"); }', "f", [{ args: [1], erreur: true }], sortie);
        // Sans l'alias, f lève une ReferenceError et le test passe par accident
        assert.ok(sortie.textContent.includes("❌ Saisie invalide"));
    });
});

describe("niveau1 (intégration)", () => {
    const exo = parserExercice(lireFichier("app/exercices/niveau1.js"), 0);

    function verdicts(codeEleve) {
        const sortie = fausseSortie();
        testExo(exo.before + codeEleve + exo.after, exo.testable, exo.tests, sortie);
        return lignes(sortie).filter(l => !l.startsWith("❌ Saisie invalide"));
    }

    test("le code de départ échoue au moins un test", () => {
        const v = verdicts(exo.student);
        assert.equal(v.length, exo.tests.length);
        assert.ok(v.some(l => !l.startsWith("✅")));
    });

    test("une solution correcte passe tous les tests", () => {
        const solution = `
        const a = nombre(prix1), b = nombre(prix2);
        if (mauvaisNombre(a) || mauvaisNombre(b)) echoue("Saisie invalide");
        return a + b;`;
        assert.deepEqual(verdicts(solution), [
            "✅ 10, 5 --> 15",
            "✅ 1, 2 --> 3",
            "✅ Erreur détectée comme attendu"
        ]);
    });
});
