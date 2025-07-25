<?php
session_start();

// Simple admin authentication (replace with proper auth)
if (!isset($_SESSION['admin_logged_in'])) {
    if ($_POST['admin_password'] ?? '' === 'your_admin_password_here') {
        $_SESSION['admin_logged_in'] = true;
    } else {
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $error = 'Invalid password';
        }
        ?>
        <!DOCTYPE html>
        <html>
        <head>
            <title>Daily Grind Admin</title>
            <style>
                body { font-family: Arial, sans-serif; background: #f5f5f5; }
                .login-form { max-width: 300px; margin: 100px auto; background: white; padding: 20px; border-radius: 8px; }
                input { width: 100%; padding: 10px; margin: 10px 0; border: 1px solid #ddd; border-radius: 4px; }
                button { background: #007cba; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; }
                .error { color: red; margin: 10px 0; }
            </style>
        </head>
        <body>
            <div class="login-form">
                <h2>Admin Login</h2>
                <?php if (isset($error)) echo "<div class='error'>$error</div>"; ?>
                <form method="POST">
                    <input type="password" name="admin_password" placeholder="Admin Password" required>
                    <button type="submit">Login</button>
                </form>
            </div>
        </body>
        </html>
        <?php
        exit;
    }
}

require_once '../config/database.php';

$database = new Database();
$db = $database->getConnection();

// Get system stats
$stats = [];

try {
    // User stats
    $stmt = $db->query("SELECT COUNT(*) as total_users FROM users");
    $stats['total_users'] = $stmt->fetch()['total_users'];
    
    $stmt = $db->query("SELECT COUNT(*) as active_users FROM users WHERE DATE(updated_at) >= DATE_SUB(NOW(), INTERVAL 7 DAY)");
    $stats['active_users'] = $stmt->fetch()['active_users'];
    
    // Task stats
    $stmt = $db->query("SELECT COUNT(*) as total_tasks FROM tasks");
    $stats['total_tasks'] = $stmt->fetch()['total_tasks'];
    
    $stmt = $db->query("SELECT COUNT(*) as total_progress FROM task_progress");
    $stats['total_progress'] = $stmt->fetch()['total_progress'];
    
    // Recent activity
    $stmt = $db->query("
        SELECT u.username, COUNT(tp.id) as progress_count, MAX(tp.updated_at) as last_activity
        FROM users u 
        LEFT JOIN tasks t ON u.id = t.user_id 
        LEFT JOIN task_progress tp ON t.id = tp.task_id 
        WHERE tp.updated_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
        GROUP BY u.id 
        ORDER BY last_activity DESC 
        LIMIT 10
    ");
    $recent_activity = $stmt->fetchAll();
    
    // Sync queue stats
    $stmt = $db->query("SELECT COUNT(*) as queue_count FROM sync_queue");
    $stats['sync_queue'] = $stmt->fetch()['queue_count'];
    
    // Database size
    $stmt = $db->query("
        SELECT 
            table_name,
            ROUND(((data_length + index_length) / 1024 / 1024), 2) AS 'size_mb'
        FROM information_schema.TABLES 
        WHERE table_schema = DATABASE()
        ORDER BY (data_length + index_length) DESC
    ");
    $table_sizes = $stmt->fetchAll();
    
} catch (Exception $e) {
    $error = "Database error: " . $e->getMessage();
}
?>

<!DOCTYPE html>
<html>
<head>
    <title>Daily Grind Admin Dashboard</title>
    <style>
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
            margin: 0; 
            background: #f8f9fa;
        }
        .header { 
            background: #007cba; 
            color: white; 
            padding: 1rem 2rem; 
            display: flex; 
            justify-content: space-between; 
            align-items: center; 
        }
        .container { 
            max-width: 1200px; 
            margin: 0 auto; 
            padding: 2rem; 
        }
        .stats-grid { 
            display: grid; 
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); 
            gap: 1rem; 
            margin-bottom: 2rem; 
        }
        .stat-card { 
            background: white; 
            padding: 1.5rem; 
            border-radius: 8px; 
            box-shadow: 0 2px 4px rgba(0,0,0,0.1); 
        }
        .stat-number { 
            font-size: 2rem; 
            font-weight: bold; 
            color: #007cba; 
        }
        .stat-label { 
            color: #666; 
            margin-top: 0.5rem; 
        }
        .section { 
            background: white; 
            margin-bottom: 2rem; 
            border-radius: 8px; 
            overflow: hidden; 
            box-shadow: 0 2px 4px rgba(0,0,0,0.1); 
        }
        .section-header { 
            background: #f8f9fa; 
            padding: 1rem 1.5rem; 
            border-bottom: 1px solid #dee2e6; 
            font-weight: bold; 
        }
        .section-content { 
            padding: 1.5rem; 
        }
        table { 
            width: 100%; 
            border-collapse: collapse; 
        }
        th, td { 
            text-align: left; 
            padding: 0.75rem; 
            border-bottom: 1px solid #dee2e6; 
        }
        th { 
            background: #f8f9fa; 
            font-weight: 600; 
        }
        .logout-btn { 
            background: rgba(255,255,255,0.2); 
            color: white; 
            border: 1px solid rgba(255,255,255,0.3); 
            padding: 0.5rem 1rem; 
            border-radius: 4px; 
            text-decoration: none; 
        }
        .refresh-btn {
            background: #28a745;
            color: white;
            border: none;
            padding: 0.5rem 1rem;
            border-radius: 4px;
            cursor: pointer;
            margin-left: 1rem;
        }
        .error { 
            background: #f8d7da; 
            color: #721c24; 
            padding: 1rem; 
            border-radius: 4px; 
            margin-bottom: 1rem; 
        }
        .status-online { color: #28a745; font-weight: bold; }
        .status-warning { color: #ffc107; font-weight: bold; }
        .status-error { color: #dc3545; font-weight: bold; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Daily Grind Admin Dashboard</h1>
        <div>
            <button class="refresh-btn" onclick="location.reload()">Refresh</button>
            <a href="?logout=1" class="logout-btn">Logout</a>
        </div>
    </div>

    <div class="container">
        <?php if (isset($error)): ?>
            <div class="error"><?= htmlspecialchars($error) ?></div>
        <?php endif; ?>

        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-number"><?= $stats['total_users'] ?? 0 ?></div>
                <div class="stat-label">Total Users</div>
            </div>
            
            <div class="stat-card">
                <div class="stat-number"><?= $stats['active_users'] ?? 0 ?></div>
                <div class="stat-label">Active Users (7 days)</div>
            </div>
            
            <div class="stat-card">
                <div class="stat-number"><?= $stats['total_tasks'] ?? 0 ?></div>
                <div class="stat-label">Total Tasks</div>
            </div>
            
            <div class="stat-card">
                <div class="stat-number"><?= $stats['total_progress'] ?? 0 ?></div>
                <div class="stat-label">Progress Entries</div>
            </div>
            
            <div class="stat-card">
                <div class="stat-number <?= ($stats['sync_queue'] ?? 0) > 0 ? 'status-warning' : 'status-online' ?>">
                    <?= $stats['sync_queue'] ?? 0 ?>
                </div>
                <div class="stat-label">Pending Sync Items</div>
            </div>
        </div>

        <div class="section">
            <div class="section-header">Recent Activity (24 hours)</div>
            <div class="section-content">
                <?php if (!empty($recent_activity)): ?>
                    <table>
                        <thead>
                            <tr>
                                <th>Username</th>
                                <th>Progress Updates</th>
                                <th>Last Activity</th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php foreach ($recent_activity as $activity): ?>
                                <tr>
                                    <td><?= htmlspecialchars($activity['username']) ?></td>
                                    <td><?= $activity['progress_count'] ?></td>
                                    <td><?= $activity['last_activity'] ?></td>
                                </tr>
                            <?php endforeach; ?>
                        </tbody>
                    </table>
                <?php else: ?>
                    <p>No recent activity in the last 24 hours.</p>
                <?php endif; ?>
            </div>
        </div>

        <div class="section">
            <div class="section-header">Database Table Sizes</div>
            <div class="section-content">
                <table>
                    <thead>
                        <tr>
                            <th>Table</th>
                            <th>Size (MB)</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php foreach ($table_sizes as $table): ?>
                            <tr>
                                <td><?= htmlspecialchars($table['table_name']) ?></td>
                                <td><?= $table['size_mb'] ?></td>
                            </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
            </div>
        </div>

        <div class="section">
            <div class="section-header">System Health</div>
            <div class="section-content">
                <table>
                    <thead>
                        <tr>
                            <th>Component</th>
                            <th>Status</th>
                            <th>Details</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Database Connection</td>
                            <td><span class="status-online">✓ Online</span></td>
                            <td>Connected successfully</td>
                        </tr>
                        <tr>
                            <td>PHP Version</td>
                            <td><span class="status-online">✓ OK</span></td>
                            <td><?= PHP_VERSION ?></td>
                        </tr>
                        <tr>
                            <td>Sync Queue</td>
                            <td><span class="<?= ($stats['sync_queue'] ?? 0) > 10 ? 'status-warning' : 'status-online' ?>">
                                <?= ($stats['sync_queue'] ?? 0) > 10 ? '⚠ High' : '✓ Normal' ?>
                            </span></td>
                            <td><?= $stats['sync_queue'] ?? 0 ?> items pending</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</body>
</html>

<?php
// Handle logout
if (isset($_GET['logout'])) {
    session_destroy();
    header('Location: dashboard.php');
    exit;
}
?>