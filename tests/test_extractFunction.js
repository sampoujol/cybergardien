import { extractTestableFunction } from '../app/engine.js';

export function runTestsExtractFunction() {
    const results = [];

    // --- Test 1 : fonction simple ---
    try {
        const code = `function foo(a,b){ return a+b; }`;
        const fn = extractTestableFunction(code);
        results.push({
            name: "fonction simple",
            ok: fn === code
        });
    } catch (e) {
        results.push({ name: "fonction simple", ok: false, error: e.message });
    }

    // --- Test 2 : fonction avec accolades internes ---
    try {
        const code = `
        function bar(x){
            if(x>0){ return x; } else { return -x; }
        }`;
        const fn = extractTestableFunction(code);
        results.push({
            name: "accolades internes",
            ok: fn.replace(/\s/g,'') === code.replace(/\s/g,'')
        });
    } catch(e){
        results.push({ name: "accolades internes", ok:false, error:e.message });
    }

    // --- Test 3 : accolade fermante manquante ---
    try {
        const code = `function baz(x){ return x; `;
        extractTestableFunction(code);
        results.push({ name: "manque accolade", ok: false });
    } catch(e){
        results.push({ name: "manque accolade", ok: e.message.includes("Accolade fermante") });
    }

    return results;
}
