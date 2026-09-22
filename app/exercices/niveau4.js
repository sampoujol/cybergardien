/*
@title Niveau 4 – La moyenne impossible

@memo
Avant de diviser, vérifie que le diviseur ne peut pas valoir 0 :
0 / 0 donne NaN (Not a Number).
Les bornes s'appliquent à CHAQUE élément d'une liste :
une seule note hors limites rend la moyenne fausse.

@consigne
La fonction moyenne reçoit un tableau de notes et renvoie leur moyenne.
Si le tableau est vide ou si une note n'est pas comprise entre 0 et 20,
elle doit appeler echoue("Notes invalides").

@tests
[
  { "args": [[12, 14]], "attendu": 13 },
  { "args": [[10, 11, 12]], "attendu": 11 },
  { "args": [[0, 20]], "attendu": 10 },
  { "args": [[20]], "attendu": 20 },
  { "args": [[]], "erreur": true },
  { "args": [[12, 25]], "erreur": true },
  { "args": [[-1, 10]], "erreur": true }
]
@testable moyenne
*/

function moyenne(notes) {
    // @STUDENT-START
    let somme = 0;
    for (const note of notes) {
        somme = somme + note;
    }
    return somme / notes.length;
    // @STUDENT-END
}

/* @main */
let saisie = prompt("Notes séparées par des espaces (ex : 12 15 9)");
let notes = saisie.split(" ").map(nombre);
affiche("Moyenne : " + moyenne(notes));
