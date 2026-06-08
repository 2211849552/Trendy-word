<?php
require_once __DIR__ . '/../../helpers.php';

$method = $_SERVER['REQUEST_METHOD'];
$user = authUser();

if ($method === 'GET') {
    $id = $_GET['id'] ?? null;
    if ($id) {
        $stmt = $pdo->prepare("SELECT *, 0 as products_count FROM categories WHERE id = ? LIMIT 1");
        $stmt->execute([$id]);
        $cat = $stmt->fetch();
        if (!$cat) jsonResponse(['message' => 'التصنيف غير موجود'], 404);
        jsonResponse(['data' => $cat]);
    }
    $stmt = $pdo->query("SELECT *, 0 as products_count FROM categories ORDER BY created_at DESC");
    jsonResponse(['data' => $stmt->fetchAll()]);
}

if ($method === 'POST') {
    $body = getJsonBody();
    $name = trim($body['name'] ?? '');
    $image_url = $body['image_url'] ?? ($body['image'] ?? null);
    if (!$name) jsonResponse(['message' => 'اسم التصنيف مطلوب'], 422);

    $stmt = $pdo->prepare("INSERT INTO categories (name, image_url) VALUES (?, ?)");
    $stmt->execute([$name, $image_url]);
    $id = $pdo->lastInsertId();

    $stmt = $pdo->prepare("SELECT *, 0 as products_count FROM categories WHERE id = ?");
    $stmt->execute([$id]);
    jsonResponse(['data' => $stmt->fetch()], 201);
}

if ($method === 'PUT') {
    $id = $_GET['id'] ?? null;
    if (!$id || !is_numeric($id)) jsonResponse(['message' => 'معرف غير صالح'], 400);

    $body = getJsonBody();
    $name = trim($body['name'] ?? '');
    $image_url = $body['image_url'] ?? ($body['image'] ?? null);
    if (!$name) jsonResponse(['message' => 'اسم التصنيف مطلوب'], 422);

    $stmt = $pdo->prepare("UPDATE categories SET name = ?, image_url = ? WHERE id = ?");
    $stmt->execute([$name, $image_url, $id]);

    $stmt = $pdo->prepare("SELECT *, 0 as products_count FROM categories WHERE id = ?");
    $stmt->execute([$id]);
    jsonResponse(['data' => $stmt->fetch()]);
}

if ($method === 'DELETE') {
    $id = $_GET['id'] ?? null;
    if (!$id || !is_numeric($id)) jsonResponse(['message' => 'معرف غير صالح'], 400);

    $stmt = $pdo->prepare("DELETE FROM categories WHERE id = ?");
    $stmt->execute([$id]);
    jsonResponse(['message' => 'تم الحذف بنجاح']);
}

jsonResponse(['message' => 'Method not allowed'], 405);
