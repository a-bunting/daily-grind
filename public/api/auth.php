<?php
// api/auth.php - Updated for Client ID system
error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once '../config/database.php';
require_once '../includes/jwt.php';
require_once '../includes/api_helpers.php';
require_once '../includes/default_data.php';

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];
$request_uri = $_SERVER['REQUEST_URI'];

// Parse the endpoint
$path_parts = explode('/', trim($request_uri, '/'));
$endpoint = end($path_parts);

log_text("log.txt", "AUTH API: Method: $method, URI: $request_uri, Endpoint: $endpoint");

switch ($method) {
    case 'POST':
        switch ($endpoint) {
            case 'login':
                login($db);
                break;
            case 'register':
                register($db);
                break;
            case 'verify':
                verifyToken();
                break;
            default:
                sendError('Endpoint not found', 404);
        }
        break;
    default:
        sendError('Method not allowed', 405);
}

function login($db) {
    $data = getRequestData();
    validateRequired($data, ['username', 'password']);
    
    try {
        $stmt = $db->prepare("SELECT id, clientId, username, email, passwordHash FROM users WHERE username = ?");
        $stmt->execute([$data['username']]);
        $user = $stmt->fetch();
        
        if (!$user || !password_verify($data['password'], $user['passwordHash'])) {
            sendError('Invalid username or password', 401);
        }
        
        $token = JWT::generate($user['id'], $user['username']);
        
        sendResponse([
            'success' => true,
            'token' => $token,
            'user' => [
                'id' => $user['id'],
                'clientId' => $user['clientId'],
                'username' => $user['username'],
                'email' => $user['email']
            ]
        ]);
        
    } catch (Exception $e) {
        error_log("Login error: " . $e->getMessage());
        sendError('Login failed: ' . $e->getMessage(), 500);
    }
}

function register($db) {
    $data = getRequestData();

    validateRequired($data, ['username', 'email', 'password']);
    
    // Validation
    if (strlen($data['username']) < 3) {
        sendError('Username must be at least 3 characters');
    }
    
    if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
        sendError('Invalid email format');
    }
    
    if (strlen($data['password']) < 6) {
        sendError('Password must be at least 6 characters');
    }
    
    try {
        // Check if username or email already exists
        $stmt = $db->prepare("SELECT id FROM users WHERE username = ? OR email = ?");
        $stmt->execute([$data['username'], $data['email']]);
        if ($stmt->fetch()) {
            log_text("log.txt", 'username or email exists...');
            sendError('Username or email already exists');
        }
        
        // Generate clientId for new user
        $userClientId = generateClientId();
        
        // Create user
        $passwordHash = password_hash($data['password'], PASSWORD_DEFAULT);
        $stmt = $db->prepare("INSERT INTO users (clientId, username, email, passwordHash) VALUES (?, ?, ?, ?)");
        $stmt->execute([$userClientId, $data['username'], $data['email'], $passwordHash]);
        
        $userId = $db->lastInsertId();

        // Create default categories with clientIds
        createDefaultCategories($db, $userId, $userClientId);
        
        // Create default sections with clientIds
        createDefaultSections($db, $userId, $userClientId);
        
        $token = JWT::generate($userId, $data['username']);
        
        sendResponse([
            'success' => true,
            'token' => $token,
            'user' => [
                'id' => $userId,
                'clientId' => $userClientId,
                'username' => $data['username'],
                'email' => $data['email']
            ]
        ]);
        
    } catch (Exception $e) {
        error_log("Registration error: " . $e->getMessage());
        sendError('Registration failed: ' . $e->getMessage(), 500);
    }
}

function verifyToken() {
    $user = getAuthenticatedUser();
    sendResponse([
        'valid' => true,
        'user' => [
            'id' => $user['user_id'],
            'username' => $user['username']
        ]
    ]);
}

function createDefaultCategories($db, $userId, $userClientId) {
    $categories = getDefaultCategories();
    $stmt = $db->prepare("INSERT INTO categories (clientId, userId, userClientId, name, color, icon) VALUES (?, ?, ?, ?, ?, ?)");
    
    foreach ($categories as $category) {
        $categoryClientId = generateClientId();
        $stmt->execute([
            $categoryClientId,
            $userId,
            $userClientId,
            $category['name'],
            $category['color'],
            $category['icon']
        ]);
    }
}

function createDefaultSections($db, $userId, $userClientId) {
    $sections = getDefaultSections();
    $stmt = $db->prepare("INSERT INTO sections (clientId, userId, userClientId, name, layoutMode, columnCount, rules, taskOrder, showBackground) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
    
    foreach ($sections as $section) {
        $sectionClientId = generateClientId();
        $stmt->execute([
            $sectionClientId,
            $userId,
            $userClientId,
            $section['name'],
            $section['layoutMode'],
            $section['columnCount'],
            json_encode($section['rules']),
            json_encode($section['taskOrder']),
            $section['showBackground'] ? 1 : 0
        ]);
    }
}

function generateClientId() {
    $chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    $result = '';
    for ($i = 0; $i < 10; $i++) {
        $result .= $chars[random_int(0, strlen($chars) - 1)];
    }
    return $result;
}
?>