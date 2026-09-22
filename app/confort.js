// Alias français de fonctions natives et utilitaires
export const ALIASES = {
    mauvaisNombre: isNaN,
    nombre: Number,
    estEntier: Number.isInteger
};

// Erreur levée volontairement par echoue() : une saisie refusée, pas un bug
export class Echec extends Error {
    name = "Echec";
}

// Crée un jeu d'alias + fonctions d'affichage spécifique à une zone output
export function createAliases(outputElement = null) {
    const affiche = outputElement
        ? msg => { outputElement.textContent += msg + "\n"; }
        : console.log;

    // L'affichage du refus revient à runExo / testExo
    const echoue = msg => {
        throw new Echec(msg);
    };

    return { ...ALIASES, affiche, echoue };
}
