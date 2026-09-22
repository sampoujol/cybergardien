import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { testExo } from '../app/engine.js';
import { parserExercice } from '../app/utils.js';
import { fausseSortie, lireFichier } from './helpers.js';

// Solution de référence de chaque exercice : le contenu attendu de la zone élève
const SOLUTIONS = {
    "exercices/niveau1.js": `
        const a = nombre(prix1), b = nombre(prix2);
        if (mauvaisNombre(a) || mauvaisNombre(b)) echoue("Saisie invalide");
        return a + b;`,

    "exercices/niveau2.js": `
        let choix = nombre(saisie);
        if (estEntier(choix) && choix >= 1 && choix <= MENU.length) {
            return MENU[choix - 1];
        }
        echoue("Choix invalide");`,

    "exercices/niveau3.js": `
        if (saisie.length !== 4) {
            echoue("PIN invalide");
        }
        for (const c of saisie) {
            if (!"0123456789".includes(c)) echoue("PIN invalide");
        }
        return saisie;`,

    "exercices/niveau4.js": `
        if (notes.length === 0) echoue("Notes invalides");
        let somme = 0;
        for (const note of notes) {
            if (note < 0 || note > 20) echoue("Notes invalides");
            somme = somme + note;
        }
        return somme / notes.length;`
};

const { exercices } = JSON.parse(lireFichier("app/config.json"));

for (const chemin of exercices) {
    describe(chemin, () => {
        const exo = parserExercice(lireFichier(`app/${chemin}`), 0);
        const tester = codeEleve =>
            testExo(exo.before + codeEleve + exo.after, exo.testable, exo.tests, fausseSortie());

        test("a une solution de référence", () => {
            assert.ok(chemin in SOLUTIONS, `ajouter la solution de ${chemin} dans SOLUTIONS`);
        });

        test("le code de départ échoue au moins un test", () => {
            const resultats = tester(exo.student);
            assert.equal(resultats.length, exo.tests.length);
            assert.ok(resultats.some(r => !r.ok), "l'exercice est déjà résolu");
        });

        test("la solution de référence passe tous les tests", { skip: !(chemin in SOLUTIONS) }, () => {
            const echecs = tester(SOLUTIONS[chemin]).filter(r => !r.ok).map(r => JSON.stringify(r.args));
            assert.deepEqual(echecs, []);
        });
    });
}
