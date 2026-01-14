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
