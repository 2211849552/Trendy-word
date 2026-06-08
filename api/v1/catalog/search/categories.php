<?php
require_once __DIR__ . '/../../../helpers.php';

$query = $_GET['query'] ?? '';
if (!$query) {
    jsonResponse(['categories' => []]);
}
$stmt = $pdo->prepare("SELECT id, name, image_url, is_active FROM categories WHERE name LIKE ? ORDER BY name ASC");
$stmt->execute(['%' . $query . '%']);
$cats = $stmt->fetchAll();
foreach ($cats as &$cat) {
    $cat['products_count'] = 0;
}
jsonResponse(['categories' => $cats]);
