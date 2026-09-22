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
