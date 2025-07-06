// testData.js - Comprehensive test data for Daily Todo App

export const generateTestData = (colors, dateUtils) => {
    const today = new Date();
    const sixMonthsAgo = new Date(today.getTime() - 180 * 24 * 60 * 60 * 1000);
    const threeMonthsAgo = new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(today.getTime() - 14 * 24 * 60 * 60 * 1000);
    
    const fakeColors = colors.taskColors;
    
    const testTasks = [
      // Daily habits - started 6 months ago
      {
        id: 1001,
        name: "Morning Exercise",
        taskType: "time",
        plannedMinutes: 30,
        targetCount: null,
        selectedDays: [1, 2, 3, 4, 5], // Weekdays
        dailyProgress: {},
        excludedDates: [
          dateUtils.getDateString(new Date(today.getTime() - 45 * 24 * 60 * 60 * 1000)),
          dateUtils.getDateString(new Date(today.getTime() - 32 * 24 * 60 * 60 * 1000)),
          dateUtils.getDateString(new Date(today.getTime() - 12 * 24 * 60 * 60 * 1000))
        ],
        oneOffDates: [
          dateUtils.getDateString(new Date(today.getTime() - 44 * 24 * 60 * 60 * 1000)),
          dateUtils.getDateString(new Date(today.getTime() - 23 * 24 * 60 * 60 * 1000))
        ],
        startDate: dateUtils.getDateString(sixMonthsAgo),
        endDate: null,
        color: fakeColors[0],
        categoryId: 'fitness',
        scheduleType: 'weekly',
        monthlyTypes: ['first'],
        monthlyDays: [],
        intervalWeeks: 1,
        sectionId: 'default'
      },
      {
        id: 1002,
        name: "Read Pages",
        taskType: "count",
        plannedMinutes: null,
        targetCount: 15,
        selectedDays: [0, 1, 2, 3, 4, 5, 6], // Every day
        dailyProgress: {},
        excludedDates: [],
        oneOffDates: [],
        startDate: dateUtils.getDateString(sixMonthsAgo),
        endDate: null,
        color: fakeColors[1],
        categoryId: 'learning',
        scheduleType: 'weekly',
        monthlyTypes: ['first'],
        monthlyDays: [],
        intervalWeeks: 1,
        sectionId: 'default'
      },
      {
        id: 1003,
        name: "Meditation",
        taskType: "time",
        plannedMinutes: 20,
        targetCount: null,
        selectedDays: [0, 1, 2, 3, 4, 5, 6], // Every day
        dailyProgress: {},
        excludedDates: [],
        oneOffDates: [],
        startDate: dateUtils.getDateString(sixMonthsAgo),
        endDate: null,
        color: fakeColors[2],
        categoryId: 'health',
        scheduleType: 'weekly',
        monthlyTypes: ['first'],
        monthlyDays: [],
        intervalWeeks: 1,
        sectionId: 'default'
      },
      {
        id: 1004,
        name: "Take Vitamins",
        taskType: "count",
        plannedMinutes: null,
        targetCount: 1,
        selectedDays: [0, 1, 2, 3, 4, 5, 6], // Every day
        dailyProgress: {},
        excludedDates: [
          dateUtils.getDateString(new Date(today.getTime() - 67 * 24 * 60 * 60 * 1000)),
          dateUtils.getDateString(new Date(today.getTime() - 34 * 24 * 60 * 60 * 1000))
        ],
        oneOffDates: [],
        startDate: dateUtils.getDateString(sixMonthsAgo),
        endDate: null,
        color: fakeColors[3],
        categoryId: 'health',
        scheduleType: 'weekly',
        monthlyTypes: ['first'],
        monthlyDays: [],
        intervalWeeks: 1,
        sectionId: 'default'
      },
      // Work-related tasks
      {
        id: 1005,
        name: "Code Review",
        taskType: "time",
        plannedMinutes: 45,
        targetCount: null,
        selectedDays: [1, 2, 3, 4, 5], // Weekdays
        dailyProgress: {},
        excludedDates: [],
        oneOffDates: [],
        startDate: dateUtils.getDateString(threeMonthsAgo),
        endDate: null,
        color: fakeColors[4],
        categoryId: 'work',
        scheduleType: 'weekly',
        monthlyTypes: ['first'],
        monthlyDays: [],
        intervalWeeks: 1,
        sectionId: 'work'
      },
      {
        id: 1006,
        name: "Team Standup",
        taskType: "count",
        plannedMinutes: null,
        targetCount: 1,
        selectedDays: [1, 2, 3, 4, 5], // Weekdays
        dailyProgress: {},
        excludedDates: [
          dateUtils.getDateString(new Date(today.getTime() - 78 * 24 * 60 * 60 * 1000)),
          dateUtils.getDateString(new Date(today.getTime() - 43 * 24 * 60 * 60 * 1000))
        ],
        oneOffDates: [],
        startDate: dateUtils.getDateString(threeMonthsAgo),
        endDate: null,
        color: fakeColors[5],
        categoryId: 'work',
        scheduleType: 'weekly',
        monthlyTypes: ['first'],
        monthlyDays: [],
        intervalWeeks: 1,
        sectionId: 'work'
      },
      // Weekend tasks
      {
        id: 1007,
        name: "Grocery Shopping",
        taskType: "count",
        plannedMinutes: null,
        targetCount: 1,
        selectedDays: [6], // Saturday
        dailyProgress: {},
        excludedDates: [],
        oneOffDates: [
          dateUtils.getDateString(new Date(today.getTime() - 52 * 24 * 60 * 60 * 1000)),
          dateUtils.getDateString(new Date(today.getTime() - 31 * 24 * 60 * 60 * 1000))
        ],
        startDate: dateUtils.getDateString(sixMonthsAgo),
        endDate: null,
        color: fakeColors[6],
        categoryId: 'personal',
        scheduleType: 'weekly',
        monthlyTypes: ['first'],
        monthlyDays: [],
        intervalWeeks: 1,
        sectionId: 'personal'
      },
      {
        id: 1008,
        name: "Clean House",
        taskType: "time",
        plannedMinutes: 90,
        targetCount: null,
        selectedDays: [0], // Sunday
        dailyProgress: {},
        excludedDates: [
          dateUtils.getDateString(new Date(today.getTime() - 21 * 24 * 60 * 60 * 1000))
        ],
        oneOffDates: [],
        startDate: dateUtils.getDateString(sixMonthsAgo),
        endDate: null,
        color: fakeColors[7],
        categoryId: 'personal',
        scheduleType: 'weekly',
        monthlyTypes: ['first'],
        monthlyDays: [],
        intervalWeeks: 1,
        sectionId: 'personal'
      },
      // Monthly tasks
      {
        id: 1009,
        name: "Budget Review",
        taskType: "time",
        plannedMinutes: 60,
        targetCount: null,
        selectedDays: [0], // First Sunday of month
        dailyProgress: {},
        excludedDates: [],
        oneOffDates: [],
        startDate: dateUtils.getDateString(sixMonthsAgo),
        endDate: null,
        color: fakeColors[8],
        categoryId: 'personal',
        scheduleType: 'monthly',
        monthlyTypes: ['first'],
        monthlyDays: [0],
        intervalWeeks: 1,
        sectionId: 'personal'
      },
      {
        id: 1010,
        name: "Doctor Checkup",
        taskType: "count",
        plannedMinutes: null,
        targetCount: 1,
        selectedDays: [3], // Third Wednesday of month
        dailyProgress: {},
        excludedDates: [],
        oneOffDates: [],
        startDate: dateUtils.getDateString(sixMonthsAgo),
        endDate: null,
        color: fakeColors[9],
        categoryId: 'health',
        scheduleType: 'monthly',
        monthlyTypes: ['third'],
        monthlyDays: [3],
        intervalWeeks: 1,
        sectionId: 'health'
      },
      // Interval tasks
      {
        id: 1011,
        name: "Deep Work Session",
        taskType: "time",
        plannedMinutes: 120,
        targetCount: null,
        selectedDays: [2, 4], // Tuesday and Thursday every 2 weeks
        dailyProgress: {},
        excludedDates: [],
        oneOffDates: [],
        startDate: dateUtils.getDateString(threeMonthsAgo),
        endDate: null,
        color: fakeColors[0],
        categoryId: 'work',
        scheduleType: 'interval',
        monthlyTypes: ['first'],
        monthlyDays: [],
        intervalWeeks: 2,
        sectionId: 'work'
      },
      {
        id: 1012,
        name: "Skill Practice",
        taskType: "time",
        plannedMinutes: 75,
        targetCount: null,
        selectedDays: [6], // Saturday every 3 weeks
        dailyProgress: {},
        excludedDates: [],
        oneOffDates: [],
        startDate: dateUtils.getDateString(threeMonthsAgo),
        endDate: null,
        color: fakeColors[1],
        categoryId: 'learning',
        scheduleType: 'interval',
        monthlyTypes: ['first'],
        monthlyDays: [],
        intervalWeeks: 3,
        sectionId: 'personal'
      },
      // Recently started tasks
      {
        id: 1013,
        name: "Language Learning",
        taskType: "time",
        plannedMinutes: 25,
        targetCount: null,
        selectedDays: [1, 2, 3, 4, 5], // Weekdays
        dailyProgress: {},
        excludedDates: [],
        oneOffDates: [],
        startDate: dateUtils.getDateString(oneMonthAgo),
        endDate: null,
        color: fakeColors[2],
        categoryId: 'learning',
        scheduleType: 'weekly',
        monthlyTypes: ['first'],
        monthlyDays: [],
        intervalWeeks: 1,
        sectionId: 'default'
      },
      {
        id: 1014,
        name: "Water Intake",
        taskType: "count",
        plannedMinutes: null,
        targetCount: 8,
        selectedDays: [0, 1, 2, 3, 4, 5, 6], // Every day
        dailyProgress: {},
        excludedDates: [],
        oneOffDates: [],
        startDate: dateUtils.getDateString(twoWeeksAgo),
        endDate: null,
        color: fakeColors[3],
        categoryId: 'health',
        scheduleType: 'weekly',
        monthlyTypes: ['first'],
        monthlyDays: [],
        intervalWeeks: 1,
        sectionId: 'default'
      },
      // Completed/ended tasks
      {
        id: 1015,
        name: "Project Alpha",
        taskType: "time",
        plannedMinutes: 180,
        targetCount: null,
        selectedDays: [1, 2, 3, 4, 5], // Weekdays
        dailyProgress: {},
        excludedDates: [],
        oneOffDates: [],
        startDate: dateUtils.getDateString(new Date(sixMonthsAgo.getTime() + 30 * 24 * 60 * 60 * 1000)),
        endDate: dateUtils.getDateString(new Date(today.getTime() - 45 * 24 * 60 * 60 * 1000)),
        color: fakeColors[4],
        categoryId: 'work',
        scheduleType: 'weekly',
        monthlyTypes: ['first'],
        monthlyDays: [],
        intervalWeeks: 1,
        sectionId: 'work'
      },
      {
        id: 1016,
        name: "Holiday Preparation",
        taskType: "count",
        plannedMinutes: null,
        targetCount: 3,
        selectedDays: [6, 0], // Weekends
        dailyProgress: {},
        excludedDates: [],
        oneOffDates: [],
        startDate: dateUtils.getDateString(new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000)),
        endDate: dateUtils.getDateString(new Date(today.getTime() - 60 * 24 * 60 * 60 * 1000)),
        color: fakeColors[5],
        categoryId: 'personal',
        scheduleType: 'weekly',
        monthlyTypes: ['first'],
        monthlyDays: [],
        intervalWeeks: 1,
        sectionId: 'personal'
      },
      // More variety
      {
        id: 1017,
        name: "Social Media Check",
        taskType: "count",
        plannedMinutes: null,
        targetCount: 2,
        selectedDays: [1, 3, 5], // Mon, Wed, Fri
        dailyProgress: {},
        excludedDates: [],
        oneOffDates: [],
        startDate: dateUtils.getDateString(threeMonthsAgo),
        endDate: null,
        color: fakeColors[6],
        categoryId: 'personal',
        scheduleType: 'weekly',
        monthlyTypes: ['first'],
        monthlyDays: [],
        intervalWeeks: 1,
        sectionId: 'personal'
      },
      {
        id: 1018,
        name: "Network with Colleagues",
        taskType: "count",
        plannedMinutes: null,
        targetCount: 1,
        selectedDays: [5], // Friday
        dailyProgress: {},
        excludedDates: [],
        oneOffDates: [],
        startDate: dateUtils.getDateString(threeMonthsAgo),
        endDate: null,
        color: fakeColors[7],
        categoryId: 'work',
        scheduleType: 'weekly',
        monthlyTypes: ['first'],
        monthlyDays: [],
        intervalWeeks: 1,
        sectionId: 'work'
      }
    ];
  
    // Generate progress data for all tasks across 180+ days
    testTasks.forEach(task => {
      const startDate = new Date(task.startDate);
      const endDate = task.endDate ? new Date(task.endDate) : today;
      
      // Calculate how many days to generate data for
      const daysToGenerate = Math.min(
        Math.floor((endDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000)) + 1,
        200 // Cap at 200 days to avoid excessive data
      );
  
      for (let i = 0; i < daysToGenerate; i++) {
        const currentDate = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
        const dateString = dateUtils.getDateString(currentDate);
        const dayOfWeek = currentDate.getDay();
        
        // Skip if this date is excluded
        if (task.excludedDates.includes(dateString)) {
          continue;
        }
        
        // Check if task should be scheduled for this day
        let shouldHaveData = false;
        
        if (task.oneOffDates.includes(dateString)) {
          shouldHaveData = true;
        } else if (task.scheduleType === 'weekly') {
          shouldHaveData = task.selectedDays.includes(dayOfWeek);
        } else if (task.scheduleType === 'monthly') {
          // Simplified monthly logic - just check if it's the right day of week
          shouldHaveData = task.monthlyDays.includes(dayOfWeek) && 
                          Math.floor((currentDate.getDate() - 1) / 7) === 0; // First week
        } else if (task.scheduleType === 'interval') {
          const weeksSinceStart = Math.floor((currentDate.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
          shouldHaveData = (weeksSinceStart % task.intervalWeeks === 0) && 
                          task.selectedDays.includes(dayOfWeek);
        }
        
        if (!shouldHaveData) continue;
        
        // Generate realistic progress data with some variation
        const daysSinceStart = Math.floor((currentDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000));
        const progressTrend = Math.min(1, daysSinceStart / 60); // Improvement over 60 days
        
        // Vary completion rates based on day of week and task type
        let baseCompletionRate = 0.7;
        if (dayOfWeek === 0 || dayOfWeek === 6) baseCompletionRate = 0.6; // Weekends slightly lower
        if (dayOfWeek === 1) baseCompletionRate = 0.5; // Monday motivation dip
        
        // Add some realism - occasionally miss days entirely
        if (Math.random() < 0.15) continue; // 15% chance of missing a day
        
        const completionRate = Math.max(0, Math.min(1, 
          baseCompletionRate + 
          (progressTrend * 0.2) + 
          (Math.random() - 0.5) * 0.4
        ));
        
        if (task.taskType === 'time') {
          const timeSpent = Math.floor(task.plannedMinutes * 60 * completionRate);
          task.dailyProgress[dateString] = {
            timeSpent: timeSpent,
            isRunning: false,
            startTime: null
          };
        } else {
          // For count tasks, sometimes exceed the target
          const targetMultiplier = completionRate > 0.9 ? 1 + Math.random() * 0.3 : completionRate;
          const count = Math.floor(task.targetCount * targetMultiplier);
          task.dailyProgress[dateString] = {
            currentCount: Math.max(0, count),
            isRunning: false,
            startTime: null
          };
        }
      }
    });
  
    return testTasks;
  };

  export default generateTestData;