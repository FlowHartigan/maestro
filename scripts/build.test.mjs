import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir, stat } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import sharp from 'sharp';

const root = resolve(import.meta.dirname, '..');
const dist = resolve(root, 'dist');
const read = file => readFile(resolve(dist, file), 'utf8');

test('all three routes are complete HTML with no client JavaScript', async () => {
  for (const page of ['index.html', 'menu.html', 'contact.html']) {
    const html = await read(page);
    assert.match(html, /^<!doctype html><html lang="fr">/);
    assert.equal((html.match(/<h1[ >]/g) || []).length, 1);
    assert.match(html, /<title>[^<]+Pizza Maestro<\/title>/);
    assert.doesNotMatch(html, /<script|javascript:|dangerouslySetInnerHTML/);
    assert.match(html, new RegExp(`href="${page.replace('.', '\\.')}" aria-current="page"`));
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
  assert.deepEqual((await readdir(dist)).sort(), ['.htaccess', 'administration', 'api', 'assets', 'contact.html', 'index.html', 'index.php', 'menu.html', 'uploads']);
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
