<?php
// CLI development/integration server only; never routed through Nginx.
if (PHP_SAPI !== 'cli-server') { http_response_code(404); exit; }
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
if (in_array($path, ['/', '/index.html', '/menu.html', '/contact.html', '/casa.html'], true)) { require __DIR__ . '/public.php'; return true; }
return false;
