<?php
// api/tasks.php - Updated for Client ID system
require_once '../config/database.php';
require_once '../includes/jwt.php';
require_once '../includes/api_helpers.php';

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];
$request_uri = $_SERVER['REQUEST_URI'];

// Parse the endpoint - now supports both ID and clientId
$path_parts = explode('/', trim($request_uri, '/'));
$task_identifier = isset($path_parts[count($path_parts) - 1]) && $path_parts[count($path_parts) - 1] !== 'tasks' 
    ? $path_parts[count($path_parts) - 1] : null;

// Get authenticated user
$user = getAuthenticatedUser();
$userId = $user['user_id'];

switch ($method) {
    case 'GET':
        if ($task_identifier) {
            getTask($db, $userId, $task_identifier);
        } else {
            getAllTasks($db, $userId);
        }
        break;
    case 'POST':
        createTask($db, $userId);
        break;
    case 'PUT':
        if ($task_identifier) {
            updateTask($db, $userId, $task_identifier);
        } else {
            sendError('Task ID required for update', 400);
        }
        break;
    case 'DELETE':
        if ($task_identifier) {
            deleteTask($db, $userId, $task_identifier);
        } else {
            sendError('Task ID required for delete', 400);
        }
        break;
    default:
        sendError('Method not allowed', 405);
}

