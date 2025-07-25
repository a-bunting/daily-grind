<?php
// api/progress.php - Updated for Client ID system
require_once '../config/database.php';
require_once '../includes/jwt.php';
require_once '../includes/api_helpers.php';

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];
$user = getAuthenticatedUser();
$user_id = $user['user_id'];

switch ($method) {
    case 'POST':
        updateProgress($db, $user_id);
        break;
    case 'DELETE':
        deleteProgress($db, $user_id);
        break;
    default:
        sendError('Method not allowed', 405);
}

function updateProgress($db, $user_id) {
    $data = getRequestData();
    
    // Support both old task_id and new taskClientId
    if (isset($data['taskClientId'])) {
        validateRequired($data, ['taskClientId', 'date']);
        $taskIdentifier = $data['taskClientId'];
        $isClientId = true;
    } else {
        validateRequired($data, ['task_id', 'date']);
        $taskIdentifier = $data['task_id'];
        $isClientId = false;
    }
    
    try {
        // Verify task belongs to user and get task info
        $idField = $isClientId ? 'clientId' : 'id';
        $stmt = $db->prepare("SELECT id, clientId, taskType FROM tasks WHERE $idField = ? AND userId = ?");
        $stmt->execute([$taskIdentifier, $user_id]);
        $task = $stmt->fetch();
        
        if (!$task) {
            sendError('Task not found', 404);
        }
        
        // Generate clientId for progress if not provided
        $progressClientId = $data['clientId'] ?? generateClientId();
        
        // Upsert progress record using taskClientId
        $stmt = $db->prepare("
            INSERT INTO taskProgress (clientId, taskId, taskClientId, date, timeSpent, currentCount, inputValue, isRunning, startTime) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
                timeSpent = VALUES(timeSpent),
                currentCount = VALUES(currentCount),
                inputValue = VALUES(inputValue),
                isRunning = VALUES(isRunning),
                startTime = VALUES(startTime),
                updatedAt = CURRENT_TIMESTAMP
        ");
        
        $stmt->execute([
            $progressClientId,
            $task['id'],
            $task['clientId'],
            $data['date'],
            $data['timeSpent'] ?? 0,
            $data['currentCount'] ?? 0,
            $data['inputValue'] ?? 0,
            $data['isRunning'] ?? false,
            $data['startTime'] ?? null
        ]);
        
        // Get updated progress
        $stmt = $db->prepare("SELECT * FROM taskProgress WHERE taskClientId = ? AND date = ?");
        $stmt->execute([$task['clientId'], $data['date']]);
        $progress = $stmt->fetch();
        
        sendResponse([
            'success' => true,
            'progress' => formatProgress($progress, $task['taskType'])
        ]);
        
    } catch (Exception $e) {
        error_log("Update progress error: " . $e->getMessage());
        sendError('Failed to update progress', 500);
    }
}

function deleteProgress($db, $user_id) {
    $data = getRequestData();
    
    // Support both old task_id and new taskClientId
    if (isset($data['taskClientId'])) {
        validateRequired($data, ['taskClientId', 'date']);
        $taskIdentifier = $data['taskClientId'];
        $isClientId = true;
    } else {
        validateRequired($data, ['task_id', 'date']);
        $taskIdentifier = $data['task_id'];
        $isClientId = false;
    }
    
    try {
        // Verify task belongs to user
        $idField = $isClientId ? 'clientId' : 'id';
        $stmt = $db->prepare("SELECT clientId FROM tasks WHERE $idField = ? AND userId = ?");
        $stmt->execute([$taskIdentifier, $user_id]);
        $task = $stmt->fetch();
        if (!$task) {
            sendError('Task not found', 404);
        }
        
        // Delete progress record using taskClientId
        $stmt = $db->prepare("DELETE FROM taskProgress WHERE taskClientId = ? AND date = ?");
        $stmt->execute([$task['clientId'], $data['date']]);
        
        sendResponse(['success' => true, 'message' => 'Progress deleted']);
        
    } catch (Exception $e) {
        error_log("Delete progress error: " . $e->getMessage());
        sendError('Failed to delete progress', 500);
    }
}

function formatProgress($progress, $task_type) {
    if (!$progress) return null;
    
    $formatted = [
        'clientId' => $progress['clientId'],
        'isRunning' => (bool)$progress['isRunning']
    ];
    
    if ($progress['startTime']) {
        $formatted['startTime'] = (int)$progress['startTime'];
    }
    
    switch ($task_type) {
        case 'time':
            if ($progress['timeSpent'] > 0) {
                $formatted['timeSpent'] = (int)$progress['timeSpent'];
            }
            break;
        case 'count':
            if ($progress['currentCount'] > 0) {
                $formatted['currentCount'] = (int)$progress['currentCount'];
            }
            break;
        case 'input':
            if ($progress['inputValue'] > 0) {
                $formatted['inputValue'] = (float)$progress['inputValue'];
            }
            break;
    }
    
    return $formatted;
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