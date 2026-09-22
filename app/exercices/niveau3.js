/*
@title Niveau 3 – Le code PIN

@memo
Avoir la bonne longueur ne suffit pas : "12a4" fait aussi 4 caractères.
Il faut vérifier chaque caractère, par exemple avec une boucle for...of
et "0123456789".includes(c).
Un code PIN n'est pas un nombre : nombre("0123") donne 123, le zéro est perdu.

@consigne
La fonction verifierPin doit renvoyer le PIN saisi, sous forme de texte,
s'il contient exactement 4 chiffres.
Sinon, elle doit appeler echoue("PIN invalide").

@tests
[
  { "args": ["1234"], "attendu": "1234" },
  { "args": ["0123"], "attendu": "0123" },
  { "args": ["123"], "erreur": true },
  { "args": ["12345"], "erreur": true },
  { "args": ["12a4"], "erreur": true },
  { "args": ["12.4"], "erreur": true },
  { "args": [" 123"], "erreur": true },
  { "args": [""], "erreur": true }
]
@testable verifierPin
*/

function verifierPin(saisie) {
    // @STUDENT-START
    if (saisie.length !== 4) {
        echoue("PIN invalide");
    }
    return nombre(saisie);
    // @STUDENT-END
}

/* @main */
let pin = verifierPin(prompt("Choisissez un code PIN à 4 chiffres"));
affiche("PIN enregistré : " + pin);
