import { runExo, testExo } from './engine.js';
import { parserExercice, collapseTags, echapperHtml, motifAlias, surlignerAliases } from './utils.js';
import { AIDE } from './confort.js';
import { definirSql, decrireBase } from './sgbd.js';

// Charge SQLite (WebAssembly) une seule fois, et seulement si un exercice déclare @sql
let sqlPret = null;
function chargerSql() {
    sqlPret ??= new Promise((ok, ko) => {
        const script = document.createElement("script");
        script.src = "vendor/sql.js/sql-wasm.js";
        script.onload = ok;
        script.onerror = () => ko(new Error("Impossible de charger SQLite (vendor/sql.js/sql-wasm.js)"));
        document.head.append(script);
    })
        .then(() => initSqlJs({ locateFile: fichier => `vendor/sql.js/${fichier}` }))
        .then(definirSql);
    return sqlPret;
}

// Tables de la base de l'exercice, affichées pour que l'élève connaisse les colonnes
function afficherBase(script) {
    const tables = decrireBase(script).map(({ nom, colonnes, lignes }) => `
        <table>
            <caption>${echapperHtml(nom)}</caption>
            <tr>${colonnes.map(c => `<th>${echapperHtml(c)}</th>`).join("")}</tr>
            ${lignes.map(l => `<tr>${l.map(v => `<td>${echapperHtml(String(v))}</td>`).join("")}</tr>`).join("")}
        </table>
    `).join("");
    return `<div class="base"><b>🗄️ Base de données</b>${tables}</div>`;
}

// Encadré listant les fonctions fournies à l'élève
function creerBoiteOutils() {
    const b = document.createElement("aside");
    b.className = "boite-outils";
    b.innerHTML = `
        <h3>🧰 Boîte à outils</h3>
        <p>Ces fonctions sont disponibles dans les exercices. Dans le code, elles apparaissent <span class="alias">en orange</span> ; survole-les pour un rappel.</p>
        <dl>
            ${Object.values(AIDE).map(([usage, role]) =>
                `<dt><code class="alias">${echapperHtml(usage)}</code></dt><dd>${echapperHtml(role)}</dd>`
            ).join("")}
        </dl>
    `;
    return b;
}

// Colore les appels d'alias dans les textes (mémo, consigne) sans toucher à leur HTML
function surlignerTextes(racine) {
    const marcheur = document.createTreeWalker(racine, NodeFilter.SHOW_TEXT);
    const noeuds = [];
    while (marcheur.nextNode()) noeuds.push(marcheur.currentNode);
    for (const noeud of noeuds) {
        const html = surlignerAliases(noeud.textContent, AIDE);
        if (html !== echapperHtml(noeud.textContent)) {
            const tmp = document.createElement("template");
            tmp.innerHTML = html;
            noeud.replaceWith(tmp.content);
        }
    }
}

// Colore les appels d'alias dans l'éditeur et affiche leur description au survol
function surlignerEditeur(editor) {
    const motif = new RegExp(`^${motifAlias(Object.keys(AIDE))}`);
    editor.addOverlay({
        token(stream) {
            const avant = stream.string.charAt(stream.pos - 1);
            if (!/[\w$.]/.test(avant) && stream.match(motif)) return "alias";
            stream.next();
            return null;
        }
    });
    editor.getWrapperElement().addEventListener("mouseover", e => {
        const nom = e.target.textContent;
        if (e.target.classList.contains("cm-alias") && AIDE[nom]) e.target.title = AIDE[nom][1];
    });
}

export function creerUI(exo) {
    const s = document.createElement("section");
    s.className = "section_niveau";
    const cleanBefore = collapseTags(exo.before);

    s.innerHTML = `
        <h3>${exo.title}</h3>
        <div class="consigne"><b>Mémo</b><br>${exo.memo.replace(/\n/g,"<br>")}</div>
        <div class="consigne">${exo.consigne}</div>
        ${exo.sql ? afficherBase(exo.sql) : ""}
        <div class="code">
            <pre class="readonly">${surlignerAliases(cleanBefore, AIDE)}</pre>
            <textarea id="ta${exo.num}">${echapperHtml(exo.student.trim())}</textarea>
            <pre class="readonly">${surlignerAliases(exo.after + (exo.main ? "/* @main */" + exo.main : ""), AIDE)}</pre>
        </div>
        <button class="run">▶ Lancer</button>
        <button class="test">🧪 Tester</button>
        <div class="resultat">
            Sortie:
            <pre class="output"></pre>
        </div>
    `;

    const editor = CodeMirror.fromTextArea(s.querySelector("textarea"), {
        mode: "javascript",
        theme: "dracula",
        lineNumbers: true
    });
    s.querySelectorAll(".consigne").forEach(surlignerTextes);
    surlignerEditeur(editor);
    setTimeout(()=>editor.refresh(),100);
    const output = s.querySelector(".output");


    const code = () => exo.before + editor.getValue() + exo.after;

    s.querySelector(".run").onclick = () => {
        output.textContent = "";
        runExo(code(), exo.main, output, exo.sql);
    };

    s.querySelector(".test").onclick = () => {
        output.textContent = "";
        testExo(code(), exo.testable, exo.tests, output, exo.sql);
    };

    return s;
}

// Section affichée à la place d'un exercice qui n'a pas pu être chargé
function creerErreur(path, erreur) {
    console.error(`Exercice ${path} :`, erreur);
    const s = document.createElement("section");
    s.className = "section_niveau erreur";
    const titre = document.createElement("h3");
    titre.textContent = `⚠️ Exercice ${path}`;
    const message = document.createElement("pre");
    message.textContent = erreur.message;
    s.append(titre, message);
    return s;
}

export async function chargerExercices() {
    const zone = document.getElementById("zone-exercices");
    zone.before(creerBoiteOutils());
    let conf;
    try {
        conf = await fetch("config.json").then(r => r.json());
    } catch (e) {
        return zone.appendChild(creerErreur("config.json", e));
    }

    let com = 0;
    for (let path of conf.exercices) {
        // Un exercice défectueux ne doit pas empêcher l'affichage des suivants
        try {
            const reponse = await fetch(path);
            if (!reponse.ok) throw new Error(`Fichier introuvable (HTTP ${reponse.status})`);
            const exo = parserExercice(await reponse.text(), com);
            if (exo.sql) await chargerSql();
            zone.appendChild(creerUI(exo));
        } catch (e) {
            zone.appendChild(creerErreur(path, e));
        }
        com++;
    }
}
