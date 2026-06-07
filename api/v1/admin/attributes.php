<?php
require_once __DIR__ . '/../../helpers.php';

$method = $_SERVER['REQUEST_METHOD'];
$user = authUser();

if ($method === 'GET') {
    $id = $_GET['id'] ?? null;
    if ($id) {
        $stmt = $pdo->prepare("SELECT a.* FROM attributes a WHERE a.id = ? LIMIT 1");
        $stmt->execute([$id]);
        $attr = $stmt->fetch();
        if (!$attr) jsonResponse(['message' => 'الخاصية غير موجودة'], 404);
        $stmt = $pdo->prepare("SELECT c.name FROM categories c JOIN attribute_category ac ON ac.category_id = c.id WHERE ac.attribute_id = ?");
        $stmt->execute([$id]);
        $attr['related_categories'] = array_column($stmt->fetchAll(), 'name');
        $attr['list_options'] = json_decode($attr['list_options'] ?? '[]', true);
        jsonResponse(['data' => $attr]);
    }
    $stmt = $pdo->query("SELECT * FROM attributes ORDER BY created_at DESC");
    $attrs = $stmt->fetchAll();
    foreach ($attrs as &$attr) {
        $attr['list_options'] = json_decode($attr['list_options'] ?? '[]', true);
    }
    jsonResponse(['data' => $attrs]);
}

if ($method === 'POST') {
    $body = getJsonBody();
    $name = trim($body['name'] ?? '');
    $type = $body['type'] ?? 'list';
    $is_required = $body['is_required'] ?? ($body['isRequired'] ?? true);
    $options = $body['list_options'] ?? ($body['options'] ?? []);
    if (!$name) jsonResponse(['message' => 'اسم الخاصية مطلوب'], 422);

    $stmt = $pdo->prepare("INSERT INTO attributes (name, type, is_required, list_options) VALUES (?, ?, ?, ?)");
    $stmt->execute([$name, $type, $is_required ? 1 : 0, json_encode($options)]);
    $id = $pdo->lastInsertId();

    $stmt = $pdo->prepare("SELECT * FROM attributes WHERE id = ?");
    $stmt->execute([$id]);
    $attr = $stmt->fetch();
    $attr['list_options'] = json_decode($attr['list_options'] ?? '[]', true);
    jsonResponse(['data' => $attr], 201);
}

if ($method === 'PUT') {
    $id = $_GET['id'] ?? null;
    if (!$id || !is_numeric($id)) jsonResponse(['message' => 'معرف غير صالح'], 400);

    $body = getJsonBody();
    $name = trim($body['name'] ?? '');
    $type = $body['type'] ?? 'list';
    $is_required = $body['is_required'] ?? ($body['isRequired'] ?? true);
    $options = $body['list_options'] ?? ($body['options'] ?? []);
    if (!$name) jsonResponse(['message' => 'اسم الخاصية مطلوب'], 422);

    $stmt = $pdo->prepare("UPDATE attributes SET name = ?, type = ?, is_required = ?, list_options = ? WHERE id = ?");
    $stmt->execute([$name, $type, $is_required ? 1 : 0, json_encode($options), $id]);

    $stmt = $pdo->prepare("SELECT * FROM attributes WHERE id = ?");
    $stmt->execute([$id]);
    $attr = $stmt->fetch();
    $attr['list_options'] = json_decode($attr['list_options'] ?? '[]', true);
    jsonResponse(['data' => $attr]);
}

if ($method === 'DELETE') {
    $id = $_GET['id'] ?? null;
    if (!$id || !is_numeric($id)) jsonResponse(['message' => 'معرف غير صالح'], 400);

    $stmt = $pdo->prepare("DELETE FROM attributes WHERE id = ?");
    $stmt->execute([$id]);
    jsonResponse(['message' => 'تم الحذف بنجاح']);
}

jsonResponse(['message' => 'Method not allowed'], 405);
