<?php
require_once __DIR__ . '/../../../helpers.php';

$query = $_GET['query'] ?? '';
if (!$query) {
    jsonResponse(['attributes' => []]);
}
$stmt = $pdo->prepare("SELECT * FROM attributes WHERE name LIKE ? ORDER BY name ASC");
$stmt->execute(['%' . $query . '%']);
$attrs = $stmt->fetchAll();
foreach ($attrs as &$attr) {
    $attr['list_options'] = json_decode($attr['list_options'] ?? '[]', true);
}
jsonResponse(['attributes' => $attrs]);
