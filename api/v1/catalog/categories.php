<?php
require_once __DIR__ . '/../../helpers.php';

$stmt = $pdo->query("SELECT id, name, image_url, is_active FROM categories WHERE is_active = 1 ORDER BY name ASC");
$cats = $stmt->fetchAll();
foreach ($cats as &$cat) {
    $cat['products_count'] = 0;
}
jsonResponse(['categories' => $cats]);
