<?php
declare(strict_types=1);
function defaultHours(): array {
    return json_decode(file_get_contents(__DIR__ . '/hours-defaults.json'), true, 512, JSON_THROW_ON_ERROR);
}
function validateHours(mixed $days): array {
    if (!is_array($days) || !array_is_list($days) || count($days) !== 8) throw new InvalidArgumentException('Renseignez les sept jours et les jours fériés.');
    foreach ($days as $slots) {
        if (!is_array($slots) || !array_is_list($slots) || count($slots) > 2) throw new InvalidArgumentException('Prévoyez au maximum deux créneaux par jour.');
        $previousEnd = '';
        foreach ($slots as $slot) {
            if (!is_array($slot) || !array_is_list($slot) || count($slot) !== 2) throw new InvalidArgumentException('Chaque créneau doit avoir une heure de début et de fin.');
            foreach ($slot as $time) {
                if (!is_string($time) || !preg_match('/^(?:[01][0-9]|2[0-3]):[0-5][0-9]$/D', $time)) throw new InvalidArgumentException('Utilisez des heures valides au format HH:MM.');
            }
            if ($slot[0] >= $slot[1] || ($previousEnd !== '' && $slot[0] < $previousEnd)) throw new InvalidArgumentException('Les créneaux doivent se suivre, sans chevauchement, avec une fin après le début.');
            $previousEnd = $slot[1];
        }
    }
    return $days;
}
function openingHours(): array {
    $row = query('SELECT schedule, version FROM opening_hours WHERE id = 1')->fetch();
    if (!$row) throw new RuntimeException('Missing opening hours row');
    return ['days' => $row['schedule'] === null ? defaultHours() : validateHours(json_decode($row['schedule'], true, 512, JSON_THROW_ON_ERROR)), 'version' => (int)$row['version']];
}
function hoursHTML(array $days): string {
    $labels = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche', 'Jours fériés'];
    $format = fn(string $time): string => (int)substr($time, 0, 2) . 'h' . (substr($time, 3) === '00' ? '' : substr($time, 3));
    $html = '<dl class="hours">';
    for ($i = 0; $i < 8; $i++) {
        $start = $i;
        while ($i < 7 && $days[$i + 1] === $days[$start]) $i++;
        $label = $labels[$start];
        if ($i !== $start) {
            $label = $start === 5 && $i === 7 ? 'Samedi, dimanche et jours fériés' : ($start === 6 ? 'Dimanche' : $labels[$start] . ' au ' . lcfirst($labels[min($i, 6)]));
            if ($i === 7 && $start !== 5) $label .= ' et jours fériés';
        }
        $values = array_map(fn(array $slot): string => $format($slot[0]) . ' – ' . $format($slot[1]), $days[$start]);
        $html .= '<div><dt>' . htmlspecialchars($label, ENT_QUOTES, 'UTF-8') . '</dt><dd>' . ($values ? implode('<br/>', $values) : 'Fermé') . '</dd></div>';
    }
    return $html . '</dl>';
}
