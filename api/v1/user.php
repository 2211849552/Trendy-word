<?php
require_once __DIR__ . '/../../helpers.php';

$user = authUser();
jsonResponse([
    'id' => $user['id'],
    'name' => $user['name'],
    'email' => $user['email'],
    'role' => $user['role'],
]);
