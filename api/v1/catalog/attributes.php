<?php
require_once __DIR__ . '/../../helpers.php';

$stmt = $pdo->query("SELECT * FROM attributes ORDER BY name ASC");
$attrs = $stmt->fetchAll();
foreach ($attrs as &$attr) {
    $attr['list_options'] = json_decode($attr['list_options'] ?? '[]', true);
}
jsonResponse(['attributes' => $attrs]);
