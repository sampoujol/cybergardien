import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { chargerFonction, runExo, testExo } from '../app/engine.js';
import { createAliases } from '../app/confort.js';
import { fausseSortie, lignes } from './helpers.js';

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

    test("echoue affiche le refus, sans 💥", () => {
        const sortie = fausseSortie();
        runExo('function f() { echoue("Saisie invalide"); }', "f();", sortie);
        assert.deepEqual(lignes(sortie), ["❌ Saisie invalide"]);
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
    const refus = 'function f(a) { echoue("Saisie invalide"); }';

    // Verdicts seuls, sans la ligne vide ni le bilan
    const verdicts = sortie => lignes(sortie).slice(0, -1);
    const bilan = sortie => lignes(sortie).at(-1);

    test("résultat correct", () => {
        const sortie = fausseSortie();
        testExo(addition, "add", [{ args: [1, 2], attendu: 3 }], sortie);
        assert.deepEqual(verdicts(sortie), ["✅ add(1, 2) → 3"]);
    });

    test("mauvais résultat, chaînes entre guillemets", () => {
        const sortie = fausseSortie();
        testExo(addition, "add", [{ args: ["1", "2"], attendu: 3 }], sortie);
        assert.deepEqual(verdicts(sortie), ['⚠️ add("1", "2") → "12" au lieu de 3']);
    });

    test("tableaux et valeurs spéciales", () => {
        const sortie = fausseSortie();
        testExo("function f(t) { return t.length ? t : undefined; }", "f", [
            { args: [[1, 2]], attendu: 0 },
            { args: [[]], attendu: 0 }
        ], sortie);
        assert.deepEqual(verdicts(sortie), [
            "⚠️ f([1,2]) → [1,2] au lieu de 0",
            "⚠️ f([]) → undefined au lieu de 0"
        ]);
    });

    test("refus attendu obtenu avec echoue", () => {
        const sortie = fausseSortie();
        testExo(refus, "f", [{ args: ["abc"], erreur: true }], sortie);
        assert.deepEqual(verdicts(sortie), ['✅ f("abc") refusé : Saisie invalide']);
    });

    test("refus attendu mais valeur renvoyée", () => {
        const sortie = fausseSortie();
        testExo(addition, "add", [{ args: [1, 2], erreur: true }], sortie);
        assert.deepEqual(verdicts(sortie), ["❌ add(1, 2) → 3 au lieu d'être refusé"]);
    });

    test("refus attendu mais plantage : ne compte pas comme réussi", () => {
        const sortie = fausseSortie();
        const [r] = testExo("function f(s) { return s.length; }", "f", [{ args: [null], erreur: true }], sortie);
        assert.equal(r.ok, false);
        assert.match(verdicts(sortie)[0], /^💥 f\(null\) plante au lieu d'appeler echoue \(TypeError : /);
    });

    test("refusé à tort", () => {
        const sortie = fausseSortie();
        testExo(refus, "f", [{ args: [1], attendu: 1 }], sortie);
        assert.deepEqual(verdicts(sortie), ["❌ f(1) refusé à tort : Saisie invalide"]);
    });

    test("plantage sur un cas valide", () => {
        const sortie = fausseSortie();
        testExo('function f(a) { throw new Error("oups"); }', "f", [{ args: [1], attendu: 1 }], sortie);
        assert.deepEqual(verdicts(sortie), ["💥 f(1) plante (Error : oups)"]);
    });

    test("echoue n'affiche pas de ligne supplémentaire", () => {
        const sortie = fausseSortie();
        testExo(refus, "f", [{ args: [1], erreur: true }], sortie);
        assert.equal(lignes(sortie).length, 2);
    });

    test("un verdict par cas, dans l'ordre, puis le bilan", () => {
        const sortie = fausseSortie();
        testExo(addition, "add", [
            { args: [1, 2], attendu: 3 },
            { args: [2, 2], attendu: 5 }
        ], sortie);
        assert.deepEqual(lignes(sortie), [
            "✅ add(1, 2) → 3",
            "⚠️ add(2, 2) → 4 au lieu de 5",
            "📊 Bilan : 1/2 tests réussis"
        ]);
    });

    test("bilan complet", () => {
        const sortie = fausseSortie();
        testExo(addition, "add", [{ args: [1, 2], attendu: 3 }, { args: [0, 0], attendu: 0 }], sortie);
        assert.equal(bilan(sortie), "🎉 Bilan : 2/2 tests réussis");
    });

    test("bilan au singulier", () => {
        const sortie = fausseSortie();
        testExo(addition, "add", [{ args: [1, 2], attendu: 3 }], sortie);
        assert.equal(bilan(sortie), "🎉 Bilan : 1/1 test réussi");
    });

    test("le bilan est précédé d'une ligne vide", () => {
        const sortie = fausseSortie();
        testExo(addition, "add", [{ args: [1, 2], attendu: 3 }], sortie);
        assert.ok(sortie.textContent.endsWith("→ 3\n\n🎉 Bilan : 1/1 test réussi\n"));
    });

    test("renvoie un résultat par cas", () => {
        const resultats = testExo(addition, "add", [
            { args: [1, 2], attendu: 3 },
            { args: [1, 2], attendu: 4 },
            { args: [1, 2], erreur: true }
        ], fausseSortie());
        assert.deepEqual(resultats.map(r => r.ok), [true, false, false]);
        assert.deepEqual(resultats[0], { args: [1, 2], ok: true, message: "✅ add(1, 2) → 3" });
    });

    test("fonction introuvable : pas de bilan", () => {
        const sortie = fausseSortie();
        assert.deepEqual(testExo("const x = 1;", "f", [], sortie), []);
        assert.deepEqual(lignes(sortie), ["💥 Fonction f introuvable"]);
    });

    test("les alias sont disponibles dans la fonction testée", () => {
        const sortie = fausseSortie();
        testExo("function f(a, b) { return nombre(a) + nombre(b); }", "f", [{ args: ["10", "5"], attendu: 15 }], sortie);
        assert.deepEqual(verdicts(sortie), ['✅ f("10", "5") → 15']);
    });

    test("affiche de l'élève reste visible pendant les tests", () => {
        const sortie = fausseSortie();
        testExo('function f(a) { affiche("debug " + a); return a; }', "f", [{ args: [7], attendu: 7 }], sortie);
        assert.deepEqual(verdicts(sortie), ["debug 7", "✅ f(7) → 7"]);
    });
});
