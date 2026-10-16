<?php
declare(strict_types=1);

function config(): array {
    static $config;
    return $config ??= json_decode(file_get_contents(getenv('MAESTRO_CONFIG') ?: dirname(__DIR__) . '/config.local.json'), true, 512, JSON_THROW_ON_ERROR);
}
function db(): PDO {
    static $db;
    if (!$db) {
        $c = config();
        $db = new PDO("mysql:host={$c['host']};port=" . ($c['port'] ?? 3306) . ";dbname={$c['database']};charset=utf8mb4", $c['username'], $c['password'], [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, PDO::ATTR_EMULATE_PREPARES => false, PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC]);
    }
    return $db;
}
function query(string $sql, array $params = []): PDOStatement {
    $statement = db()->prepare($sql);
    $statement->execute($params);
    return $statement;
}
function respond(array $value, int $status = 200): never {
    http_response_code($status);
    echo json_encode($value, JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR);
    exit;
}
function fail(string $message, int $status = 400): never { respond(['error' => $message], $status); }
function sessionStart(): void {
    session_name('maestro_admin');
    ini_set('session.use_strict_mode', '1');
    ini_set('session.use_only_cookies', '1');
    session_set_cookie_params(['lifetime' => 0, 'path' => (config()['base_path'] ?: '') . '/', 'secure' => config()['secure_cookies'] ?? true, 'httponly' => true, 'samesite' => 'Strict']);
    session_start();
    if (isset($_SESSION['last']) && time() - $_SESSION['last'] > 3600) $_SESSION = [];
    $_SESSION['last'] = time();
    $_SESSION['csrf'] ??= bin2hex(random_bytes(32));
}
function user(): ?array {
    if (empty($_SESSION['user_id'])) return null;
    return query('SELECT id, username FROM administrators WHERE id = ?', [$_SESSION['user_id']])->fetch() ?: null;
}
function requireUser(): array { return user() ?? fail('Connectez-vous pour continuer.', 401); }
function csrf(): void {
    if (!hash_equals($_SESSION['csrf'], $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '')) fail('Session expirée. Rechargez la page.', 403);
}
function throttle(): string {
    $key = hash('sha256', $_SERVER['REMOTE_ADDR'] ?? 'unknown');
    query('DELETE FROM login_attempts WHERE updated_at < DATE_SUB(UTC_TIMESTAMP(), INTERVAL 1 DAY)');
    query('INSERT INTO login_attempts (bucket, attempts, updated_at) VALUES (?, 1, UTC_TIMESTAMP()) ON DUPLICATE KEY UPDATE attempts = IF(updated_at < DATE_SUB(UTC_TIMESTAMP(), INTERVAL 15 MINUTE), 1, attempts + 1), updated_at = UTC_TIMESTAMP()', [$key]);
    if ((int)query('SELECT attempts FROM login_attempts WHERE bucket = ?', [$key])->fetchColumn() > 10) fail('Trop de tentatives. Réessayez dans 15 minutes.', 429);
    return $key;
}
function pizzaInput(array $data): array {
    $name = trim((string)($data['name'] ?? ''));
    $ingredients = trim((string)($data['ingredients'] ?? ''));
    if ($name === '' || mb_strlen($name) > 100) fail('Le nom doit contenir entre 1 et 100 caractères.', 422);
    if ($ingredients === '' || mb_strlen($ingredients) > 1000) fail('Indiquez les ingrédients (1 à 1 000 caractères).', 422);
    $prices = [];
    foreach (['price26', 'price33', 'price40'] as $field) {
        $value = str_replace(',', '.', (string)($data[$field] ?? ''));
        if (!preg_match('/^\d{1,3}(\.\d{1,2})?$/D', $value) || (float)$value <= 0 || (float)$value > 999) fail('Chaque tarif doit être compris entre 0,01 et 999 € avec deux décimales au maximum.', 422);
        $prices[] = number_format((float)$value, 2, '.', '');
    }
    // Every saved pizza is public; clients cannot create hidden drafts.
    return [$name, $ingredients, ...$prices, 1];
}
function uploadPhoto(int $maxEdge = 1200, int $quality = 82): ?string {
    $file = $_FILES['photo'] ?? null;
    if (!$file || $file['error'] === UPLOAD_ERR_NO_FILE) return null;
    if ($file['error'] !== UPLOAD_ERR_OK || $file['size'] > 6 * 1024 * 1024) fail('La photo doit peser moins de 6 Mo.', 422);
    $info = @getimagesize($file['tmp_name']);
    if (!$info || !in_array($info['mime'], ['image/jpeg', 'image/png', 'image/webp'], true) || $info[0] * $info[1] > 24000000) fail('Choisissez une image JPG, PNG ou WebP de moins de 24 mégapixels.', 422);
    $source = @imagecreatefromstring(file_get_contents($file['tmp_name']));
    if (!$source) fail('Impossible de lire cette image.', 422);
    $scale = min(1, $maxEdge / max(imagesx($source), imagesy($source)));
    $image = imagescale($source, max(1, (int)(imagesx($source) * $scale)), max(1, (int)(imagesy($source) * $scale)));
    imagealphablending($image, false); imagesavealpha($image, true);
    $name = bin2hex(random_bytes(20)) . '.webp';
    if (!imagewebp($image, config()['upload_dir'] . '/' . $name, $quality)) throw new RuntimeException('Upload write failed');
    imagedestroy($source); imagedestroy($image);
    return 'uploads/' . $name;
}
function defaultPhoto(): string {
    return json_decode(file_get_contents(__DIR__ . '/default-photo.json'), true, 512, JSON_THROW_ON_ERROR)['image'];
}
function allPizzas(bool $publishedOnly = false): array {
    return query('SELECT id, name, ingredients, price26, price33, price40, image, published, version FROM pizzas' . ($publishedOnly ? ' WHERE published = 1' : '') . ' ORDER BY sort_order, id')->fetchAll();
}

require_once __DIR__ . '/hours.php';

require_once __DIR__ . '/daily-menu.php';
