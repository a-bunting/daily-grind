-- Daily Grind Database Schema
-- Create database
CREATE DATABASE IF NOT EXISTS daily_grind CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE daily_grind;

-- Users table
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_username (username),
    INDEX idx_email (email)
);

-- Categories table
CREATE TABLE categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    color VARCHAR(7) NOT NULL, -- Hex color code
    icon VARCHAR(10) NOT NULL, -- Emoji icon
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id)
);

-- Sections table
CREATE TABLE sections (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    layout_mode VARCHAR(20) DEFAULT 'list', -- 'list', 'grid', 'compact'
    column_count INT DEFAULT 1,
    rules JSON, -- Section rules as JSON
    task_order JSON, -- Task order array as JSON
    show_background BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id)
);

-- Goals table
CREATE TABLE goals (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    target_value DECIMAL(10,2) NOT NULL,
    unit VARCHAR(20),
    goal_type VARCHAR(20) DEFAULT 'cumulative', -- 'cumulative', 'personalBest'
    current_progress DECIMAL(10,2) DEFAULT 0,
    personal_best_progress DECIMAL(10,2) DEFAULT 0,
    created_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id)
);

-- Tasks table
CREATE TABLE tasks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    name VARCHAR(200) NOT NULL,
    task_type ENUM('time', 'count', 'input') NOT NULL,
    planned_minutes INT NULL, -- For time tasks
    target_count INT NULL, -- For count tasks
    selected_days JSON NOT NULL, -- Array of day indices [0-6]
    schedule_type ENUM('weekly', 'monthly', 'interval') NOT NULL,
    monthly_types JSON, -- Array of monthly types ['first', 'second', etc.]
    monthly_days JSON, -- Array of day indices for monthly tasks
    interval_weeks INT DEFAULT 1,
    start_date DATE NOT NULL,
    end_date DATE NULL,
    excluded_dates JSON, -- Array of excluded date strings
    one_off_dates JSON, -- Array of one-off date strings
    color VARCHAR(7) NOT NULL,
    category_id INT NULL,
    section_id INT NOT NULL,
    goal_id INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
    FOREIGN KEY (section_id) REFERENCES sections(id) ON DELETE CASCADE,
    FOREIGN KEY (goal_id) REFERENCES goals(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_category_id (category_id),
    INDEX idx_section_id (section_id),
    INDEX idx_goal_id (goal_id),
    INDEX idx_start_date (start_date),
    INDEX idx_end_date (end_date)
);

-- Task progress table (replaces dailyProgress object)
CREATE TABLE task_progress (
    id INT AUTO_INCREMENT PRIMARY KEY,
    task_id INT NOT NULL,
    date DATE NOT NULL,
    time_spent INT DEFAULT 0, -- Seconds for time tasks
    current_count INT DEFAULT 0, -- Count for count tasks
    input_value DECIMAL(10,2) DEFAULT 0, -- Value for input tasks
    is_running BOOLEAN DEFAULT FALSE,
    start_time BIGINT NULL, -- Timestamp when timer started
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
    UNIQUE KEY unique_task_date (task_id, date),
    INDEX idx_task_id (task_id),
    INDEX idx_date (date)
);

-- User preferences table (for UI state that should persist)
CREATE TABLE user_preferences (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    preference_key VARCHAR(100) NOT NULL,
    preference_value JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_preference (user_id, preference_key),
    INDEX idx_user_id (user_id)
);

-- Sync queue table (for offline changes)
CREATE TABLE sync_queue (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    action VARCHAR(20) NOT NULL, -- 'create', 'update', 'delete'
    entity_type VARCHAR(20) NOT NULL, -- 'task', 'category', 'section', 'goal', 'progress'
    entity_id VARCHAR(50) NOT NULL, -- Can be temp ID for creates
    data JSON NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_created_at (created_at)
);

-- Insert default sections for new users (will be done via PHP)
-- These will be inserted when a user registers