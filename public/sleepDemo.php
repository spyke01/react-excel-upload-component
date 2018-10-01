<?php
sleep(3);

header("Content-Type: application/json");
http_response_code(200);
echo json_encode(["success" => "OK"]);