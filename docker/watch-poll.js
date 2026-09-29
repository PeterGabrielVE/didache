// Docker en Windows: los cambios hechos desde el host en un bind mount no
// generan eventos inotify dentro del contenedor, y Metro no tiene modo polling.
// Este script sondea los archivos y, al detectar un cambio, re-aplica su propio
// mtime (utimes) desde dentro del contenedor, lo que sí dispara inotify.
const fs = require('fs');
const path = require('path');

const ROOT = process.env.WATCH_ROOT || '/app';
const INTERVAL = Number(process.env.WATCH_INTERVAL_MS || 1000);
const IGNORE = new Set(['node_modules', '.git', '.expo', 'dist', 'web-build', 'android', 'ios']);

const mtimes = new Map();

function scan(dir, found) {
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const entry of entries) {
    if (IGNORE.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) scan(full, found);
    else if (entry.isFile()) found.push(full);
  }
}

function poll(initial) {
  const files = [];
  scan(ROOT, files);
  const seen = new Set();
  for (const file of files) {
    seen.add(file);
    let stat;
    try {
      stat = fs.statSync(file);
    } catch {
      continue;
    }
    const prev = mtimes.get(file);
    mtimes.set(file, stat.mtimeMs);
    if (initial || prev === stat.mtimeMs) continue;
    try {
      fs.utimesSync(file, stat.atime, stat.mtime);
    } catch {}
  }
  for (const file of mtimes.keys()) {
    if (seen.has(file)) continue;
    mtimes.delete(file);
    // Archivo borrado: tocar el directorio padre para que Metro lo note.
    try {
      const dir = path.dirname(file);
      const stat = fs.statSync(dir);
      fs.utimesSync(dir, stat.atime, stat.mtime);
    } catch {}
  }
}

poll(true);
setInterval(() => poll(false), INTERVAL);
console.log(`[watch-poll] sondeando ${ROOT} cada ${INTERVAL}ms`);
