async function chargerExercices() {
    const conf = await fetch("config.json").then(r => r.json());
    const zone = document.getElementById("zone-exercices");
    com=0;
    for (let path of conf.exercices) {
        const src = await fetch(path).then(r => r.text());
        const exo = parserExercice(src,com);
        zone.appendChild(creerUI(exo));
        com++;
    }
}

function parserExercice(src,com) {
    return {
        num: com,
        title: extraire(src, "title"),
        memo: extraire(src, "memo"),
        consigne: extraire(src, "consigne"),
        tests: JSON.parse(extraire(src, "tests")),
        before: src.split("// @STUDENT-START")[0],
        student: src.split("// @STUDENT-START")[1].split("// @STUDENT-END")[0],
        after: src.split("// @STUDENT-END")[1],
        main: src.split("/* @main */")[1]
    };
}

function extraire(src, tag) {
    const r = new RegExp(`@${tag}([\\s\\S]*?)(@|\\*/)`);
    const m = src.match(r);
    if (!m) {
        throw "Tag @" + tag + " introuvable dans l'exercice";
    }
    return m[1].trim();
}
function collapseTags(texte) {
    // Normalise les retours à la ligne pour garantir \n
    const normalise = texte.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

    // Supprime les tags et leur contenu
    const sansTags = normalise.replace(/@\w+[\s\S]*?(?=\n\s*\n|\*\/|$)/g, '');

    // Nettoie les lignes vides multiples qui pourraient résulter
    return sansTags.replace(/\n\s*\n\s*\n+/g, '\n\n');
}


function extraireSignature(code) {
    const m = code.match(/function\s+(\w+)\s*\(([^)]*)\)/);
    return {
        nom: m[1],
        params: m[2].split(",").map(p=>p.trim()).filter(p=>p)
    };
}

function creerUI(exo) {
    const s = document.createElement("section");
    s.className = "section_niveau";
    const cleanBefore=collapseTags(exo.before);
    console.log(cleanBefore);
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
    //bugfix
    setTimeout(function(){
        editor.refresh();
    }, 100);
    s.querySelector(".run").onclick  = ()=> runExo(exo, editor, s);
    s.querySelector(".test").onclick = ()=> testExo(exo, editor, s);

    return s;
}


function runExo(exo, editor, s) {
    setContexte({ output: s.querySelector(".output") });
    contexte.output.textContent = "";

    const code = exo.before + editor.getValue() + exo.after;
    const sig = extraireSignature(code);
    let fsrc = code.match(/function[\s\S]*?}/)[0];
    fsrc+="\n";
    fsrc+=exo.main;
    console.log(fsrc);
    const f = new Function(fsrc);

    try {
        f();
    } catch(e) {
        affiche("💥 " + e.message);
    }
}

function testExo(exo, editor, s) {
    setContexte({ output: s.querySelector(".output") });
    contexte.output.textContent = "";

    const code = exo.before + editor.getValue() + exo.after;
    const sig = extraireSignature(code);
    const fsrc = code.match(/function[\s\S]*?\{([\s\S]*?)\}/);
    const functionBody = fsrc ? fsrc[1].trim() : null;
    const f = new Function(...sig.params, functionBody);

    for (let t of exo.tests) {
        try {
            const r = f(...t.args);
            if (t.erreur) affiche("❌ Ces paramètres ne sont pas acceptables:"+JSON.stringify(t.args));
            else if (r === t.attendu) affiche("✅ "+t.args.join(", ")+" --> "+t.attendu);
            else affiche("⚠️ "+r+" retourné au lieu de "+t.attendu);
        } catch {
            if (t.erreur) affiche("✅ Erreur détectée");
            else affiche("❌ Erreur inattendue");
        }
    }
}

window.addEventListener("DOMContentLoaded", chargerExercices);

