import { readFileSync } from 'node:fs';

// Remplace l'élément <pre class="output"> du navigateur
export function fausseSortie() {
    return { textContent: "" };
}

// Lignes non vides écrites dans une sortie
export function lignes(sortie) {
    return sortie.textContent.split("\n").filter(l => l !== "");
}

// Lit un fichier à partir de la racine du dépôt
export function lireFichier(chemin) {
    return readFileSync(new URL(`../${chemin}`, import.meta.url), "utf8");
}

// Charge sql.js (copie dans app/vendor) pour les exercices qui déclarent @sql
export async function chargerSql() {
    const { createRequire } = await import('node:module');
    const { fileURLToPath } = await import('node:url');
    const { definirSql } = await import('../app/sgbd.js');
    const dossier = new URL("../app/vendor/sql.js/", import.meta.url);
    const initSqlJs = createRequire(import.meta.url)(fileURLToPath(new URL("sql-wasm.js", dossier)));
    definirSql(await initSqlJs({ locateFile: fichier => fileURLToPath(new URL(fichier, dossier)) }));
}