function getAllTasks($db, $userId) {
    try {
        // Get tasks with progress data using clientId references
        $stmt = $db->prepare("
            SELECT t.*, 
                   GROUP_CONCAT(
                       CONCAT(tp.date, ':', tp.timeSpent, ':', tp.currentCount, ':', tp.inputValue, ':', tp.isRunning, ':', tp.startTime)
                       SEPARATOR '|'
                   ) as progressData
            FROM tasks t
            LEFT JOIN taskProgress tp ON t.clientId = tp.taskClientId
            WHERE t.userId = ?
            GROUP BY t.clientId
            ORDER BY t.createdAt DESC
        ");
        $stmt->execute([$userId]);
        $tasks = $stmt->fetchAll();
        
        // Process tasks to match frontend format
        $processedTasks = [];
        foreach ($tasks as $task) {
            $processedTask = processTaskFromDB($task);
            $processedTasks[] = $processedTask;
        }
        
        sendResponse($processedTasks);
        
    } catch (Exception $e) {
        error_log("Get tasks error: " . $e->getMessage());
        sendError('Failed to fetch tasks', 500);
    }
}

function getTask($db, $userId, $taskIdentifier) {
    try {
        // Support both clientId and numeric ID for backwards compatibility
        $isClientId = !is_numeric($taskIdentifier);
        $idField = $isClientId ? 'clientId' : 'id';
        
        $stmt = $db->prepare("
            SELECT t.*, 
                   GROUP_CONCAT(
                       CONCAT(tp.date, ':', tp.timeSpent, ':', tp.currentCount, ':', tp.inputValue, ':', tp.isRunning, ':', tp.startTime)
                       SEPARATOR '|'
                   ) as progressData
            FROM tasks t
            LEFT JOIN taskProgress tp ON t.clientId = tp.taskClientId
            WHERE t.userId = ? AND t.$idField = ?
            GROUP BY t.clientId
        ");
        $stmt->execute([$userId, $taskIdentifier]);
        $task = $stmt->fetch();
        
        if (!$task) {
            sendError('Task not found', 404);
        }
        
        $processedTask = processTaskFromDB($task);
        sendResponse($processedTask);
        
    } catch (Exception $e) {
        error_log("Get task error: " . $e->getMessage());
        sendError('Failed to fetch task', 500);
    }
}

function createTask($db, $userId) {
    $data = getRequestData();
    log_text("log.txt", $data);
    validateRequired($data, ['name', 'taskType', 'selectedDays', 'scheduleType', 'startDate', 'color', 'sectionClientId']);
    
    // Generate clientId if not provided
    if (!isset($data['clientId'])) {
        $data['clientId'] = generateClientId();
    }

    try {
        $stmt = $db->prepare("
            INSERT INTO tasks (
                clientId, userId, userClientId, name, taskType, plannedMinutes, targetCount,
                selectedDays, scheduleType, monthlyTypes, monthlyDays, intervalWeeks,
                startDate, endDate, excludedDates, oneOffDates,
                color, categoryClientId, sectionClientId, goalClientId, unit
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");
        
        // Get user's clientId
        $userStmt = $db->prepare("SELECT clientId FROM users WHERE id = ?");
        $userStmt->execute([$userId]);
        $user = $userStmt->fetch();
        $userClientId = $user['clientId'];
        
        $stmt->execute([
            $data['clientId'],
            $userId,
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
            $data['goalClientId'] ?? null,
            $data['unit'] ?? null
        ]);
        
        // Get the created task
        getTask($db, $userId, $data['clientId']);
        
    } catch (Exception $e) {
        error_log("Create task error: " . $e->getMessage());
        sendError('Failed to create task', 500);
    }
}

function updateTask($db, $userId, $taskIdentifier) {
    $data = getRequestData();
    
    try {
        // Support both clientId and numeric ID
        $isClientId = !is_numeric($taskIdentifier);
        $idField = $isClientId ? 'clientId' : 'id';
        
        // Check if task belongs to user
        $stmt = $db->prepare("SELECT clientId FROM tasks WHERE $idField = ? AND userId = ?");
        $stmt->execute([$taskIdentifier, $userId]);
        $task = $stmt->fetch();
        if (!$task) {
            sendError('Task not found', 404);
        }
        
        // Build dynamic update query
        $fields = [];
        $values = [];
        
        $allowedFields = [
            'name', 'taskType', 'plannedMinutes', 'targetCount',
            'selectedDays', 'scheduleType', 'monthlyTypes', 'monthlyDays', 'intervalWeeks',
            'startDate', 'endDate', 'excludedDates', 'oneOffDates',
            'color', 'categoryClientId', 'sectionClientId', 'goalClientId', 'unit'
        ];
        
        foreach ($allowedFields as $field) {
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
        
        if (empty($fields)) {
            sendError('No valid fields to update', 400);
        }
        
        $values[] = $taskIdentifier;
        $values[] = $userId;
        
        $sql = "UPDATE tasks SET " . implode(', ', $fields) . " WHERE $idField = ? AND userId = ?";
        $stmt = $db->prepare($sql);
        $stmt->execute($values);
        
        // Get the updated task using clientId
        $clientId = $isClientId ? $taskIdentifier : $task['clientId'];
        getTask($db, $userId, $clientId);
        
    } catch (Exception $e) {
        error_log("Update task error: " . $e->getMessage());
        sendError('Failed to update task', 500);
    }
}

function deleteTask($db, $userId, $taskIdentifier) {
    try {
        // Support both clientId and numeric ID
        $isClientId = !is_numeric($taskIdentifier);
        $idField = $isClientId ? 'clientId' : 'id';
        
        // Check if task belongs to user
        $stmt = $db->prepare("SELECT clientId FROM tasks WHERE $idField = ? AND userId = ?");
        $stmt->execute([$taskIdentifier, $userId]);
        if (!$stmt->fetch()) {
            sendError('Task not found', 404);
        }
        
        // Delete task (cascading will delete progress)
        $stmt = $db->prepare("DELETE FROM tasks WHERE $idField = ? AND userId = ?");
        $stmt->execute([$taskIdentifier, $userId]);
        
        sendResponse(['success' => true, 'message' => 'Task deleted']);
        
    } catch (Exception $e) {
        error_log("Delete task error: " . $e->getMessage());
        sendError('Failed to delete task', 500);
    }
}

function processTaskFromDB($task) {
    // Convert database format to frontend format
    $processed = [
        'id' => (int)$task['id'],
        'clientId' => $task['clientId'],
        'name' => $task['name'],
        'taskType' => $task['taskType'],
        'plannedMinutes' => $task['plannedMinutes'] ? (int)$task['plannedMinutes'] : null,
        'targetCount' => $task['targetCount'] ? (int)$task['targetCount'] : null,
        'selectedDays' => json_decode($task['selectedDays'], true) ?? [],
        'scheduleType' => $task['scheduleType'],
        'monthlyTypes' => json_decode($task['monthlyTypes'], true) ?? [],
        'monthlyDays' => json_decode($task['monthlyDays'], true) ?? [],
        'intervalWeeks' => (int)$task['intervalWeeks'],
        'startDate' => $task['startDate'],
        'endDate' => $task['endDate'],
        'excludedDates' => json_decode($task['excludedDates'], true) ?? [],
        'oneOffDates' => json_decode($task['oneOffDates'], true) ?? [],
        'color' => $task['color'],
        'categoryClientId' => $task['categoryClientId'],
        'sectionClientId' => $task['sectionClientId'],
        'goalClientId' => $task['goalClientId'],
        'unit' => $task['unit'],
        'dailyProgress' => [],
        
        // Legacy fields for backward compatibility
        'categoryId' => $task['categoryId'] ? (string)$task['categoryId'] : null,
        'sectionId' => (string)$task['sectionId'],
        'goalId' => $task['goalId'] ? (string)$task['goalId'] : null
    ];
    
    // Process progress data
    if (isset($task['progressData']) && $task['progressData']) {
        $progressEntries = explode('|', $task['progressData']);
        foreach ($progressEntries as $entry) {
            if (trim($entry)) {
                $parts = explode(':', $entry);
                if (count($parts) >= 6) {
                    $date = $parts[0];
                    $progress = [
                        'timeSpent' => (int)($parts[1] ?: 0),
                        'currentCount' => (int)($parts[2] ?: 0),
                        'inputValue' => (float)($parts[3] ?: 0),
                        'isRunning' => (bool)($parts[4] ?: false),
                        'startTime' => $parts[5] ? (int)$parts[5] : null
                    ];
                    
                    // Only include relevant fields based on task type
                    $filteredProgress = ['isRunning' => $progress['isRunning']];
                    if ($progress['startTime']) {
                        $filteredProgress['startTime'] = $progress['startTime'];
                    }
                    
                    switch ($task['taskType']) {
                        case 'time':
                            if ($progress['timeSpent'] > 0) {
                                $filteredProgress['timeSpent'] = $progress['timeSpent'];
                            }
                            break;
                        case 'count':
                            if ($progress['currentCount'] > 0) {
                                $filteredProgress['currentCount'] = $progress['currentCount'];
                            }
                            break;
                        case 'input':
                            if ($progress['inputValue'] > 0) {
                                $filteredProgress['inputValue'] = $progress['inputValue'];
                            }
                            break;
                    }
                    
                    $processed['dailyProgress'][$date] = $filteredProgress;
                }
            }
        }
    }
    
    return $processed;
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