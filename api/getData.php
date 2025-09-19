<?php
header('Content-Type: application/json');
$data = file_get_contents('../data/today.json');
echo $data;
