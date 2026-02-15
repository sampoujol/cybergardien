// Alias français de fonctions natives et utilitaires
export const ALIASES = {
    mauvaisNombre: isNaN,
    nombre: Number
};

// Crée un jeu d'alias + fonctions d'affichage spécifique à une zone output
export function createAliases(outputElement = null) {
    const affiche = outputElement
        ? msg => { outputElement.textContent += msg + "\n"; }
        : console.log;

    const echoue = msg => {
        affiche("❌ " + msg);
        throw new Error(msg);
    };

    return { ...ALIASES, affiche, echoue };
}
