<?php
// api/sections.php - Updated for Client ID system
require_once '../config/database.php';
require_once '../includes/jwt.php';
require_once '../includes/api_helpers.php';

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];
$request_uri = $_SERVER['REQUEST_URI'];

$path_parts = explode('/', trim($request_uri, '/'));
$section_identifier = isset($path_parts[count($path_parts) - 1]) && $path_parts[count($path_parts) - 1] !== 'sections'
    ? $path_parts[count($path_parts) - 1] : null;

$user = getAuthenticatedUser();
$user_id = $user['user_id'];

switch ($method) {
    case 'GET':
        getAllSections($db, $user_id);
        break;
    case 'POST':
        createSection($db, $user_id);
        break;
    case 'PUT':
        if ($section_identifier) {
            updateSection($db, $user_id, $section_identifier);
        } else {
            sendError('Section ID required for update', 400);
        }
        break;
    case 'DELETE':
        if ($section_identifier) {
            deleteSection($db, $user_id, $section_identifier);
        } else {
            sendError('Section ID required for delete', 400);
        }
        break;
    default:
        sendError('Method not allowed', 405);
}

function getAllSections($db, $user_id) {
    try {
        $stmt = $db->prepare("SELECT * FROM sections WHERE userId = ? ORDER BY id");
        $stmt->execute([$user_id]);
        $sections = $stmt->fetchAll();

        log_text("log.txt", $sections);
        
        $processed = array_map(function($section) {
            return [
                'id' => (string)$section['id'],
                'clientId' => $section['clientId'],
                'name' => $section['name'],
                'layoutMode' => $section['layoutMode'],
                'columnCount' => (int)$section['columnCount'],
                'rules' => json_decode($section['rules'], true) ?? [],
                'taskOrder' => json_decode($section['taskOrder'], true) ?? [],
                'showBackground' => (bool)$section['showBackground']
            ];
        }, $sections);
        
        sendResponse($processed);
        
    } catch (Exception $e) {
        error_log("Get sections error: " . $e->getMessage());
        sendError('Failed to fetch sections', 500);
    }
}

function createSection($db, $user_id) {
    $data = getRequestData();
    validateRequired($data, ['name']);
    
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
        
        $stmt = $db->prepare("
            INSERT INTO sections (clientId, userId, userClientId, name, layoutMode, columnCount, rules, taskOrder, showBackground) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");
        
        $stmt->execute([
            $data['clientId'],
            $user_id,
            $userClientId,
            $data['name'],
            $data['layoutMode'] ?? 'list',
            $data['columnCount'] ?? 1,
            json_encode($data['rules'] ?? []),
            json_encode($data['taskOrder'] ?? []),
            $data['showBackground'] ?? true
        ]);
        
        $section_id = $db->lastInsertId();
        
        sendResponse([
            'id' => (string)$section_id,
            'clientId' => $data['clientId'],
            'name' => $data['name'],
            'layoutMode' => $data['layoutMode'] ?? 'list',
            'columnCount' => $data['columnCount'] ?? 1,
            'rules' => $data['rules'] ?? [],
            'taskOrder' => $data['taskOrder'] ?? [],
            'showBackground' => $data['showBackground'] ?? true
        ]);
        
    } catch (Exception $e) {
        error_log("Create section error: " . $e->getMessage());
        sendError('Failed to create section', 500);
    }
}

function updateSection($db, $user_id, $section_identifier) {
    $data = getRequestData();
    
    try {
        // Support both clientId and numeric ID
        $isClientId = !is_numeric($section_identifier);
        $idField = $isClientId ? 'clientId' : 'id';
        
        $stmt = $db->prepare("SELECT id, clientId FROM sections WHERE $idField = ? AND userId = ?");
        $stmt->execute([$section_identifier, $user_id]);
        $section = $stmt->fetch();
        if (!$section) {
            sendError('Section not found', 404);
        }
        
        $fields = [];
        $values = [];
        $allowed_fields = ['name', 'layoutMode', 'columnCount', 'rules', 'taskOrder', 'showBackground'];
        
        foreach ($allowed_fields as $field) {
            if (array_key_exists($field, $data)) {
                if (in_array($field, ['rules', 'taskOrder'])) {
                    $fields[] = "$field = ?";
                    $values[] = json_encode($data[$field]);
                } else {
                    $fields[] = "$field = ?";
                    $values[] = $data[$field];
                }
            }
        }
        
        if (empty($fields)) {
            sendError('No valid fields to update', 400);
        }
        
        $values[] = $section_identifier;
        $values[] = $user_id;
        
        $sql = "UPDATE sections SET " . implode(', ', $fields) . " WHERE $idField = ? AND userId = ?";
        $stmt = $db->prepare($sql);
        $stmt->execute($values);
        
        sendResponse(['success' => true, 'message' => 'Section updated', 'clientId' => $section['clientId']]);
        
    } catch (Exception $e) {
        error_log("Update section error: " . $e->getMessage());
        sendError('Failed to update section', 500);
    }
}

function deleteSection($db, $user_id, $section_identifier) {
    try {
        // Support both clientId and numeric ID
        $isClientId = !is_numeric($section_identifier);
        $idField = $isClientId ? 'clientId' : 'id';
        
        $stmt = $db->prepare("SELECT id, clientId FROM sections WHERE $idField = ? AND userId = ?");
        $stmt->execute([$section_identifier, $user_id]);
        $section = $stmt->fetch();
        if (!$section) {
            sendError('Section not found', 404);
        }
        
        // Check if any tasks are assigned to this section (using clientId)
        $stmt = $db->prepare("SELECT COUNT(*) as task_count FROM tasks WHERE sectionClientId = ? AND userId = ?");
        $stmt->execute([$section['clientId'], $user_id]);
        $result = $stmt->fetch();
        
        if ($result['task_count'] > 0) {
            sendError('Cannot delete section with assigned tasks', 400);
        }
        
        $stmt = $db->prepare("DELETE FROM sections WHERE $idField = ? AND userId = ?");
        $stmt->execute([$section_identifier, $user_id]);
        
        sendResponse(['success' => true, 'message' => 'Section deleted']);
        
    } catch (Exception $e) {
        error_log("Delete section error: " . $e->getMessage());
        sendError('Failed to delete section', 500);
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