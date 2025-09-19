<?php
header('Content-Type: application/json');
$input = file_get_contents('php://input');
file_put_contents('../data/articles.json', $input);
echo json_encode(['status' => 'success']);
?>
