<?php
// api/sync.php - Updated for Client ID system
require_once '../config/database.php';
require_once '../includes/jwt.php';
require_once '../includes/api_helpers.php';

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];
$request_uri = $_SERVER['REQUEST_URI'];

$path_parts = explode('/', trim($request_uri, '/'));
$action = end($path_parts);

$user = getAuthenticatedUser();
$user_id = $user['user_id'];

switch ($method) {
    case 'POST':
        switch ($action) {
            case 'queue':
                addToSyncQueue($db, $user_id);
                break;
            case 'process':
                processSyncQueue($db, $user_id);
                break;
            case 'status':
                getSyncStatus($db, $user_id);
                break;
            default:
                sendError('Invalid sync action', 400);
        }
        break;
    case 'GET':
        if ($action === 'queue') {
            getSyncQueue($db, $user_id);
        } else {
            getSyncStatus($db, $user_id);
        }
        break;
    case 'DELETE':
        clearSyncQueue($db, $user_id);
        break;
    default:
        sendError('Method not allowed', 405);
}

function addToSyncQueue($db, $user_id) {
    $data = getRequestData();
    validateRequired($data, ['action', 'entity_type', 'data']);
    
    try {
        // Get user's clientId
        $userStmt = $db->prepare("SELECT clientId FROM users WHERE id = ?");
        $userStmt->execute([$user_id]);
        $user = $userStmt->fetch();
        $userClientId = $user['clientId'];
        
        // Generate clientId for sync queue item
        $syncClientId = generateClientId();
        
        $stmt = $db->prepare("
            INSERT INTO syncQueue (clientId, userId, userClientId, action, entityType, entityId, entityClientId, data) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ");
        
        $stmt->execute([
            $syncClientId,
            $user_id,
            $userClientId,
            $data['action'],
            $data['entity_type'],
            $data['entity_id'] ?? null,
            $data['entity_client_id'] ?? null,
            json_encode($data['data'])
        ]);
        
        sendResponse(['success' => true, 'queue_id' => $db->lastInsertId(), 'clientId' => $syncClientId]);
        
    } catch (Exception $e) {
        error_log("Add to sync queue error: " . $e->getMessage());
        sendError('Failed to add to sync queue', 500);
    }
}

function getSyncQueue($db, $user_id) {
    try {
        $stmt = $db->prepare("
            SELECT id, clientId, action, entityType, entityId, entityClientId, data, createdAt 
            FROM syncQueue 
            WHERE userId = ? 
            ORDER BY createdAt ASC
        ");
        $stmt->execute([$user_id]);
        $queue = $stmt->fetchAll();
        
        $processed_queue = array_map(function($item) {
            return [
                'id' => $item['id'],
                'clientId' => $item['clientId'],
                'action' => $item['action'],
                'entity_type' => $item['entityType'],
                'entity_id' => $item['entityId'],
                'entity_client_id' => $item['entityClientId'],
                'data' => json_decode($item['data'], true),
                'created_at' => $item['createdAt']
            ];
        }, $queue);
        
        sendResponse($processed_queue);
        
    } catch (Exception $e) {
        error_log("Get sync queue error: " . $e->getMessage());
        sendError('Failed to get sync queue', 500);
    }
}

function processSyncQueue($db, $user_id) {
    try {
        // Get all pending sync items
        $stmt = $db->prepare("
            SELECT id, clientId, action, entityType, entityId, entityClientId, data 
            FROM syncQueue 
            WHERE userId = ? 
            ORDER BY createdAt ASC
        ");
        $stmt->execute([$user_id]);
        $queue_items = $stmt->fetchAll();
        
        $processed = 0;
        $errors = [];
        
        foreach ($queue_items as $item) {
            try {
                $success = processQueueItem($db, $user_id, $item);
                if ($success) {
                    // Remove from queue
                    $deleteStmt = $db->prepare("DELETE FROM syncQueue WHERE id = ?");
                    $deleteStmt->execute([$item['id']]);
                    $processed++;
                } else {
                    $errors[] = "Failed to process item {$item['id']}";
                }
            } catch (Exception $e) {
                $errors[] = "Error processing item {$item['id']}: " . $e->getMessage();
            }
        }
        
        sendResponse([
            'success' => true,
            'processed' => $processed,
            'total' => count($queue_items),
            'errors' => $errors
        ]);
        
    } catch (Exception $e) {
        error_log("Process sync queue error: " . $e->getMessage());
        sendError('Failed to process sync queue', 500);
    }
}

function processQueueItem($db, $user_id, $item) {
    $action = $item['action'];
    $entity_type = $item['entityType'];
    $entity_id = $item['entityId'];
    $entity_client_id = $item['entityClientId'];
    $data = json_decode($item['data'], true);
    
    switch ($entity_type) {
        case 'task':
            return processTaskSync($db, $user_id, $action, $entity_client_id, $data);
        case 'progress':
            return processProgressSync($db, $user_id, $action, $entity_client_id, $data);
        case 'category':
            return processCategorySync($db, $user_id, $action, $entity_client_id, $data);
        case 'section':
            return processSectionSync($db, $user_id, $action, $entity_client_id, $data);
        case 'goal':
            return processGoalSync($db, $user_id, $action, $entity_client_id, $data);
        default:
            return false;
    }
}

function processTaskSync($db, $user_id, $action, $entity_client_id, $data) {
    try {
        // Get user's clientId
        $userStmt = $db->prepare("SELECT clientId FROM users WHERE id = ?");
        $userStmt->execute([$user_id]);
        $user = $userStmt->fetch();
        $userClientId = $user['clientId'];
        
        switch ($action) {
            case 'create':
                $stmt = $db->prepare("
                    INSERT INTO tasks (
                        clientId, userId, userClientId, name, taskType, plannedMinutes, targetCount,
                        selectedDays, scheduleType, monthlyTypes, monthlyDays, intervalWeeks,
                        startDate, endDate, excludedDates, oneOffDates,
                        color, categoryClientId, sectionClientId, goalClientId
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ");
                
                $stmt->execute([
                    $data['clientId'] ?? generateClientId(),
                    $user_id,
                    $userClientId,
                    $data['name'],
                    $data['taskType'],
                    $data['plannedMinutes'] ?? null,
                    $data['targetCount'] ?? null,
                    json_encode($data['selectedDays']),
                    $data['scheduleType'],
                    json_encode($data['monthlyTypes'] ?? []),
                    json_encode($data['monthlyDays'] ?? []),
                    $data['intervalWeeks'] ?? 1,
                    $data['startDate'],
                    $data['endDate'] ?? null,
                    json_encode($data['excludedDates'] ?? []),
                    json_encode($data['oneOffDates'] ?? []),
                    $data['color'],
                    $data['categoryClientId'] ?? null,
                    $data['sectionClientId'],
                    $data['goalClientId'] ?? null
                ]);
                return true;
                
            case 'update':
                // Build dynamic update query
                $fields = [];
                $values = [];
                
                $allowed_fields = [
                    'name', 'taskType', 'plannedMinutes', 'targetCount',
                    'selectedDays', 'scheduleType', 'monthlyTypes', 'monthlyDays', 'intervalWeeks',
                    'startDate', 'endDate', 'excludedDates', 'oneOffDates',
                    'color', 'categoryClientId', 'sectionClientId', 'goalClientId'
                ];
                
                foreach ($allowed_fields as $field) {
                    if (array_key_exists($field, $data)) {
                        if (in_array($field, ['selectedDays', 'monthlyTypes', 'monthlyDays', 'excludedDates', 'oneOffDates'])) {
                            $fields[] = "$field = ?";
                            $values[] = json_encode($data[$field]);
                        } else {
                            $fields[] = "$field = ?";
                            $values[] = $data[$field];
                        }
                    }
                }
                
                if (!empty($fields)) {
                    $values[] = $entity_client_id;
                    $values[] = $user_id;
                    
                    $sql = "UPDATE tasks SET " . implode(', ', $fields) . " WHERE clientId = ? AND userId = ?";
                    $stmt = $db->prepare($sql);
                    $stmt->execute($values);
                }
                return true;
                
            case 'delete':
                $stmt = $db->prepare("DELETE FROM tasks WHERE clientId = ? AND userId = ?");
                $stmt->execute([$entity_client_id, $user_id]);
                return true;
        }
    } catch (Exception $e) {
        error_log("Task sync error: " . $e->getMessage());
        return false;
    }
    
    return false;
}

function processProgressSync($db, $user_id, $action, $entity_client_id, $data) {
    try {
        switch ($action) {
            case 'update':
                // Verify task belongs to user using taskClientId
                $stmt = $db->prepare("SELECT id, clientId FROM tasks WHERE clientId = ? AND userId = ?");
                $stmt->execute([$data['taskClientId'], $user_id]);
                $task = $stmt->fetch();
                if (!$task) {
                    return false;
                }
                
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
                    $data['clientId'] ?? generateClientId(),
                    $task['id'],
                    $task['clientId'],
                    $data['date'],
                    $data['timeSpent'] ?? 0,
                    $data['currentCount'] ?? 0,
                    $data['inputValue'] ?? 0,
                    $data['isRunning'] ?? false,
                    $data['startTime'] ?? null
                ]);
                return true;
                
            case 'delete':
                $stmt = $db->prepare("
                    DELETE tp FROM taskProgress tp 
                    JOIN tasks t ON tp.taskClientId = t.clientId 
                    WHERE tp.taskClientId = ? AND tp.date = ? AND t.userId = ?
                ");
                $stmt->execute([$data['taskClientId'], $data['date'], $user_id]);
                return true;
        }
    } catch (Exception $e) {
        error_log("Progress sync error: " . $e->getMessage());
        return false;
    }
    
    return false;
}

function processCategorySync($db, $user_id, $action, $entity_client_id, $data) {
    try {
        // Get user's clientId
        $userStmt = $db->prepare("SELECT clientId FROM users WHERE id = ?");
        $userStmt->execute([$user_id]);
        $user = $userStmt->fetch();
        $userClientId = $user['clientId'];
        
        switch ($action) {
            case 'create':
                $stmt = $db->prepare("INSERT INTO categories (clientId, userId, userClientId, name, color, icon) VALUES (?, ?, ?, ?, ?, ?)");
                $stmt->execute([
                    $data['clientId'] ?? generateClientId(),
                    $user_id,
                    $userClientId,
                    $data['name'],
                    $data['color'],
                    $data['icon']
                ]);
                return true;
                
            case 'update':
                $fields = [];
                $values = [];
                $allowed_fields = ['name', 'color', 'icon'];
                
                foreach ($allowed_fields as $field) {
                    if (array_key_exists($field, $data)) {
                        $fields[] = "$field = ?";
                        $values[] = $data[$field];
                    }
                }
                
                if (!empty($fields)) {
                    $values[] = $entity_client_id;
                    $values[] = $user_id;
                    
                    $sql = "UPDATE categories SET " . implode(', ', $fields) . " WHERE clientId = ? AND userId = ?";
                    $stmt = $db->prepare($sql);
                    $stmt->execute($values);
                }
                return true;
                
            case 'delete':
                $stmt = $db->prepare("DELETE FROM categories WHERE clientId = ? AND userId = ?");
                $stmt->execute([$entity_client_id, $user_id]);
                return true;
        }
    } catch (Exception $e) {
        error_log("Category sync error: " . $e->getMessage());
        return false;
    }
    
    return false;
}

function processSectionSync($db, $user_id, $action, $entity_client_id, $data) {
    try {
        // Get user's clientId
        $userStmt = $db->prepare("SELECT clientId FROM users WHERE id = ?");
        $userStmt->execute([$user_id]);
        $user = $userStmt->fetch();
        $userClientId = $user['clientId'];
        
        switch ($action) {
            case 'create':
                $stmt = $db->prepare("
                    INSERT INTO sections (clientId, userId, userClientId, name, layoutMode, columnCount, rules, taskOrder, showBackground) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                ");
                $stmt->execute([
                    $data['clientId'] ?? generateClientId(),
                    $user_id,
                    $userClientId,
                    $data['name'],
                    $data['layoutMode'] ?? 'list',
                    $data['columnCount'] ?? 1,
                    json_encode($data['rules'] ?? []),
                    json_encode($data['taskOrder'] ?? []),
                    $data['showBackground'] ?? true
                ]);
                return true;
                
            case 'update':
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
                
                if (!empty($fields)) {
                    $values[] = $entity_client_id;
                    $values[] = $user_id;
                    
                    $sql = "UPDATE sections SET " . implode(', ', $fields) . " WHERE clientId = ? AND userId = ?";
                    $stmt = $db->prepare($sql);
                    $stmt->execute($values);
                }
                return true;
                
            case 'delete':
                $stmt = $db->prepare("DELETE FROM sections WHERE clientId = ? AND userId = ?");
                $stmt->execute([$entity_client_id, $user_id]);
                return true;
        }
    } catch (Exception $e) {
        error_log("Section sync error: " . $e->getMessage());
        return false;
    }
    
    return false;
}

function processGoalSync($db, $user_id, $action, $entity_client_id, $data) {
    try {
        // Get user's clientId
        $userStmt = $db->prepare("SELECT clientId FROM users WHERE id = ?");
        $userStmt->execute([$user_id]);
        $user = $userStmt->fetch();
        $userClientId = $user['clientId'];
        
        switch ($action) {
            case 'create':
                $stmt = $db->prepare("
                    INSERT INTO goals (clientId, userId, userClientId, name, description, targetValue, unit, goalType, currentProgress, personalBestProgress, createdDate) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ");
                $stmt->execute([
                    $data['clientId'] ?? generateClientId(),
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
                return true;
                
            case 'update':
                $fields = [];
                $values = [];
                $allowed_fields = ['name', 'description', 'targetValue', 'unit', 'goalType', 'currentProgress', 'personalBestProgress', 'createdDate'];
                
                foreach ($allowed_fields as $field) {
                    if (array_key_exists($field, $data)) {
                        $fields[] = "$field = ?";
                        $values[] = $data[$field];
                    }
                }
                
                if (!empty($fields)) {
                    $values[] = $entity_client_id;
                    $values[] = $user_id;
                    
                    $sql = "UPDATE goals SET " . implode(', ', $fields) . " WHERE clientId = ? AND userId = ?";
                    $stmt = $db->prepare($sql);
                    $stmt->execute($values);
                }
                return true;
                
            case 'delete':
                $stmt = $db->prepare("DELETE FROM goals WHERE clientId = ? AND userId = ?");
                $stmt->execute([$entity_client_id, $user_id]);
                return true;
        }
    } catch (Exception $e) {
        error_log("Goal sync error: " . $e->getMessage());
        return false;
    }
    
    return false;
}

function getSyncStatus($db, $user_id) {
    try {
        $stmt = $db->prepare("SELECT COUNT(*) as queue_count FROM syncQueue WHERE userId = ?");
        $stmt->execute([$user_id]);
        $result = $stmt->fetch();
        
        sendResponse([
            'pending_items' => (int)$result['queue_count'],
            'has_pending' => $result['queue_count'] > 0
        ]);
        
    } catch (Exception $e) {
        error_log("Get sync status error: " . $e->getMessage());
        sendError('Failed to get sync status', 500);
    }
}

function clearSyncQueue($db, $user_id) {
    try {
        $stmt = $db->prepare("DELETE FROM syncQueue WHERE userId = ?");
        $stmt->execute([$user_id]);
        
        sendResponse(['success' => true, 'message' => 'Sync queue cleared']);
        
    } catch (Exception $e) {
        error_log("Clear sync queue error: " . $e->getMessage());
        sendError('Failed to clear sync queue', 500);
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