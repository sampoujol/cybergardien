import { runExo, testExo } from './engine.js';
import { parserExercice, collapseTags } from './utils.js';

export function creerUI(exo) {
    const s = document.createElement("section");
    s.className = "section_niveau";
    const cleanBefore = collapseTags(exo.before);

    s.innerHTML = `
        <h3>${exo.title}</h3>
        <div class="consigne"><b>Mémo</b><br>${exo.memo.replace(/\n/g,"<br>")}</div>
        <div class="consigne">${exo.consigne}</div> 
        <div class="code">
            <pre class="readonly">${cleanBefore}</pre>
            <textarea id="ta${exo.num}">${exo.student.trim()}</textarea>
            <pre class="readonly">${exo.after}${exo.main ? "/* @main */" + exo.main : ""}</pre>
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
    setTimeout(()=>editor.refresh(),100);
    const output = s.querySelector(".output");


    const code = () => exo.before + editor.getValue() + exo.after;

    s.querySelector(".run").onclick = () => {
        output.textContent = "";
        runExo(code(), exo.main, output);
    };

    s.querySelector(".test").onclick = () => {
        output.textContent = "";
        testExo(code(), exo.testable, exo.tests, output);
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
            zone.appendChild(creerUI(exo));
        } catch (e) {
            zone.appendChild(creerErreur(path, e));
        }
        com++;
    }
}
