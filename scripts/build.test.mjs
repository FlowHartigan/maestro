import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir, stat } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import sharp from 'sharp';

const root = resolve(import.meta.dirname, '..');
const dist = resolve(root, 'dist');
const read = file => readFile(resolve(dist, file), 'utf8');

test('all four routes are complete HTML with no client JavaScript', async () => {
  for (const page of ['index.html', 'menu.html', 'contact.html', 'casa.html']) {
    const html = await read(page);
    assert.match(html, /^<!doctype html><html lang="fr">/);
    assert.equal((html.match(/<h1[ >]/g) || []).length, 1);
    assert.match(html, /<title>[^<]+(?:Pizza Maestro|La Casa di Maestro)<\/title>/);
    assert.doesNotMatch(html, /<script|javascript:|dangerouslySetInnerHTML/);
    assert.match(html, new RegExp(`href="${page.replace('.', '\\.')}"[^>]* aria-current="page"`));
    for (const [, ref] of html.matchAll(/(?:src|href)="([^"]+)"/g)) {
      if (/^(https?:|tel:|mailto:|#)/.test(ref)) continue;
      assert.ok(!ref.startsWith('/'), `Root-dependent URL: ${ref}`);
      assert.ok((await stat(resolve(dist, ref))).isFile(), ref);
    }
    for (const [, list] of html.matchAll(/srcSet="([^"]+)"/gi)) {
      for (const item of list.split(',')) assert.ok((await stat(resolve(dist, item.trim().split(' ')[0]))).isFile());
    }
  }
});

test('all pizzas and their three prices are rendered from the shared data', async () => {
  const pizzas = JSON.parse(await readFile(resolve(root, 'src/pizzas.json'), 'utf8'));
  const html = await read('menu.html');
  assert.equal(pizzas.length, 38);
  assert.equal((html.match(/class="pizza"/g) || []).length, 38);
  assert.equal(new Set(pizzas.map(p => p.name)).size, 38);
  for (const pizza of pizzas) {
    assert.ok(html.includes(`<h3>${pizza.name}</h3>`));
    assert.equal(pizza.prices.length, 3);
    assert.ok(pizza.prices.every(p => Number.isFinite(p) && p > 0));
  }
});

test('hero preload and CSS agree; all background images resolve', async () => {
  const html = await read('index.html');
  const cssRef = html.match(/href="(assets\/styles-[^"]+\.css)"/)[1];
  const css = await read(cssRef);
  const hero = html.match(/rel="preload" as="image" href="([^"]*hero-fenati[^"]+)"/)[1];
  assert.ok(css.includes(hero));
  for (const [, ref] of css.matchAll(/url\(["']?([^)'" ]+)/g)) {
    assert.ok((await stat(resolve(dist, dirname(cssRef), ref))).isFile(), ref);
  }
  const manifest = JSON.parse(await readFile(resolve(root, '.build/media.json'), 'utf8'));
  assert.ok((await sharp(resolve(dist, manifest['images/pizzeria/don-scata-feature.png'].src)).metadata()).hasAlpha);
});

test('deployment contains only public files and respects the size budget', async () => {
  assert.deepEqual((await readdir(dist)).sort(), ['.htaccess', 'administration', 'api', 'assets', 'casa.html', 'contact.html', 'index.html', 'index.php', 'menu.html', 'uploads']);
  const report = JSON.parse(await readFile(resolve(root, '.build/report.json'), 'utf8'));
  assert.equal(report.browserJavaScriptBytes, 0);
  assert.ok(report.cssGzipBytes < 4000);
  assert.ok(report.optimizedImageBytesIncludingVariants < 6_000_000);
  for (const value of Object.values(report.pages)) assert.ok(value.gzip < 6000);
});

test('admin assets are local and private templates stay outside public root', async () => {
  const html = await read('administration/index.html');
  assert.match(html, /<script type="module"/);
  for (const [, ref] of html.matchAll(/(?:src|href)="(\.\/assets\/[^"]+)"/g)) {
    assert.ok((await stat(resolve(dist, 'administration', ref))).isFile());
  }
  const template = await readFile(resolve(root, '.build/server/templates/menu.html'), 'utf8');
  assert.ok(template.includes('<div data-pizza-slot="all"></div>'));
  assert.ok(!(await readdir(dist)).includes('server'));
  assert.ok(!(await readdir(dist)).includes('config.local.json'));
});

test('shared opening hours have dynamic slots on every public page', async () => {
  for (const page of ['index.html', 'menu.html', 'contact.html', 'casa.html']) {
    const html = await readFile(resolve(root, '.build/server/templates', page), 'utf8');
    assert.equal((html.match(/data-hours-slot="(?:pizza|casa)"/g) || []).length, page === 'contact.html' ? 3 : 1);
    assert.ok(!html.includes('<dt>Lundi</dt>'));
  }
  const defaults = JSON.parse(await readFile(resolve(root, 'server/hours-defaults.json'), 'utf8'));
  assert.equal(defaults.length, 7);
  assert.deepEqual(defaults[0], []);
});

test('Casa has its own identity, current contact details and an accessible daily menu', async () => {
  const casa = await read('casa.html');
  assert.match(casa, /class="casa-theme"/);
  assert.match(casa, /tel:\+33984674949/);
  assert.match(casa, /1 rue Barbier d’Aubrée/);
  assert.match(casa, /63110 Beaumont/);
  assert.match(casa, /Lire le menu en texte/);
  assert.match(casa, /15,50 €/);
  assert.match(casa, /18h30 – 22h/);
  assert.match(casa, /href="index.html"/);
  assert.match(await read('index.html'), /href="casa.html"/);
  for (const page of ['index.html', 'menu.html', 'contact.html', 'casa.html']) {
    const html = await read(page);
    assert.doesNotMatch(html, /Chamalières|chamalieres|Claussat|33473373502|jours fériés/i);
  }
  const css = await read(casa.match(/href="(assets\/casa-[^"]+\.css)"/)[1]);
  assert.match(css, /max-width:600px/);
});
