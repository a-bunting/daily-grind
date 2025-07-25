<?php
// includes/api_helpers.php
function sendResponse($data, $status = 200) {
    http_response_code($status);
    header('Content-Type: application/json');
    echo json_encode($data);
    exit;
}

function sendError($message, $status = 400) {
    sendResponse(['error' => $message], $status);
}

function getAuthenticatedUser() {
    $headers = getallheaders();
    $authHeader = $headers['Authorization'] ?? '';
    
    if (!$authHeader || !preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
        sendError('Authorization header missing or invalid', 401);
    }
    
    $jwt = $matches[1];
    $decoded = JWT::validate($jwt);
    
    if (!$decoded) {
        sendError('Invalid or expired token', 401);
    }

    log_text("log.txt", $decoded);
    
    return $decoded;
}

function getRequestData() {
    $input = file_get_contents('php://input');
    return json_decode($input, true) ?? [];
}

function validateRequired($data, $required_fields) {
    foreach ($required_fields as $field) {
        if (!isset($data[$field]) || $data[$field] === '') {
            $all = implode(', ', $required_fields);
            $data2 = implode(', ', $data);
            sendError("Field '{$field}' is required. '{$data2}' : '{$all}'");
        }
    }
}

// Enable CORS
function enableCORS() {
    if (isset($_SERVER['HTTP_ORIGIN'])) {
        header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}");
        header('Access-Control-Allow-Credentials: true');
        header('Access-Control-Max-Age: 86400');
    }

    if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
        if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_METHOD']))
            header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
        
        if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']))
            header("Access-Control-Allow-Headers: {$_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']}");
        
        exit(0);
    }
}

function log_text($filename, $text) {
    // Add timestamp to the log entry
    $timestamp = date('Y-m-d H:i:s');
    $log_entry = "[$timestamp] " . json_encode($text) . PHP_EOL;
    
    // Try to write to file, create if doesn't exist
    $result = file_put_contents($filename, $log_entry, FILE_APPEND | LOCK_EX);
    
    // Return true on success, false on failure
    return $result !== false;
}

// Call this at the start of each API file
enableCORS();