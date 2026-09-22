/*
@title Niveau 5 – Le boss de fin : la porte dérobée

@memo
Une requête SQL construite en collant des morceaux de texte est dangereuse :
une apostrophe dans la saisie ferme la chaîne SQL, et la suite de la saisie
devient du code SQL. Avec ' OR '1'='1, la condition devient toujours vraie :
c'est une injection SQL.
Une requête préparée sépare le code SQL (avec des ?) des valeurs saisies :
requetePreparee("SELECT * FROM t WHERE nom = ?", [nom])
Dans une vraie application, les mots de passe seraient en plus hachés.

@consigne
La fonction connexion doit renvoyer true si l'identifiant et le mot de passe
correspondent à un utilisateur de la table utilisateurs, et false sinon.
Aucune saisie ne doit permettre d'entrer sans connaître le mot de passe.
Attention : certains identifiants contiennent une apostrophe et doivent fonctionner.
Clique sur Lancer pour voir la requête réellement envoyée à la base.

@sql
CREATE TABLE utilisateurs (login TEXT, mdp TEXT, role TEXT);
INSERT INTO utilisateurs VALUES ('alice', 'secret', 'élève');
INSERT INTO utilisateurs VALUES ('bob', 'azerty', 'élève');
INSERT INTO utilisateurs VALUES ('o''brien', 'trèfle', 'professeur');
INSERT INTO utilisateurs VALUES ('admin', 'Xk9#pL2!', 'administrateur');

@tests
[
  { "args": ["alice", "secret"], "attendu": true },
  { "args": ["alice", "faux"], "attendu": false },
  { "args": ["bob", "secret"], "attendu": false },
  { "args": ["o'brien", "trèfle"], "attendu": true },
  { "args": ["' OR '1'='1", "' OR '1'='1"], "attendu": false },
  { "args": ["admin' --", "n'importe quoi"], "attendu": false },
  { "args": ["personne", "' OR login = 'admin"], "attendu": false }
]
@testable connexion
*/

function connexion(identifiant, motDePasse) {
    // @STUDENT-START
    const lignes = requete(
        "SELECT * FROM utilisateurs WHERE login = '" + identifiant +
        "' AND mdp = '" + motDePasse + "'"
    );
    return lignes.length > 0;
    // @STUDENT-END
}

/* @main */
let identifiant = prompt("Identifiant (essaie : ' OR '1'='1)");
let motDePasse = prompt("Mot de passe (essaie : ' OR '1'='1)");
if (connexion(identifiant, motDePasse)) {
    affiche("✅ Bienvenue, " + identifiant);
} else {
    affiche("⛔ Accès refusé");
}
