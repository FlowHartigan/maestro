<?php
declare(strict_types=1);
function dailyMenu(): array {
    $row = query('SELECT image, version FROM daily_menu WHERE id = 1')->fetch();
    if (!$row) throw new RuntimeException('Missing daily menu row');
    $image = $row['image'] ?? json_decode(file_get_contents(__DIR__ . '/default-menu.json'), true, 512, JSON_THROW_ON_ERROR)['image'];
    if (!preg_match('~^(assets/[a-zA-Z0-9._-]+\.webp|uploads/[a-f0-9]{40}\.webp)$~D', $image)) throw new RuntimeException('Invalid menu image');
    return ['image' => $image, 'version' => (int)$row['version'], 'isDefault' => $row['image'] === null];
}
function saveDailyMenu(array $data): never {
    $version = filter_var($data['version'] ?? null, FILTER_VALIDATE_INT);
    if (!$version || $version < 1) fail('Version du menu invalide. Rechargez la rubrique.', 422);
    if (dailyMenu()['version'] !== $version) fail('Le menu a été modifié ailleurs. Rechargez la rubrique.', 409);
    $reset = ($data['reset'] ?? '') === '1';
    $image = $reset ? null : uploadPhoto(2400, 92);
    if (!$reset && !$image) fail('Choisissez une image pour le menu du jour.', 422);
    try {
        $statement = query('UPDATE daily_menu SET image = ?, version = version + 1 WHERE id = 1 AND version = ?', [$image, $version]);
        if ($statement->rowCount() !== 1) {
            if ($image) @unlink(config()['upload_dir'] . '/' . basename($image));
            fail('Le menu a été modifié ailleurs. Rechargez la rubrique.', 409);
        }
    } catch (Throwable $e) {
        if ($image) @unlink(config()['upload_dir'] . '/' . basename($image));
        throw $e;
    }
    // Previous images remain available for backups; never delete another record's image.
    respond(['menu' => dailyMenu()]);
}
