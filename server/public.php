<?php
declare(strict_types=1);
require __DIR__ . '/bootstrap.php';
header('Content-Type: text/html; charset=utf-8');
header('Cache-Control: no-cache, must-revalidate');
function escape(string $value): string { return htmlspecialchars($value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8'); }
function price(string $value): string { return number_format((float)$value, 2, ',', ' ') . "\u{00A0}€"; }
function replacements(array $pizza): array {
    // Paths originate only from the seed or validated image uploads.
    if (!preg_match('~^(assets/[a-zA-Z0-9._-]+\.webp|uploads/[a-f0-9]{40}\.webp)$~D', $pizza['image'])) throw new RuntimeException('Invalid stored image');
    return ['__NAME__' => escape($pizza['name']), '__INGREDIENTS__' => escape($pizza['ingredients']), '__IMAGE__' => escape($pizza['image']), '__P26__' => price($pizza['price26']), '__P33__' => price($pizza['price33']), '__P40__' => price($pizza['price40']), '__COUNT__' => ''];
}
try {
    $name = basename(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH));
    $page = in_array($name, ['menu.html', 'contact.html'], true) ? $name : 'index.html';
    $html = file_get_contents(__DIR__ . '/templates/' . $page);
    if ($page === 'contact.html') { echo $html; exit; }
    $pizzas = allPizzas(true);
    $card = file_get_contents(__DIR__ . '/templates/card.html');
    $render = fn(array $list): string => '<div class="pizza-grid">' . implode('', array_map(fn($pizza) => strtr($card, replacements($pizza)), $list)) . '</div>';
    $featured = array_values(array_filter($pizzas, fn($pizza) => in_array((int)$pizza['id'], [1, 4, 9], true)));
    if (!$featured) $featured = array_slice($pizzas, 0, 3);
    $don = array_values(array_filter($pizzas, fn($pizza) => (int)$pizza['id'] === 23));
    $feature = '';
    if ($don) {
        $values = replacements($don[0]);
        $seed = json_decode(file_get_contents(__DIR__ . '/seed.json'), true);
        if ($don[0]['image'] === $seed[22]['image']) $values['__IMAGE__'] = escape(json_decode(file_get_contents(__DIR__ . '/feature.json'), true)['image']);
        $feature = strtr(file_get_contents(__DIR__ . '/templates/feature.html'), $values);
    }
    echo strtr($html, ['<div data-pizza-slot="all"></div>' => $render($pizzas), '<div data-pizza-slot="featured"></div>' => $render($featured), '<div data-pizza-slot="don"></div>' => $feature, '__COUNT__' => (string)count($pizzas)]);
} catch (Throwable $e) {
    error_log('Maestro public: ' . $e->getMessage());
    http_response_code(503);
    echo '<!doctype html><html lang="fr"><meta charset="utf-8"><title>Maestro</title><h1>La carte est momentanément indisponible.</h1><p>Réessayez dans quelques instants.</p></html>';
}
