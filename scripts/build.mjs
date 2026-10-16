import { mkdir, readFile, writeFile, rm, cp } from 'node:fs/promises';
import { resolve, basename } from 'node:path';
import { createHash } from 'node:crypto';
import { pathToFileURL } from 'node:url';
import { gzipSync } from 'node:zlib';
import sharp from 'sharp';
import { build, transformWithEsbuild } from 'vite';

const root = resolve(import.meta.dirname, '..');
process.chdir(root);
const dist = resolve(root, 'dist');
// Only generated output directories may be cleared.
for (const directory of ['dist', '.build']) {
  const target = resolve(root, directory);
  if (target !== resolve(root, 'dist') && target !== resolve(root, '.build')) throw new Error('Invalid output path');
  await rm(target, { recursive: true, force: true });
  await mkdir(target, { recursive: true });
}
await mkdir(resolve(dist, 'assets'));
const pizzas = JSON.parse(await readFile('src/pizzas.json', 'utf8'));
const fixed = ['images/Logos/logo_main.png', 'images/pizzeria/hero-fenati.png', 'images/pizzeria/don-scata-feature.png', 'images/pizzeria/texture.jpg', 'images/pizzeria/title.jpg', 'images/pizzeria/food-pattern.png'];
const sources = [...new Set([...fixed, ...pizzas.map(p => p.image)])];
const manifest = {};
let originalBytes = 0;
let optimizedBytes = 0;
const hash = bytes => createHash('sha256').update(bytes).digest('hex').slice(0, 12);
// Sequential processing bounds peak memory during image compression.
for (const source of sources) {
  const input = await readFile(source);
  originalBytes += input.length;
  const isPizza = source.startsWith('images/pizza/');
  const widths = isPizza ? [480, 800] : [source.includes('hero-fenati') ? 1680 : source.includes('don-scata') ? 1000 : source.includes('logo_main') ? 300 : 1400];
  const outputs = [];
  for (const width of widths) {
    const { data, info } = await sharp(input).rotate().resize({ width, withoutEnlargement: true }).webp({ quality: 80, effort: 5 }).toBuffer({ resolveWithObject: true });
    const name = `assets/${basename(source).replace(/\.[^.]+$/, '')}-${info.width}-${hash(data)}.webp`;
    await writeFile(resolve(dist, name), data);
    optimizedBytes += data.length;
    outputs.push({ src: name, width: info.width });
  }
  manifest[source] = { src: outputs.at(-1).src, ...(isPizza ? { srcSet: outputs.map(o => `${o.src} ${o.width}w`).join(', ') } : {}) };
}
await writeFile('.build/media.json', JSON.stringify(manifest));
let css = await readFile('src/styles.css', 'utf8');
css = css.replace(/url\(['"]?\.\.\/(images\/[^)'" ]+)['"]?\)/g, (_, source) => {
  if (!manifest[source]) throw new Error(`Missing CSS image: ${source}`);
  return `url('../${manifest[source].src}')`;
});
const minified = (await transformWithEsbuild(css, 'styles.css', { loader: 'css', minify: true })).code;
const stylesheet = `assets/styles-${hash(minified)}.css`;
await writeFile(resolve(dist, stylesheet), minified);
await build({ configFile: false, publicDir: false, esbuild: { jsx: 'automatic' }, build: { ssr: 'src/entry.jsx', outDir: '.build', emptyOutDir: false, rollupOptions: { output: { entryFileNames: 'entry.mjs' } } } });
const { render, renderCardTemplate, renderFeatureTemplate } = await import(pathToFileURL(resolve(root, '.build/entry.mjs')).href);
const pageSizes = {};
for (const page of ['index.html', 'menu.html', 'contact.html']) {
  const html = render(page, stylesheet);
  await writeFile(resolve(dist, page), html);
  pageSizes[page] = { bytes: Buffer.byteLength(html), gzip: gzipSync(html).length };
}
const report = { originalImageBytes: originalBytes, optimizedImageBytesIncludingVariants: optimizedBytes, reductionPercent: Math.round((1 - optimizedBytes / originalBytes) * 100), browserJavaScriptBytes: 0, cssGzipBytes: gzipSync(minified).length, pages: pageSizes };
await writeFile('.build/report.json', JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));

// React produces the HTML templates; PHP substitutes escaped database content at request time.
await mkdir('.build/server/templates', {recursive:true});
await cp('server', '.build/server', {recursive:true});
for (const page of ['index.html','menu.html','contact.html']) {
  await writeFile(`.build/server/templates/${page}`, render(page, stylesheet, true));
}
await writeFile('.build/server/templates/card.html', renderCardTemplate());
await writeFile('.build/server/templates/feature.html', renderFeatureTemplate());
await writeFile('.build/server/feature.json', JSON.stringify({image:manifest['images/pizzeria/don-scata-feature.png'].src}));
await writeFile('.build/server/seed.json', JSON.stringify(pizzas.map((p,i) => ({id:i+1,name:p.name,ingredients:p.ingredients,prices:p.prices,image:manifest[p.image].src,sort_order:i}))));
await cp('public', 'dist', {recursive:true});
await build({configFile:false,root:'admin',base:'./',publicDir:false,esbuild:{jsx:'automatic'},build:{outDir:'../.build/admin',emptyOutDir:true,assetsDir:'assets',rollupOptions:{input:'admin/index.html'}}});
await mkdir('dist/administration', {recursive:true});
await cp('.build/admin/index.html','dist/administration/index.html');
await cp('.build/admin/assets','dist/administration/assets', {recursive:true});
