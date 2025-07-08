import React from 'react';
import { useApp } from './AppProvider';

export const GoalFilterDebug = ({ todaysTasks }) => {
  const { tasks, goals } = useApp();

  const analyzeTaskGoalAssignments = () => {
    console.log('=== COMPREHENSIVE GOAL ASSIGNMENT ANALYSIS ===');
    
    console.log('1. TOTAL TASKS:', tasks.length);
    console.log('2. TOTAL GOALS:', goals.length);
    
    // Check all tasks for goalId property
    const tasksWithGoalId = tasks.filter(task => task.goalId !== undefined && task.goalId !== null);
    console.log('3. TASKS WITH goalId PROPERTY:', tasksWithGoalId.length);
    
    if (tasksWithGoalId.length > 0) {
      console.log('   Task goalIds found:', tasksWithGoalId.map(t => ({
        taskName: t.name,
        goalId: t.goalId,
        type: typeof t.goalId
      })));
    }
    
    // Check all tasks for ANY goal-related properties
    const possibleGoalProps = ['goalId', 'goal', 'goalID', 'linkedGoal', 'assignedGoal'];
    console.log('4. CHECKING FOR OTHER GOAL PROPERTIES...');
    
    tasks.forEach(task => {
      const foundProps = possibleGoalProps.filter(prop => task[prop] !== undefined);
      if (foundProps.length > 0) {
        console.log(`   Task "${task.name}" has:`, foundProps.map(prop => `${prop}: ${task[prop]}`));
      }
    });
    
    // Check sample task structure
    if (tasks.length > 0) {
      console.log('5. SAMPLE TASK STRUCTURE:', Object.keys(tasks[0]));
      console.log('6. FIRST TASK FULL OBJECT:', tasks[0]);
    }
    
    // Check if tasks have categories instead of goals
    const tasksWithCategories = tasks.filter(task => task.categoryId);
    console.log('7. TASKS WITH CATEGORIES:', tasksWithCategories.length);
    
    // Check goal structure
    if (goals.length > 0) {
      console.log('8. SAMPLE GOAL STRUCTURE:', Object.keys(goals[0]));
      console.log('9. FIRST GOAL FULL OBJECT:', goals[0]);
    }
  };

  const testTaskCreation = () => {
    console.log('=== TEST: HOW ARE TASKS CREATED? ===');
    console.log('This will help us understand why tasks don\'t have goalId...');
    console.log('Check your task creation/editing code for how goalId is set');
  };

  return (
    <div className="bg-red-50 border border-red-300 rounded-lg p-4 mb-4">
      <h4 className="font-bold text-red-800 mb-3">🔍 Comprehensive Goal Assignment Debug</h4>
      
      <div className="space-y-3">
        <div className="text-sm">
          <strong>Issue Found:</strong> No tasks have goalId assigned
          <br />
          <strong>Total Tasks:</strong> {tasks.length}
          <br />
          <strong>Total Goals:</strong> {goals.length}
          <br />
          <strong>Tasks with goalId:</strong> {tasks.filter(t => t.goalId).length}
        </div>

        <div className="space-y-2">
          <strong className="text-sm">Sample Tasks (first 3):</strong>
          {tasks.slice(0, 3).map(task => (
            <div key={task.id} className="p-2 bg-white rounded border text-xs">
              <div><strong>Name:</strong> {task.name}</div>
              <div><strong>ID:</strong> {task.id}</div>
              <div><strong>goalId:</strong> {task.goalId || 'undefined'}</div>
              <div><strong>categoryId:</strong> {task.categoryId || 'undefined'}</div>
              <div><strong>taskType:</strong> {task.taskType}</div>
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <strong className="text-sm">Available Goals:</strong>
          {goals.map(goal => (
            <div key={goal.id} className="p-2 bg-white rounded border text-xs">
              <div><strong>Name:</strong> {goal.name}</div>
              <div><strong>ID:</strong> {goal.id}</div>
              <div><strong>Type:</strong> {typeof goal.id}</div>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <button
            onClick={analyzeTaskGoalAssignments}
            className="px-3 py-2 bg-red-600 text-white rounded text-sm"
          >
            Analyze Task-Goal Assignments
          </button>
          <button
            onClick={testTaskCreation}
            className="px-3 py-2 bg-blue-600 text-white rounded text-sm"
          >
            Debug Task Creation
          </button>
        </div>

        <div className="text-xs text-gray-600 p-2 bg-yellow-100 rounded">
          <strong>Next Steps:</strong>
          <br />1. Check your task creation/editing code
          <br />2. Look for where goalId should be set on tasks
          <br />3. Verify task-goal linking is working during task creation
        </div>
      </div>
    </div>
  );
};

export default GoalFilterDebug;