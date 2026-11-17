// Copy the real engines of my other apps into vendor/<app>/, following relative
// imports from a few entry files (tests left out). Run after changing those apps:
//   node scripts/vendor.mjs            (expects the repos next to this one)
import { readFileSync, writeFileSync, mkdirSync, rmSync, existsSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const projets = resolve(root, '..');
const APPS = {
  dada: { src: 'dada/src/game', entries: ['engine.ts', 'bot.ts', 'board.ts', 'variants.ts'] },
  aplat: { src: 'aplat/src/lib', entries: ['moteur.ts', 'svg.ts', 'palettes.ts'] },
};

for (const [app, { src, entries }] of Object.entries(APPS)) {
  const from = join(projets, src);
  const to = join(root, 'vendor', app);
  rmSync(to, { recursive: true, force: true });
  const seen = new Set();
  const visit = (file) => {
    for (const cand of [file, file + '.ts', file + '.tsx', join(file, 'index.ts')]) {
      if (!existsSync(cand) || seen.has(cand) || !/\.tsx?$/.test(cand)) continue;
      seen.add(cand);
      const code = readFileSync(cand, 'utf8');
      for (const m of code.matchAll(/(?:from|import)\s*\(?\s*'(\.{1,2}\/[^']+)'/g)) visit(resolve(dirname(cand), m[1]));
      return;
    }
  };
  entries.forEach((e) => visit(join(from, e)));
  for (const f of seen) {
    const rel = relative(from, f);
    if (rel.startsWith('..')) throw new Error(`${app}: ${rel} is outside ${src}`);
    mkdirSync(dirname(join(to, rel)), { recursive: true });
    writeFileSync(join(to, rel), `// Vendored from github.com/alarboulletmarin/${app} (${src}/${rel}), AGPL-3.0. Do not edit: run scripts/vendor.mjs.\n` + readFileSync(f, 'utf8'));
  }
  console.log(`${app}: ${seen.size} files`);
}
