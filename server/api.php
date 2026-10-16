<?php
declare(strict_types=1);
require __DIR__ . '/bootstrap.php';
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');
try {
    sessionStart();
    $action = $_GET['action'] ?? 'session';
    $method = $_SERVER['REQUEST_METHOD'];
    if ($method === 'GET' && $action === 'session') {
        respond(['user' => user(), 'csrf' => $_SESSION['csrf'], 'setupRequired' => (bool)query('SELECT setup_hash IS NOT NULL FROM app_settings WHERE id = 1')->fetchColumn()]);
    }
    if ($method === 'GET' && $action === 'pizzas') { requireUser(); respond(['pizzas' => allPizzas()]); }
    if ($method !== 'POST') fail('Méthode non autorisée.', 405);
    csrf();
    $data = str_contains($_SERVER['CONTENT_TYPE'] ?? '', 'application/json') ? json_decode(file_get_contents('php://input'), true, 512, JSON_THROW_ON_ERROR) : $_POST;
    if (!is_array($data)) fail('Données invalides.', 422);
    if ($action === 'login' || $action === 'setup') {
        $bucket = throttle();
        $username = trim((string)($data['username'] ?? ''));
        $password = (string)($data['password'] ?? '');
        if ($action === 'setup') {
            if (!preg_match('/^[a-zA-Z0-9._-]{3,50}$/D', $username)) fail('Identifiant : 3 à 50 lettres, chiffres, points ou tirets.', 422);
            if (strlen($password) < 12 || strlen($password) > 72) fail('Choisissez un mot de passe de 12 à 72 caractères.', 422);
            db()->beginTransaction();
            $hash = query('SELECT setup_hash FROM app_settings WHERE id = 1 FOR UPDATE')->fetchColumn();
            if (!$hash || !hash_equals($hash, hash('sha256', (string)($data['token'] ?? '')))) { db()->rollBack(); fail('Code d’activation invalide ou déjà utilisé.', 403); }
            query('INSERT INTO administrators (username, password_hash) VALUES (?, ?)', [$username, password_hash($password, PASSWORD_DEFAULT)]);
            $id = (int)db()->lastInsertId();
            query('UPDATE app_settings SET setup_hash = NULL WHERE id = 1');
            db()->commit();
        } else {
            $account = query('SELECT id, password_hash FROM administrators WHERE username = ?', [$username])->fetch();
            if (!$account || !password_verify($password, $account['password_hash'])) fail('Identifiant ou mot de passe incorrect.', 401);
            $id = (int)$account['id'];
        }
        query('DELETE FROM login_attempts WHERE bucket = ?', [$bucket]);
        session_regenerate_id(true);
        $_SESSION['user_id'] = $id; $_SESSION['csrf'] = bin2hex(random_bytes(32));
        respond(['user' => user(), 'csrf' => $_SESSION['csrf']]);
    }
    requireUser();
    if ($action === 'logout') { $_SESSION = []; session_destroy(); respond(['ok' => true]); }
    if ($action !== 'save') fail('Action inconnue.', 404);
    $values = pizzaInput($data);
    $id = filter_var($data['id'] ?? 0, FILTER_VALIDATE_INT);
    $version = filter_var($data['version'] ?? 0, FILTER_VALIDATE_INT);
    if ($id === false || $id < 0 || $version === false || $version < 0) fail('Pizza invalide.', 422);
    $old = $id ? query('SELECT image, version FROM pizzas WHERE id = ?', [$id])->fetch() : null;
    if ($id && !$old) fail('Pizza introuvable.', 404);
    if ($old && (int)$old['version'] !== $version) fail('Cette pizza a été modifiée ailleurs. Rechargez sa fiche avant de réessayer.', 409);
    $photo = uploadPhoto();
    $image = $photo ?? ($old['image'] ?? '');
    if ($image === '') fail('Ajoutez une photo pour cette nouvelle pizza.', 422);
    try {
        if ($id) {
            $statement = query('UPDATE pizzas SET name=?, ingredients=?, price26=?, price33=?, price40=?, published=?, image=?, version=version+1 WHERE id=? AND version=?', [...$values, $image, $id, $version]);
            if ($statement->rowCount() !== 1) {
                if ($photo) unlink(config()['upload_dir'] . '/' . basename($photo));
                fail('Cette pizza a été modifiée ailleurs. Rechargez sa fiche.', 409);
            }
        } else {
            query('INSERT INTO pizzas (name, ingredients, price26, price33, price40, published, image, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, 1000)', [...$values, $image]);
            $id = (int)db()->lastInsertId();
        }
    } catch (Throwable $e) {
        if ($photo) @unlink(config()['upload_dir'] . '/' . basename($photo));
        throw $e;
    }
    respond(['pizza' => query('SELECT id, name, ingredients, price26, price33, price40, image, published, version FROM pizzas WHERE id = ?', [$id])->fetch()], $old ? 200 : 201);
} catch (JsonException $e) { fail('Données JSON invalides.', 400); }
catch (Throwable $e) {
    if (isset($photo) && $photo) @unlink(config()['upload_dir'] . '/' . basename($photo));
    error_log('Maestro API: ' . $e->getMessage());
    fail('Une erreur serveur empêche l’opération. Réessayez plus tard.', 500);
}
