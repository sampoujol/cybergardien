export function extraire(src, tag, obligatoire = true) {
    const r = new RegExp(`@${tag}\\b([\\s\\S]*?)(@|\\*/)`);
    const m = src.match(r);
    if (!m) {
        if (!obligatoire) return null;
        throw new Error(`Tag @${tag} introuvable`);
    }
    return m[1].trim();
}

export function collapseTags(texte) {
    const normalise = texte.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    const sansTags = normalise.replace(/@\w+[\s\S]*?(?=\n\s*\n|\*\/|$)/g, '');
    return sansTags.replace(/\n\s*\n\s*\n+/g, '\n\n');
}

function lireTests(json) {
    try {
        return JSON.parse(json);
    } catch (e) {
        throw new Error(`@tests n'est pas du JSON valide : ${e.message}`);
    }
}

export function parserExercice(src, com) {
    const beforeSplit = src.split("// @STUDENT-START");
    if (beforeSplit.length !== 2) throw new Error("Il faut exactement un marqueur // @STUDENT-START");
    const afterSplit = beforeSplit[1].split("// @STUDENT-END");
    if (afterSplit.length !== 2) throw new Error("Il faut exactement un marqueur // @STUDENT-END");
    const mainSplit = afterSplit[1].split("/* @main */");

    return {
        num: com,
        title: extraire(src, "title"),
        memo: extraire(src, "memo"),
        consigne: extraire(src, "consigne"),
        tests: lireTests(extraire(src, "tests")),
        testable: extraire(src, "testable"),
        sql: extraire(src, "sql", false),
        before: beforeSplit[0],
        student: afterSplit[0],
        after: mainSplit[0],
        main: mainSplit[1] || ""
    };
}

export function echapperHtml(texte) {
    return texte.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

// Motif d'un appel d'alias : le nom, suivi d'une parenthèse ouvrante
export function motifAlias(noms) {
    return `(?:${noms.join("|")})(?=\\s*\\()`;
}

// Échappe le code puis entoure chaque appel d'alias d'un <span class="alias">.
// Les mots ordinaires ("nombre" dans un commentaire) ne sont pas touchés.
export function surlignerAliases(code, aide) {
    const motif = new RegExp(`(?<![\\w$.])${motifAlias(Object.keys(aide))}`, "g");
    return echapperHtml(code).replace(motif, nom =>
        `<span class="alias" title="${echapperHtml(aide[nom][1])}">${nom}</span>`
    );
}
