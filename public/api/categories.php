// api/categories.php
<?php
// api/categories.php - Updated for Client ID system
require_once '../config/database.php';
require_once '../includes/jwt.php';
require_once '../includes/api_helpers.php';

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];
$request_uri = $_SERVER['REQUEST_URI'];

$path_parts = explode('/', trim($request_uri, '/'));
$category_identifier = isset($path_parts[count($path_parts) - 1]) && $path_parts[count($path_parts) - 1] !== 'categories'
    ? $path_parts[count($path_parts) - 1] : null;

$user = getAuthenticatedUser();
$user_id = $user['user_id'];

switch ($method) {
    case 'GET':
        getAllCategories($db, $user_id);
        break;
    case 'POST':
        createCategory($db, $user_id);
        break;
    case 'PUT':
        if ($category_identifier) {
            updateCategory($db, $user_id, $category_identifier);
        } else {
            sendError('Category ID required for update', 400);
        }
        break;
    case 'DELETE':
        if ($category_identifier) {
            deleteCategory($db, $user_id, $category_identifier);
        } else {
            sendError('Category ID required for delete', 400);
        }
        break;
    default:
        sendError('Method not allowed', 405);
}

function getAllCategories($db, $user_id) {
    try {
        $stmt = $db->prepare("SELECT * FROM categories WHERE userId = ? ORDER BY name");
        $stmt->execute([$user_id]);
        $categories = $stmt->fetchAll();
        
        log_text("log.txt", $categories);
        
        $processed = array_map(function($cat) {
            return [
                'id' => (string)$cat['id'],
                'clientId' => $cat['clientId'],
                'name' => $cat['name'],
                'color' => $cat['color'],
                'icon' => $cat['icon']
            ];
        }, $categories);
        
        log_text("log.txt", $processed);
        
        sendResponse($processed);
        
    } catch (Exception $e) {
        error_log("Get categories error: " . $e->getMessage());
        sendError('Failed to fetch categories', 500);
    }
}

function createCategory($db, $user_id) {
    $data = getRequestData();
    validateRequired($data, ['name', 'color', 'icon']);
    
    // Generate clientId if not provided
    if (!isset($data['clientId'])) {
        $data['clientId'] = generateClientId();
    }
    
    try {
        // Get user's clientId
        $userStmt = $db->prepare("SELECT clientId FROM users WHERE id = ?");
        $userStmt->execute([$user_id]);
        $user = $userStmt->fetch();
        $userClientId = $user['clientId'];
        
        $stmt = $db->prepare("INSERT INTO categories (clientId, userId, userClientId, name, color, icon) VALUES (?, ?, ?, ?, ?, ?)");
        $stmt->execute([
            $data['clientId'],
            $user_id,
            $userClientId,
            $data['name'],
            $data['color'],
            $data['icon']
        ]);
        
        $category_id = $db->lastInsertId();
        
        sendResponse([
            'id' => (string)$category_id,
            'clientId' => $data['clientId'],
            'name' => $data['name'],
            'color' => $data['color'],
            'icon' => $data['icon']
        ]);
        
    } catch (Exception $e) {
        error_log("Create category error: " . $e->getMessage());
        sendError('Failed to create category', 500);
    }
}

function updateCategory($db, $user_id, $category_identifier) {
    $data = getRequestData();
    
    try {
        // Support both clientId and numeric ID
        $isClientId = !is_numeric($category_identifier);
        $idField = $isClientId ? 'clientId' : 'id';
        
        $stmt = $db->prepare("SELECT id, clientId FROM categories WHERE $idField = ? AND userId = ?");
        $stmt->execute([$category_identifier, $user_id]);
        $category = $stmt->fetch();
        if (!$category) {
            sendError('Category not found', 404);
        }
        
        $fields = [];
        $values = [];
        $allowed_fields = ['name', 'color', 'icon'];
        
        foreach ($allowed_fields as $field) {
            if (array_key_exists($field, $data)) {
                $fields[] = "$field = ?";
                $values[] = $data[$field];
            }
        }
        
        if (empty($fields)) {
            sendError('No valid fields to update', 400);
        }
        
        $values[] = $category_identifier;
        $values[] = $user_id;
        
        $sql = "UPDATE categories SET " . implode(', ', $fields) . " WHERE $idField = ? AND userId = ?";
        $stmt = $db->prepare($sql);
        $stmt->execute($values);
        
        sendResponse(['success' => true, 'message' => 'Category updated', 'clientId' => $category['clientId']]);
        
    } catch (Exception $e) {
        error_log("Update category error: " . $e->getMessage());
        sendError('Failed to update category', 500);
    }
}

function deleteCategory($db, $user_id, $category_identifier) {
    try {
        // Support both clientId and numeric ID
        $isClientId = !is_numeric($category_identifier);
        $idField = $isClientId ? 'clientId' : 'id';
        
        $stmt = $db->prepare("SELECT id, clientId FROM categories WHERE $idField = ? AND userId = ?");
        $stmt->execute([$category_identifier, $user_id]);
        $category = $stmt->fetch();
        if (!$category) {
            sendError('Category not found', 404);
        }
        
        // Update tasks to remove category reference (set to NULL)
        $stmt = $db->prepare("UPDATE tasks SET categoryClientId = NULL WHERE categoryClientId = ? AND userId = ?");
        $stmt->execute([$category['clientId'], $user_id]);
        
        $stmt = $db->prepare("DELETE FROM categories WHERE $idField = ? AND userId = ?");
        $stmt->execute([$category_identifier, $user_id]);
        
        sendResponse(['success' => true, 'message' => 'Category deleted']);
        
    } catch (Exception $e) {
        error_log("Delete category error: " . $e->getMessage());
        sendError('Failed to delete category', 500);
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