/*
@title Niveau 2 – Le menu qui dit oui à tout

@memo
Pour vérifier qu'une valeur est ENTRE deux bornes, les deux conditions
doivent être vraies en même temps : on utilise && (et), pas || (ou).
estEntier(x) indique si x est un nombre entier (2.5 n'en est pas un).

@consigne
La fonction interpreterChoix doit renvoyer l'action correspondant au choix (de 1 à 4).
Pour tout autre choix, elle doit appeler echoue("Choix invalide").

@tests
[
  { "args": ["1"], "attendu": "Jouer" },
  { "args": ["3"], "attendu": "Scores" },
  { "args": ["4"], "attendu": "Quitter" },
  { "args": ["0"], "erreur": true },
  { "args": ["5"], "erreur": true },
  { "args": ["-2"], "erreur": true },
  { "args": ["2.5"], "erreur": true },
  { "args": ["abc"], "erreur": true }
]
@testable interpreterChoix
*/

const MENU = ["Jouer", "Options", "Scores", "Quitter"];

function interpreterChoix(saisie) {
    // @STUDENT-START
    let choix = nombre(saisie);
    if (choix >= 1 || choix <= 4) {
        return MENU[choix - 1];
    }
    echoue("Choix invalide");
    // @STUDENT-END
}

/* @main */
affiche("1. Jouer   2. Options   3. Scores   4. Quitter");
let action = interpreterChoix(prompt("Votre choix ?"));
affiche("Vous avez choisi : " + action);
