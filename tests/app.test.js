import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { parserExercice } from '../app/utils.js';
import { chargerFonction } from '../app/engine.js';
import { createAliases } from '../app/confort.js';
import { fausseSortie, lireFichier } from './helpers.js';

const APP = new URL("../app/", import.meta.url);

describe("cybergardien.html", () => {
    const html = lireFichier("app/cybergardien.html");
    const locaux = chemin => !/^https?:/.test(chemin);

    test("les fichiers locaux référencés existent", () => {
        const refs = [
            ...html.matchAll(/(?:src|href)="([^"]+)"/g),
            ...html.matchAll(/from\s+['"]([^'"]+)['"]/g)
        ].map(m => m[1]).filter(locaux);

        const manquants = refs.filter(r => !existsSync(new URL(r, APP)));
        assert.deepEqual(manquants, []);
    });

    test("un script classique ne contient pas de syntaxe module", () => {
        const classiques = [...html.matchAll(/<script(?![^>]*type="module")[^>]*src="([^"]+)"/g)]
            .map(m => m[1]).filter(locaux);

        const fautifs = classiques.filter(r =>
            existsSync(new URL(r, APP)) && /^\s*(export|import)\s/m.test(lireFichier(`app/${r}`))
        );
        assert.deepEqual(fautifs, []);
    });
});

describe("config.json", () => {
    const { exercices } = JSON.parse(lireFichier("app/config.json"));

    test("liste au moins un exercice", () => {
        assert.ok(exercices.length > 0);
    });

    for (const chemin of exercices) {
        describe(chemin, () => {
            test("le fichier existe", () => {
                assert.ok(existsSync(new URL(chemin, APP)));
            });

            test("est lisible par le parseur, avec des tests", () => {
                const exo = parserExercice(lireFichier(`app/${chemin}`), 0);
                assert.ok(Array.isArray(exo.tests) && exo.tests.length > 0);
                for (const t of exo.tests) {
                    assert.ok(Array.isArray(t.args), "args doit être un tableau");
                    assert.ok("attendu" in t || t.erreur === true, "attendu ou erreur requis");
                }
            });

            test("la fonction @testable existe", () => {
                const exo = parserExercice(lireFichier(`app/${chemin}`), 0);
                const code = exo.before + exo.student + exo.after;
                assert.doesNotThrow(() => chargerFonction(code, exo.testable, createAliases(fausseSortie())));
            });
        });
    }
});
