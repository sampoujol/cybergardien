import { createAliases, Echec } from './confort.js';

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
        if (e instanceof Echec) aliases.affiche(`❌ ${e.message}`);
        else aliases.affiche(`💥 Erreur : ${e.message}`);
    }
}

// Affiche les chaînes entre guillemets pour que l'élève distingue "15" de 15
function formater(valeur) {
    if (typeof valeur === "string" || (typeof valeur === "object" && valeur !== null)) return JSON.stringify(valeur);
    return String(valeur);
}

function decrireErreur(e) {
    return e instanceof Error ? `${e.name} : ${e.message}` : String(e);
}

// Exécute un cas de test et renvoie { ok, message }
function juger(f, nom, t) {
    const cas = `${nom}(${t.args.map(formater).join(", ")})`;
    let r;
    try {
        r = f(...t.args);
    } catch (e) {
        if (e instanceof Echec) {
            return t.erreur
                ? { ok: true, message: `✅ ${cas} refusé : ${e.message}` }
                : { ok: false, message: `❌ ${cas} refusé à tort : ${e.message}` };
        }
        return t.erreur
            ? { ok: false, message: `💥 ${cas} plante au lieu d'appeler echoue (${decrireErreur(e)})` }
            : { ok: false, message: `💥 ${cas} plante (${decrireErreur(e)})` };
    }
    if (t.erreur) return { ok: false, message: `❌ ${cas} → ${formater(r)} au lieu d'être refusé` };
    if (r === t.attendu) return { ok: true, message: `✅ ${cas} → ${formater(r)}` };
    return { ok: false, message: `⚠️ ${cas} → ${formater(r)} au lieu de ${formater(t.attendu)}` };
}

// Exécute les tests unitaires d'un exercice sur la fonction nommée, affiche
// un verdict par cas puis le bilan. Renvoie un résultat par cas : { args, ok, message }
export function testExo(code, nom, tests, outputElement = null) {
    const aliases = createAliases(outputElement);

    let f;
    try {
        f = chargerFonction(code, nom, aliases);
    } catch (e) {
        aliases.affiche("💥 " + e.message);
        return [];
    }

    const resultats = [];
    for (const t of tests) {
        const { ok, message } = juger(f, nom, t);
        aliases.affiche(message);
        resultats.push({ args: t.args, ok, message });
    }

    const reussis = resultats.filter(r => r.ok).length;
    const total = resultats.length;
    aliases.affiche("");
    const s = total > 1 ? "s" : "";
    aliases.affiche(`${reussis === total ? "🎉" : "📊"} Bilan : ${reussis}/${total} test${s} réussi${s}`);
    return resultats;
}
