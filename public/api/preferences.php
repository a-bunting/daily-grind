<?php
// api/preferences.php - Updated for Client ID system
require_once '../config/database.php';
require_once '../includes/jwt.php';
require_once '../includes/api_helpers.php';

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];
$user = getAuthenticatedUser();
$user_id = $user['user_id'];

switch ($method) {
    case 'GET':
        getAllPreferences($db, $user_id);
        break;
    case 'POST':
        savePreferences($db, $user_id);
        break;
    case 'PUT':
        updatePreference($db, $user_id);
        break;
    default:
        sendError('Method not allowed', 405);
}

function getAllPreferences($db, $user_id) {
    try {
        $stmt = $db->prepare("SELECT clientId, preferenceKey, preferenceValue FROM userPreferences WHERE userId = ?");
        $stmt->execute([$user_id]);
        $preferences = $stmt->fetchAll();
        
        $result = [];
        foreach ($preferences as $pref) {
            $result[$pref['preferenceKey']] = [
                'clientId' => $pref['clientId'],
                'value' => json_decode($pref['preferenceValue'], true)
            ];
        }
        
        sendResponse($result);
        
    } catch (Exception $e) {
        error_log("Get preferences error: " . $e->getMessage());
        sendError('Failed to fetch preferences', 500);
    }
}

function savePreferences($db, $user_id) {
    $data = getRequestData();
    
    if (empty($data)) {
        sendError('No preferences provided', 400);
    }
    
    try {
        // Get user's clientId
        $userStmt = $db->prepare("SELECT clientId FROM users WHERE id = ?");
        $userStmt->execute([$user_id]);
        $user = $userStmt->fetch();
        $userClientId = $user['clientId'];
        
        $db->beginTransaction();
        
        $stmt = $db->prepare("
            INSERT INTO userPreferences (clientId, userId, userClientId, preferenceKey, preferenceValue) 
            VALUES (?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE 
                preferenceValue = VALUES(preferenceValue),
                updatedAt = CURRENT_TIMESTAMP
        ");
        
        foreach ($data as $key => $value) {
            // Generate clientId for preference if not provided
            $prefClientId = generateClientId();
            
            // If value is an object with clientId, extract the actual value
            $actualValue = is_array($value) && isset($value['value']) ? $value['value'] : $value;
            
            $stmt->execute([
                $prefClientId,
                $user_id,
                $userClientId,
                $key,
                json_encode($actualValue)
            ]);
        }
        
        $db->commit();
        sendResponse(['success' => true, 'message' => 'Preferences saved']);
        
    } catch (Exception $e) {
        $db->rollBack();
        error_log("Save preferences error: " . $e->getMessage());
        sendError('Failed to save preferences', 500);
    }
}

function updatePreference($db, $user_id) {
    $data = getRequestData();
    validateRequired($data, ['key', 'value']);
    
    try {
        // Get user's clientId
        $userStmt = $db->prepare("SELECT clientId FROM users WHERE id = ?");
        $userStmt->execute([$user_id]);
        $user = $userStmt->fetch();
        $userClientId = $user['clientId'];
        
        // Generate clientId for preference if not provided
        $prefClientId = $data['clientId'] ?? generateClientId();
        
        $stmt = $db->prepare("
            INSERT INTO userPreferences (clientId, userId, userClientId, preferenceKey, preferenceValue) 
            VALUES (?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE 
                preferenceValue = VALUES(preferenceValue),
                updatedAt = CURRENT_TIMESTAMP
        ");
        
        $stmt->execute([
            $prefClientId,
            $user_id,
            $userClientId,
            $data['key'],
            json_encode($data['value'])
        ]);
        
        sendResponse([
            'success' => true, 
            'message' => 'Preference updated',
            'clientId' => $prefClientId
        ]);
        
    } catch (Exception $e) {
        error_log("Update preference error: " . $e->getMessage());
        sendError('Failed to update preference', 500);
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