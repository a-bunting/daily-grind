<?php

// includes/default_data.php
function getDefaultCategories() {
    return [
        ['name' => 'Health & Fitness', 'color' => '#ef4444', 'icon' => '💪'],
        ['name' => 'Learning', 'color' => '#3b82f6', 'icon' => '📚'],
        ['name' => 'Work', 'color' => '#8b5cf6', 'icon' => '💼'],
        ['name' => 'Personal', 'color' => '#10b981', 'icon' => '🌟'],
        ['name' => 'Social', 'color' => '#f59e0b', 'icon' => '👥'],
        ['name' => 'Creative', 'color' => '#ec4899', 'icon' => '🎨']
    ];
}

function getDefaultSections() {
    return [
        [
            'name' => 'Morning Routine',
            'layoutMode' => 'list',
            'columnCount' => 1,
            'rules' => [],
            'taskOrder' => [],
            'showBackground' => true
        ],
        [
            'name' => 'Work & Productivity', 
            'layoutMode' => 'list',
            'columnCount' => 1,
            'rules' => [],
            'taskOrder' => [],
            'showBackground' => true
        ],
        [
            'name' => 'Health & Wellness',
            'layoutMode' => 'list', 
            'columnCount' => 1,
            'rules' => [],
            'taskOrder' => [],
            'showBackground' => true
        ],
        [
            'name' => 'Evening Wind-down',
            'layoutMode' => 'list',
            'columnCount' => 1, 
            'rules' => [],
            'taskOrder' => [],
            'showBackground' => true
        ]
    ];
}