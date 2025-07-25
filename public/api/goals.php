<?php
// api/goals.php - Updated for Client ID system
require_once '../config/database.php';
require_once '../includes/jwt.php';
require_once '../includes/api_helpers.php';

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];
$request_uri = $_SERVER['REQUEST_URI'];

$path_parts = explode('/', trim($request_uri, '/'));
$goal_identifier = isset($path_parts[count($path_parts) - 1]) && $path_parts[count($path_parts) - 1] !== 'goals'
    ? $path_parts[count($path_parts) - 1] : null;

$user = getAuthenticatedUser();
$user_id = $user['user_id'];

switch ($method) {
    case 'GET':
        getAllGoals($db, $user_id);
        break;
    case 'POST':
        createGoal($db, $user_id);
        break;
    case 'PUT':
        if ($goal_identifier) {
            updateGoal($db, $user_id, $goal_identifier);
        } else {
            sendError('Goal ID required for update', 400);
        }
        break;
    case 'DELETE':
        if ($goal_identifier) {
            deleteGoal($db, $user_id, $goal_identifier);
        } else {
            sendError('Goal ID required for delete', 400);
        }
        break;
    default:
        sendError('Method not allowed', 405);
}

function getAllGoals($db, $user_id) {
    try {
        $stmt = $db->prepare("SELECT * FROM goals WHERE userId = ? ORDER BY createdAt DESC");
        $stmt->execute([$user_id]);
        $goals = $stmt->fetchAll();
        
        $processed = array_map(function($goal) {
            return [
                'id' => (string)$goal['id'],
                'clientId' => $goal['clientId'],
                'name' => $goal['name'],
                'description' => $goal['description'],
                'targetValue' => (float)$goal['targetValue'],
                'unit' => $goal['unit'],
                'goalType' => $goal['goalType'],
                'currentProgress' => (float)$goal['currentProgress'],
                'personalBestProgress' => (float)$goal['personalBestProgress'],
                'createdDate' => $goal['createdDate']
            ];
        }, $goals);
        
        sendResponse($processed);
        
    } catch (Exception $e) {
        error_log("Get goals error: " . $e->getMessage());
        sendError('Failed to fetch goals', 500);
    }
}

function createGoal($db, $user_id) {
    $data = getRequestData();
    validateRequired($data, ['name', 'targetValue', 'createdDate']);
    
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
            INSERT INTO goals (clientId, userId, userClientId, name, description, targetValue, unit, goalType, currentProgress, personalBestProgress, createdDate) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");
        
        $stmt->execute([
            $data['clientId'],
            $user_id,
            $userClientId,
            $data['name'],
            $data['description'] ?? null,
            $data['targetValue'],
            $data['unit'] ?? null,
            $data['goalType'] ?? 'cumulative',
            $data['currentProgress'] ?? 0,
            $data['personalBestProgress'] ?? 0,
            $data['createdDate']
        ]);
        
        $goal_id = $db->lastInsertId();
        
        sendResponse([
            'id' => (string)$goal_id,
            'clientId' => $data['clientId'],
            'name' => $data['name'],
            'description' => $data['description'] ?? null,
            'targetValue' => (float)$data['targetValue'],
            'unit' => $data['unit'] ?? null,
            'goalType' => $data['goalType'] ?? 'cumulative',
            'currentProgress' => (float)($data['currentProgress'] ?? 0),
            'personalBestProgress' => (float)($data['personalBestProgress'] ?? 0),
            'createdDate' => $data['createdDate']
        ]);
        
    } catch (Exception $e) {
        error_log("Create goal error: " . $e->getMessage());
        sendError('Failed to create goal', 500);
    }
}

function updateGoal($db, $user_id, $goal_identifier) {
    $data = getRequestData();
    
    try {
        // Support both clientId and numeric ID
        $isClientId = !is_numeric($goal_identifier);
        $idField = $isClientId ? 'clientId' : 'id';
        
        $stmt = $db->prepare("SELECT id, clientId FROM goals WHERE $idField = ? AND userId = ?");
        $stmt->execute([$goal_identifier, $user_id]);
        $goal = $stmt->fetch();
        if (!$goal) {
            sendError('Goal not found', 404);
        }
        
        $fields = [];
        $values = [];
        $allowed_fields = ['name', 'description', 'targetValue', 'unit', 'goalType', 'currentProgress', 'personalBestProgress', 'createdDate'];
        
        foreach ($allowed_fields as $field) {
            if (array_key_exists($field, $data)) {
                $fields[] = "$field = ?";
                $values[] = $data[$field];
            }
        }
        
        if (empty($fields)) {
            sendError('No valid fields to update', 400);
        }
        
        $values[] = $goal_identifier;
        $values[] = $user_id;
        
        $sql = "UPDATE goals SET " . implode(', ', $fields) . " WHERE $idField = ? AND userId = ?";
        $stmt = $db->prepare($sql);
        $stmt->execute($values);
        
        sendResponse(['success' => true, 'message' => 'Goal updated', 'clientId' => $goal['clientId']]);
        
    } catch (Exception $e) {
        error_log("Update goal error: " . $e->getMessage());
        sendError('Failed to update goal', 500);
    }
}

function deleteGoal($db, $user_id, $goal_identifier) {
    try {
        // Support both clientId and numeric ID
        $isClientId = !is_numeric($goal_identifier);
        $idField = $isClientId ? 'clientId' : 'id';
        
        $stmt = $db->prepare("SELECT id, clientId FROM goals WHERE $idField = ? AND userId = ?");
        $stmt->execute([$goal_identifier, $user_id]);
        $goal = $stmt->fetch();
        if (!$goal) {
            sendError('Goal not found', 404);
        }
        
        // Update tasks to remove goal reference (set to NULL)
        $stmt = $db->prepare("UPDATE tasks SET goalClientId = NULL WHERE goalClientId = ? AND userId = ?");
        $stmt->execute([$goal['clientId'], $user_id]);
        
        $stmt = $db->prepare("DELETE FROM goals WHERE $idField = ? AND userId = ?");
        $stmt->execute([$goal_identifier, $user_id]);
        
        sendResponse(['success' => true, 'message' => 'Goal deleted']);
        
    } catch (Exception $e) {
        error_log("Delete goal error: " . $e->getMessage());
        sendError('Failed to delete goal', 500);
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