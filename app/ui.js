import { runExo, testExo } from './engine.js';
import { parserExercice, collapseTags } from './utils.js';
import { createAliases } from './confort.js';

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
            <pre class="readonly">${exo.after}</pre>
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


    s.querySelector(".run").onclick = () => {
        output.textContent = "";
        runExo(exo.before + editor.getValue() + exo.after, exo.main, output);
    };

    s.querySelector(".test").onclick = () => {
        output.textContent = "";
        const results = testExo(exo.before + editor.getValue() + exo.after, exo.tests, output);
    };

    return s;
}

export async function chargerExercices() {
    const conf = await fetch("config.json").then(r=>r.json());
    const zone = document.getElementById("zone-exercices");
    let com=0;
    for (let path of conf.exercices) {
        const src = await fetch(path).then(r=>r.text());
        const exo = parserExercice(src, com); // parserExercice peut rester dans utils ou engine
        zone.appendChild(creerUI(exo));
        com++;
    }
}
