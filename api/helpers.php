<?php
require_once __DIR__ . '/config.php';

function jsonResponse($data, $code = 200) {
    http_response_code($code);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data);
    exit;
}

function getJsonBody() {
    $input = file_get_contents('php://input');
    return json_decode($input, true) ?? [];
}

function authUser() {
    $headers = getallheaders();
    $auth = $headers['Authorization'] ?? '';
    if (!str_starts_with($auth, 'Bearer ')) {
        jsonResponse(['message' => 'Unauthorized'], 401);
    }
    $token = substr($auth, 7);
    global $pdo;
    $stmt = $pdo->prepare("SELECT * FROM personal_access_tokens WHERE token = ? AND (expires_at IS NULL OR expires_at > NOW()) LIMIT 1");
    $stmt->execute([$token]);
    $tokenRow = $stmt->fetch();
    if (!$tokenRow) {
        jsonResponse(['message' => 'Unauthorized'], 401);
    }
    $stmt = $pdo->prepare("SELECT * FROM users WHERE id = ? LIMIT 1");
    $stmt->execute([$tokenRow['tokenable_id']]);
    return $stmt->fetch();
}

function cors() {
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization, Accept');
    header('Access-Control-Allow-Credentials: true');
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(204);
        exit;
    }
}

cors();
