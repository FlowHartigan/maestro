<?php
declare(strict_types=1);
require dirname(__DIR__) . '/server/hours.php';
function check(bool $ok): void { if (!$ok) throw new RuntimeException('Hours compatibility test failed'); }
$week = defaultHours();
check(count($week) === 7);
$legacy = [...$week, [['18:00', '23:00']]];
check(storedHours(json_encode($legacy)) === $week);
check(storedHours(json_encode($week)) === $week);
check(!str_contains(hoursHTML(storedHours(json_encode($legacy))), 'fériés'));
check(str_contains(hoursHTML($week), 'Samedi et dimanche'));
check(str_contains(hoursHTML(defaultHours('casa')), 'Lundi au jeudi'));
check(str_contains(hoursHTML(defaultHours('casa')), '18h30 – 22h'));
try { validateHours($legacy); throw new RuntimeException('Old client should refresh'); }
catch (InvalidArgumentException $e) {}
echo "PASS: legacy eight-day records preserve weekdays; seven-day schedules and Casa rendering\n";
