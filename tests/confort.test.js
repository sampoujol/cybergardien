import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { ALIASES, AIDE, Echec, createAliases } from '../app/confort.js';
import { fausseSortie } from './helpers.js';

describe("ALIASES", () => {
    test("nombre et mauvaisNombre", () => {
        assert.equal(ALIASES.nombre("42"), 42);
        assert.equal(ALIASES.mauvaisNombre("abc"), true);
        assert.equal(ALIASES.mauvaisNombre("12"), false);
    });

    test("estEntier", () => {
        assert.equal(ALIASES.estEntier(3), true);
        assert.equal(ALIASES.estEntier(2.5), false);
        assert.equal(ALIASES.estEntier(NaN), false);
        assert.equal(ALIASES.estEntier("3"), false);
    });
});

describe("createAliases", () => {
    test("contient les alias, affiche et echoue", () => {
        const a = createAliases(fausseSortie());
        for (const nom of [...Object.keys(ALIASES), "affiche", "echoue"]) {
            assert.equal(typeof a[nom], "function", nom);
        }
    });

    test("affiche écrit une ligne dans la sortie", () => {
        const sortie = fausseSortie();
        const { affiche } = createAliases(sortie);
        affiche("bonjour");
        affiche(42);
        assert.equal(sortie.textContent, "bonjour\n42\n");
    });

    test("echoue lève un Echec sans rien afficher", () => {
        const sortie = fausseSortie();
        const { echoue } = createAliases(sortie);
        assert.throws(() => echoue("Saisie invalide"), e => e instanceof Echec && e.message === "Saisie invalide");
        assert.equal(sortie.textContent, "");
    });

    test("chaque zone de sortie est indépendante", () => {
        const s1 = fausseSortie(), s2 = fausseSortie();
        createAliases(s1).affiche("un");
        createAliases(s2).affiche("deux");
        assert.equal(s1.textContent, "un\n");
        assert.equal(s2.textContent, "deux\n");
    });
});

describe("AIDE", () => {
    test("décrit exactement les fonctions fournies à l'élève", () => {
        assert.deepEqual(Object.keys(AIDE).sort(), Object.keys(createAliases(fausseSortie())).sort());
    });

    test("chaque entrée a une utilisation et une description", () => {
        for (const [nom, [usage, role]] of Object.entries(AIDE)) {
            assert.ok(usage.startsWith(nom + "("), nom);
            assert.ok(role.length > 0, nom);
        }
    });
});

describe("alias SQL sans base", () => {
    test("requete et requetePreparee expliquent l'absence de base", () => {
        const a = createAliases(fausseSortie());
        assert.throws(() => a.requete("SELECT 1"), /n'a pas de base de données/);
        assert.throws(() => a.requetePreparee("SELECT 1", []), /n'a pas de base de données/);
    });
});
