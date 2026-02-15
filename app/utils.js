export function extraire(src, tag) {
    const r = new RegExp(`@${tag}([\\s\\S]*?)(@|\\*/)`);
    const m = src.match(r);
    if (!m) throw new Error(`Tag @${tag} introuvable`);
    return m[1].trim();
}

export function collapseTags(texte) {
    const normalise = texte.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    const sansTags = normalise.replace(/@\w+[\s\S]*?(?=\n\s*\n|\*\/|$)/g, '');
    return sansTags.replace(/\n\s*\n\s*\n+/g, '\n\n');
}

export function extraireSignature(code) {
    const m = code.match(/function\s+(\w+)\s*\(([^)]*)\)/);
    if (!m) throw new Error("Impossible d'extraire la signature de la fonction");
    return { nom: m[1], params: m[2].split(",").map(p=>p.trim()).filter(p=>p) };
}

export function parserExercice(src, com) {
    const beforeSplit = src.split("// @STUDENT-START");
    const afterSplit = beforeSplit[1].split("// @STUDENT-END");

    return {
        num: com,
        title: extraire(src, "title"),
        memo: extraire(src, "memo"),
        consigne: extraire(src, "consigne"),
        tests: JSON.parse(extraire(src, "tests")),
        before: beforeSplit[0],
        student: afterSplit[0],
        after: afterSplit[1],
        main: src.split("/* @main */")[1] || ""
    };
}
