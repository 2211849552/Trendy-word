<?php
// ─── اتصال قاعدة البيانات ───
// عدّل هذه القيم حسب إعداداتك في phpMyAdmin
$DB_HOST = 'localhost';
$DB_NAME = 'trendy_word';
$DB_USER = 'root';
$DB_PASS = '';

try {
    $pdo = new PDO(
        "mysql:host=$DB_HOST;dbname=$DB_NAME;charset=utf8mb4",
        $DB_USER,
        $DB_PASS,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        ]
    );
} catch (PDOException $e) {
    http_response_code(500);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['message' => 'فشل الاتصال بقاعدة البيانات', 'error' => $e->getMessage()]);
    exit;
}
