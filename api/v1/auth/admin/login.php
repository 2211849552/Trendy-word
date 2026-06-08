<?php
require_once __DIR__ . '/../../../helpers.php';

$body = getJsonBody();
$email = $body['email'] ?? '';
$password = $body['password'] ?? '';

if (!$email || !$password) {
    jsonResponse(['message' => 'البريد وكلمة المرور مطلوبان'], 422);
}

$stmt = $pdo->prepare("SELECT * FROM users WHERE email = ? LIMIT 1");
$stmt->execute([$email]);
$user = $stmt->fetch();

if (!$user || !password_verify($password, $user['password'])) {
    jsonResponse(['message' => 'بيانات الدخول غير صحيحة'], 401);
}

$token = bin2hex(random_bytes(32));
$stmt = $pdo->prepare("INSERT INTO personal_access_tokens (tokenable_id, token, abilities, expires_at) VALUES (?, ?, ?, DATE_ADD(NOW(), INTERVAL 30 DAY))");
$stmt->execute([$user['id'], $token, '["*"]']);

jsonResponse([
    'token' => $token,
    'user' => [
        'id' => $user['id'],
        'name' => $user['name'],
        'email' => $user['email'],
        'role' => $user['role'],
    ]
]);
