// DEBUG COMPONENT: Add this to see what's happening with sections saving

import React from 'react';
import { useApp } from './AppProvider';
import { storageUtils } from '../utils';

export const SectionSaveDebugger = () => {
  const { 
    sections, 
    setSections, 
    updateSectionLayoutMode, 
    updateSectionColumnCount, 
    updateSectionShowBackground 
  } = useApp();

  const testDirectStateUpdate = () => {
    console.log('=== TESTING DIRECT STATE UPDATE ===');
    console.log('1. Current sections state:', sections);
    
    // Test direct state update
    const newSections = sections.map((section, index) => 
      index === 0 
        ? { ...section, layoutMode: 'compact', testProperty: Date.now() }
        : section
    );
    
    console.log('2. About to set new sections:', newSections);
    setSections(newSections);
    
    // Check localStorage after short delay
    setTimeout(() => {
      const stored = storageUtils.loadFromStorage('dailyGrind_sections', []);
      console.log('3. Sections in localStorage after update:', stored);
      console.log('4. Test property in stored sections:', stored[0]?.testProperty);
    }, 500);
  };

  const testLayoutFunctionExists = () => {
    console.log('=== CHECKING IF LAYOUT FUNCTIONS EXIST ===');
    console.log('updateSectionLayoutMode exists:', typeof updateSectionLayoutMode);
    console.log('updateSectionColumnCount exists:', typeof updateSectionColumnCount);
    console.log('updateSectionShowBackground exists:', typeof updateSectionShowBackground);
    
    if (updateSectionLayoutMode) {
      console.log('Testing updateSectionLayoutMode...');
      updateSectionLayoutMode(sections[0]?.id, 'minimal');
    } else {
      console.log('❌ updateSectionLayoutMode NOT FOUND in context');
    }
  };

  const checkLocalStorageDirect = () => {
    console.log('=== CHECKING LOCALSTORAGE DIRECTLY ===');
    
    // Check all localStorage keys related to the app
    Object.keys(localStorage).forEach(key => {
      if (key.includes('dailyGrind')) {
        console.log(`${key}:`, JSON.parse(localStorage.getItem(key)));
      }
    });
  };

  return (
    <div className="bg-orange-50 border border-orange-300 rounded-lg p-4 mb-4">
      <h4 className="font-bold text-orange-800 mb-3">🔧 Section Save Debugger</h4>
      
      <div className="space-y-3">
        <div className="text-sm">
          <strong>Current Sections Count:</strong> {sections.length}
          <br />
          <strong>First Section Layout Mode:</strong> {sections[0]?.layoutMode || 'undefined'}
        </div>

        <div className="flex gap-2 flex-wrap">
          <button
            onClick={testDirectStateUpdate}
            className="px-3 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 text-sm"
          >
            Test Direct State Update
          </button>
          
          <button
            onClick={testLayoutFunctionExists}
            className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
          >
            Test Layout Functions
          </button>
          
          <button
            onClick={checkLocalStorageDirect}
            className="px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
          >
            Check All localStorage
          </button>
          
          <button
            onClick={() => {
              // Manual save test
              console.log('Manual save test...');
              storageUtils.saveToStorage('test_key', { test: 'data', timestamp: Date.now() });
              console.log('Saved test data, checking:', storageUtils.loadFromStorage('test_key'));
            }}
            className="px-3 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 text-sm"
          >
            Test localStorage Works
          </button>
        </div>

        <div className="text-xs text-gray-600 mt-2">
          Check browser console for detailed debug output
        </div>
      </div>
    </div>
  );
};

export default SectionSaveDebugger;