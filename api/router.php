<?php
// router.php — للاستخدام مع php -S localhost:8000 router.php
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$path = urldecode($uri);

// CORS
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, Accept');
header('Access-Control-Allow-Credentials: true');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// إعادة توجيه API
$routes = [
    '/api/v1/auth/admin/login' => __DIR__ . '/v1/auth/admin/login.php',
    '/api/v1/user' => __DIR__ . '/v1/user.php',
    '/api/v1/catalog/categories' => __DIR__ . '/v1/catalog/categories.php',
    '/api/v1/catalog/attributes' => __DIR__ . '/v1/catalog/attributes.php',
    '/api/v1/catalog/search/categories' => __DIR__ . '/v1/catalog/search/categories.php',
    '/api/v1/catalog/search/attributes' => __DIR__ . '/v1/catalog/search/attributes.php',
];

foreach ($routes as $route => $file) {
    if ($path === $route) {
        require $file;
        exit;
    }
}

// مسارات ديناميكية مع معرف رقمي
if (preg_match('#^/api/v1/admin/categories/(\d+)$#', $path, $m)) {
    $_GET['id'] = $m[1];
    require __DIR__ . '/v1/admin/categories.php';
    exit;
}
if ($path === '/api/v1/admin/categories') {
    require __DIR__ . '/v1/admin/categories.php';
    exit;
}
if (preg_match('#^/api/v1/admin/attributes/(\d+)$#', $path, $m)) {
    $_GET['id'] = $m[1];
    require __DIR__ . '/v1/admin/attributes.php';
    exit;
}
if ($path === '/api/v1/admin/attributes') {
    require __DIR__ . '/v1/admin/attributes.php';
    exit;
}

// ملفات ثابتة
if (file_exists(__DIR__ . '/../' . $path)) {
    return false;
}

// 404
http_response_code(404);
echo json_encode(['message' => 'Not found']);
