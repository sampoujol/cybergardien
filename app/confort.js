let contexte = null;

function setContexte(ctx) {
    contexte = ctx;
}

function affiche(msg) {
    if (!contexte) return;
    contexte.output.textContent += msg + "\n";
}

function echoue(msg) {
    affiche("❌ " + msg);
    throw new Error(msg);
}