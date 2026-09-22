// Alias français de fonctions natives et utilitaires
export const ALIASES = {
    mauvaisNombre: isNaN,
    nombre: Number,
    estEntier: Number.isInteger
};

// Aide affichée dans la page : [utilisation, description], dans l'ordre d'affichage.
// Chaque fonction fournie par createAliases doit y figurer (vérifié par les tests).
export const AIDE = {
    affiche: ["affiche(message)", "Écrit une ligne dans la zone de sortie."],
    echoue: ["echoue(message)", "Refuse la saisie : arrête la fonction avec ce message."],
    nombre: ["nombre(x)", "Convertit x en nombre : nombre(\"12\") donne 12."],
    mauvaisNombre: ["mauvaisNombre(x)", "Vrai si x n'est pas un nombre : mauvaisNombre(\"abc\") donne true."],
    estEntier: ["estEntier(x)", "Vrai si x est un nombre entier : estEntier(3) donne true, estEntier(2.5) donne false."],
    requete: ["requete(sql)", "Exécute une requête SQL et renvoie les lignes trouvées : [{ colonne: valeur, … }]. Exercices avec base de données."],
    requetePreparee: ["requetePreparee(sql, valeurs)", "Comme requete, mais chaque ? est remplacé par une valeur du tableau, sans risque d'injection. Exercices avec base de données."]
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

    // Remplacées par une vraie base (sgbd.js) dans les exercices qui déclarent @sql
    const sansBase = () => {
        throw new Error("Cet exercice n'a pas de base de données (tag @sql)");
    };

    return { ...ALIASES, affiche, echoue, requete: sansBase, requetePreparee: sansBase };
}
