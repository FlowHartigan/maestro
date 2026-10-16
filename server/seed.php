<?php
declare(strict_types=1);
if (PHP_SAPI !== 'cli') { http_response_code(404); exit; }
require __DIR__ . '/bootstrap.php';
$tokenHash = trim(file_get_contents($argv[1]));
if (!preg_match('/^[a-f0-9]{64}$/D', $tokenHash)) throw new RuntimeException('Invalid setup hash');
db()->beginTransaction();
if ((int)query('SELECT COUNT(*) FROM pizzas')->fetchColumn() === 0) {
    foreach (json_decode(file_get_contents(__DIR__ . '/seed.json'), true, 512, JSON_THROW_ON_ERROR) as $pizza) {
        query('INSERT INTO pizzas (id,name,ingredients,price26,price33,price40,image,published,sort_order) VALUES (?,?,?,?,?,?,?,1,?)', [$pizza['id'],$pizza['name'],$pizza['ingredients'],...$pizza['prices'],$pizza['image'],$pizza['sort_order']]);
    }
}
query('INSERT IGNORE INTO app_settings (id,setup_hash) VALUES (1,?)', [$tokenHash]);
db()->commit();
echo "Seed ready\n";
