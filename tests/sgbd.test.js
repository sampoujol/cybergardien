import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { creerBase, decrireBase } from '../app/sgbd.js';
import { chargerSql } from './helpers.js';

const SCRIPT = `
CREATE TABLE utilisateurs (login TEXT, mdp TEXT);
INSERT INTO utilisateurs VALUES ('alice', 'secret');
INSERT INTO utilisateurs VALUES ('o''brien', 'trèfle');
`;

// Chaque fichier de test tourne dans son propre processus : SQLite n'est pas encore chargé ici
test("erreur claire si SQLite n'est pas chargé", () => {
    assert.throws(() => creerBase(SCRIPT), /SQLite n'est pas chargé/);
});

await chargerSql();

describe("creerBase : requete", () => {
    test("renvoie les lignes sous forme d'objets", () => {
        const { aliases } = creerBase(SCRIPT);
        assert.deepEqual(aliases.requete("SELECT * FROM utilisateurs WHERE login = 'alice'"),
            [{ login: "alice", mdp: "secret" }]);
    });

    test("tableau vide si aucune ligne", () => {
        const { aliases } = creerBase(SCRIPT);
        assert.deepEqual(aliases.requete("SELECT * FROM utilisateurs WHERE login = 'zoe'"), []);
    });

    test("est vulnérable à l'injection, comme une vraie concaténation", () => {
        const { aliases } = creerBase(SCRIPT);
        const saisie = "' OR '1'='1";
        const lignes = aliases.requete(`SELECT * FROM utilisateurs WHERE login = '${saisie}'`);
        assert.equal(lignes.length, 2);
    });

    test("exécute plusieurs instructions et renvoie le résultat de la dernière", () => {
        const { aliases } = creerBase(SCRIPT);
        const lignes = aliases.requete("DELETE FROM utilisateurs WHERE login = 'alice'; SELECT login FROM utilisateurs");
        assert.deepEqual(lignes, [{ login: "o'brien" }]);
    });

    test("une erreur SQL est levée", () => {
        const { aliases } = creerBase(SCRIPT);
        assert.throws(() => aliases.requete("SELECT * FROM utilisateurs WHERE login = 'o'brien'"), /syntax error/);
    });
});

describe("creerBase : requetePreparee", () => {
    test("remplace les ? par les valeurs", () => {
        const { aliases } = creerBase(SCRIPT);
        assert.deepEqual(aliases.requetePreparee("SELECT mdp FROM utilisateurs WHERE login = ?", ["o'brien"]),
            [{ mdp: "trèfle" }]);
    });

    test("une injection reste une simple valeur", () => {
        const { aliases } = creerBase(SCRIPT);
        assert.deepEqual(aliases.requetePreparee("SELECT * FROM utilisateurs WHERE login = ?", ["' OR '1'='1"]), []);
    });

    test("exige un tableau de valeurs", () => {
        const { aliases } = creerBase(SCRIPT);
        assert.throws(() => aliases.requetePreparee("SELECT * FROM utilisateurs WHERE login = ?", "alice"),
            /attend un tableau/);
    });
});

describe("creerBase : isolation et journal", () => {
    test("chaque base est indépendante", () => {
        const a = creerBase(SCRIPT), b = creerBase(SCRIPT);
        a.aliases.requete("DROP TABLE utilisateurs");
        assert.equal(b.aliases.requete("SELECT * FROM utilisateurs").length, 2);
    });

    test("le journal reçoit chaque requête", () => {
        const journal = [];
        const { aliases } = creerBase(SCRIPT, m => journal.push(m));
        aliases.requete("SELECT 1");
        aliases.requetePreparee("SELECT ?", [2]);
        assert.deepEqual(journal, ["🗄️ SELECT 1", '🗄️ SELECT ?   ← [2]']);
    });

    test("script invalide", () => {
        assert.throws(() => creerBase("CREATE TABLE ("), /Script @sql invalide/);
    });

    test("fermer rend la base inutilisable", () => {
        const base = creerBase(SCRIPT);
        base.fermer();
        assert.throws(() => base.aliases.requete("SELECT 1"));
    });
});

describe("decrireBase", () => {
    test("décrit chaque table avec ses colonnes et ses lignes", () => {
        assert.deepEqual(decrireBase(SCRIPT + "CREATE TABLE vide (x INTEGER);"), [
            { nom: "utilisateurs", colonnes: ["login", "mdp"], lignes: [["alice", "secret"], ["o'brien", "trèfle"]] },
            { nom: "vide", colonnes: ["x"], lignes: [] }
        ]);
    });
});
