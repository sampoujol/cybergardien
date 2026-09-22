# sql.js 1.14.2

SQLite compilé en WebAssembly, copié tel quel depuis le paquet npm [`sql.js`](https://www.npmjs.com/package/sql.js) (`dist/sql-wasm.js` et `dist/sql-wasm.wasm`).

- Source : https://github.com/sql-js/sql.js
- Licence : MIT (voir `LICENSE` et `AUTHORS`)

Le `package.json` de ce dossier indique à Node que `sql-wasm.js` est un module CommonJS (le reste du projet est en modules ES). Il est sans effet dans le navigateur.

Mise à jour : `npm pack sql.js`, puis remplacer `sql-wasm.js` et `sql-wasm.wasm` par ceux de `package/dist/`.
