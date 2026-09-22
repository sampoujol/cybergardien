// Accès à SQLite (sql.js, WebAssembly) pour les exercices qui déclarent une base avec @sql.
// Le module sql.js est chargé par le navigateur (ui.js) ou par Node (tests), puis transmis ici.
let SQL = null;

export function definirSql(module) {
    SQL = module;
}

function ouvrir(script) {
    if (!SQL) throw new Error("SQLite n'est pas chargé");
    const db = new SQL.Database();
    try {
        db.run(script);
    } catch (e) {
        db.close();
        throw new Error(`Script @sql invalide : ${e.message}`);
    }
    return db;
}

function versObjets({ columns, values }) {
    return values.map(ligne => Object.fromEntries(columns.map((c, i) => [c, ligne[i]])));
}

// Crée une base neuve en mémoire à partir du script @sql et renvoie les alias qui l'interrogent.
// journal(message), s'il est fourni, reçoit chaque requête exécutée (Lancer les affiche à l'élève).
export function creerBase(script, journal = null) {
    const db = ouvrir(script);

    // Exécute le texte tel quel, plusieurs instructions comprises : c'est ce qui rend l'injection possible
    const requete = sql => {
        journal?.(`🗄️ ${sql}`);
        const resultats = db.exec(String(sql));
        return resultats.length ? versObjets(resultats.at(-1)) : [];
    };

    // Chaque ? est remplacé par une valeur du tableau, sans jamais être interprété comme du SQL
    const requetePreparee = (sql, valeurs = []) => {
        if (!Array.isArray(valeurs)) {
            throw new TypeError("requetePreparee attend un tableau de valeurs : requetePreparee(sql, [a, b])");
        }
        journal?.(`🗄️ ${sql}   ← ${JSON.stringify(valeurs)}`);
        const stmt = db.prepare(String(sql));
        try {
            stmt.bind(valeurs);
            const lignes = [];
            while (stmt.step()) lignes.push(stmt.getAsObject());
            return lignes;
        } finally {
            stmt.free();
        }
    };

    return { aliases: { requete, requetePreparee }, fermer: () => db.close() };
}

// Contenu de chaque table, pour le montrer à l'élève : [{ nom, colonnes, lignes }]
export function decrireBase(script) {
    const db = ouvrir(script);
    try {
        const noms = db.exec("SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY rowid")[0]?.values ?? [];
        return noms.map(([nom]) => {
            const id = `"${nom.replace(/"/g, '""')}"`;
            const colonnes = db.exec(`PRAGMA table_info(${id})`)[0].values.map(c => c[1]);
            const lignes = db.exec(`SELECT * FROM ${id}`)[0]?.values ?? [];
            return { nom, colonnes, lignes };
        });
    } finally {
        db.close();
    }
}
