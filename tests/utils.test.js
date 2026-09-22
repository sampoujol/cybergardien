import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { extraire, collapseTags, parserExercice } from '../app/utils.js';
import { lireFichier } from './helpers.js';

const niveau1 = lireFichier("app/exercices/niveau1.js");

describe("extraire", () => {
    const src = `/*
@title Mon titre

@memo
Ligne 1
Ligne 2

@testable maFonction
*/`;

    test("lit un tag sur une ligne", () => {
        assert.equal(extraire(src, "title"), "Mon titre");
    });

    test("conserve les retours à la ligne", () => {
        assert.equal(extraire(src, "memo"), "Ligne 1\nLigne 2");
    });

    test("lit le dernier tag, terminé par */", () => {
        assert.equal(extraire(src, "testable"), "maFonction");
    });

    test("lève une erreur si le tag est absent", () => {
        assert.throws(() => extraire(src, "consigne"), /Tag @consigne introuvable/);
    });

    test("un @ dans le texte ne coupe pas le tag", { todo: "limite connue du format" }, () => {
        const s = "/*\n@memo Écrire à prof@lycee.fr\n*/";
        assert.equal(extraire(s, "memo"), "Écrire à prof@lycee.fr");
    });
});

describe("collapseTags", () => {
    test("retire les métadonnées de la partie affichée", () => {
        const { before } = parserExercice(niveau1, 0);
        const propre = collapseTags(before);
        assert.ok(!propre.includes("@"));
        assert.ok(propre.includes("function calculerTotal(prix1, prix2) {"));
    });

    test("ne laisse pas plus d'une ligne vide d'affilée", () => {
        const propre = collapseTags("/*\n@a x\n\n\n\n@b y\n*/\ncode");
        assert.ok(!/\n\s*\n\s*\n/.test(propre));
    });
});

describe("parserExercice", () => {
    const exo = parserExercice(niveau1, 7);

    test("lit les métadonnées", () => {
        assert.equal(exo.num, 7);
        assert.equal(exo.title, "Niveau 1 – On ne mélange pas les choux et les carottes");
        assert.ok(exo.memo.startsWith("Tout ce qui vient"));
        assert.ok(exo.consigne.includes("echoue(\"Saisie invalide\")"));
        assert.equal(exo.testable, "calculerTotal");
    });

    test("parse les tests en JSON", () => {
        assert.deepEqual(exo.tests, [
            { args: ["10", "5"], attendu: 15 },
            { args: ["1", "2"], attendu: 3 },
            { args: ["abc", "5"], erreur: true }
        ]);
    });

    test("isole la zone élève", () => {
        assert.equal(exo.student.trim(), "return prix1 + prix2;");
        assert.ok(exo.before.trimEnd().endsWith("function calculerTotal(prix1, prix2) {"));
        assert.ok(exo.after.trimStart().startsWith("}"));
    });

    test("before + student + after + main redonne le fichier sans les marqueurs", () => {
        const attendu = niveau1
            .replace("// @STUDENT-START", "")
            .replace("// @STUDENT-END", "");
        assert.equal(exo.before + exo.student + exo.after + "/* @main */" + exo.main, attendu);
    });

    test("sépare le bloc main du reste", () => {
        assert.ok(exo.main.includes("affiche(resultat);"));
        assert.ok(!exo.main.includes("function calculerTotal"));
        assert.ok(!exo.after.includes("@main"));
    });

    test("main vide si le bloc est absent", () => {
        const sansMain = niveau1.split("/* @main */")[0];
        assert.equal(parserExercice(sansMain, 0).main, "");
    });

    test("lève une erreur sans marqueur de début", () => {
        const sansZone = niveau1.replace("// @STUDENT-START", "");
        assert.throws(() => parserExercice(sansZone, 0), /@STUDENT-START/);
    });

    test("lève une erreur sans marqueur de fin", () => {
        const sansFin = niveau1.replace("// @STUDENT-END", "");
        assert.throws(() => parserExercice(sansFin, 0), /@STUDENT-END/);
    });

    test("lève une erreur sans @testable", () => {
        const sansTestable = niveau1.replace("@testable calculerTotal", "");
        assert.throws(() => parserExercice(sansTestable, 0), /Tag @testable introuvable/);
    });

    test("signale un JSON de tests invalide", () => {
        const jsonCasse = niveau1.replace('"attendu": 15 },', '"attendu": 15 }');
        assert.throws(() => parserExercice(jsonCasse, 0), /@tests n'est pas du JSON valide/);
    });
});
