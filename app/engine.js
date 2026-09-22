import { createAliases } from './confort.js';

// Exécute du code avec les alias en portée, puis la suite éventuelle (ex: un return)
function executer(code, aliases, suite = "") {
    return new Function("aliases", `
        with (aliases) {
            ${code}
            ${suite}
        }
    `)(aliases);
}

// Exécute le code de l'exercice et renvoie la fonction nommée par @testable.
// C'est le moteur JavaScript qui lit le code : chaînes, commentaires et regex sont gérés correctement.
export function chargerFonction(code, nom, aliases) {
    if (!/^[\p{L}_$][\p{L}\p{N}_$]*$/u.test(nom)) throw new Error(`Nom de fonction invalide : « ${nom} »`);
    const fn = executer(code, aliases, `return typeof ${nom} === "function" ? ${nom} : undefined;`);
    if (!fn) throw new Error(`Fonction ${nom} introuvable`);
    return fn;
}

// Exécute un exercice complet (avec main) dans une zone output spécifique
export function runExo(code, main = "", outputElement = null) {
    const aliases = createAliases(outputElement);

    try {
        executer(code + "\n" + main, aliases);
    } catch (e) {
        aliases.affiche(`💥 Erreur : ${e.message}`);
    }
}

// Exécute les tests unitaires d'un exercice sur la fonction nommée
export function testExo(code, nom, tests, outputElement = null) {
    const aliases = createAliases(outputElement);

    let f;
    try {
        f = chargerFonction(code, nom, aliases);
    } catch (e) {
        return aliases.affiche("💥 " + e.message);
    }

    for (let t of tests) {
        try {
            const r = f(...t.args);
            if (t.erreur) aliases.affiche(`❌ Ces paramètres ne sont pas acceptables : ${JSON.stringify(t.args)}`);
            else if (r === t.attendu) aliases.affiche(`✅ ${t.args.join(", ")} --> ${t.attendu}`);
            else aliases.affiche(`⚠️ ${r} retourné au lieu de ${t.attendu}`);
        } catch {
            if (t.erreur) aliases.affiche("✅ Erreur détectée comme attendu");
            else aliases.affiche("❌ Erreur inattendue");
        }
    }
}
