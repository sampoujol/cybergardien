import { extraireSignature } from './utils.js';
import { createAliases } from './confort.js';

// Extrait une fonction testable depuis le code complet en comptant les accolades
export function extractTestableFunction(code) {
    const fnMatch = code.match(/function\s+\w+\s*\(/);
    if (!fnMatch) throw new Error("Fonction introuvable");
    let startIndex = fnMatch.index;
    const braceIndex = code.indexOf("{", startIndex);
    if (braceIndex === -1) throw new Error("Accolade ouvrante manquante");

    let depth = 0, endIndex = braceIndex;
    for (let i = braceIndex; i < code.length; i++) {
        if (code[i] === "{") depth++;
        else if (code[i] === "}") {
            depth--;
            if (depth === 0) { endIndex = i + 1; break; }
        }
    }
    if (depth !== 0) throw new Error("Accolade fermante manquante");
    return code.slice(startIndex, endIndex);
}

// Exécute un exercice complet (avec main) dans une zone output spécifique
export function runExo(code, main = "", outputElement = null) {
    const aliases = createAliases(outputElement);

    try {
        const fnCode = extractTestableFunction(code);
        new Function("aliases", `
            with (aliases) {
                ${fnCode}
                ${main}
            }
        `)(aliases);
    } catch (e) {
        aliases.affiche(`💥 Erreur : ${e.message}`);
    }
}

// Exécute les tests unitaires d'un exercice
export function testExo(code, tests, outputElement = null) {
    const aliases = createAliases(outputElement);

    let fnCode;
    try {
        fnCode = extractTestableFunction(code);
    } catch(e) {
        return aliases.affiche("💥 " + e.message);
    }

    const sig = extraireSignature(fnCode);
    const bodyMatch = fnCode.match(/\{([\s\S]*)\}$/);
    if (!bodyMatch) return aliases.affiche("💥 Impossible d'extraire le corps de la fonction");

    const f = new Function(...sig.params, "aliases", bodyMatch[1].trim());

    for (let t of tests) {
        try {
            const r = f(...t.args, aliases);
            if (t.erreur) aliases.affiche(`❌ Ces paramètres ne sont pas acceptables : ${JSON.stringify(t.args)}`);
            else if (r === t.attendu) aliases.affiche(`✅ ${t.args.join(", ")} --> ${t.attendu}`);
            else aliases.affiche(`⚠️ ${r} retourné au lieu de ${t.attendu}`);
        } catch {
            if (t.erreur) aliases.affiche("✅ Erreur détectée comme attendu");
            else aliases.affiche("❌ Erreur inattendue");
        }
    }
}
