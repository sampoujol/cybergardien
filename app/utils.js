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
        before: beforeSplit[0],
        student: afterSplit[0],
        after: mainSplit[0],
        main: mainSplit[1] || ""
    };
}
