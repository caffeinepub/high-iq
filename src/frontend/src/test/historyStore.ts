import type { StoredTestResult } from './sessionTypes';

const STORAGE_KEY = 'highiq_test_history';

export function getTestHistory(principalId?: string): StoredTestResult[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    
    const allHistory = JSON.parse(stored) as Record<string, StoredTestResult[]>;
    const key = principalId || 'anonymous';
    return allHistory[key] || [];
  } catch (error) {
    console.error('Error reading test history:', error);
    return [];
  }
}

export function saveTestResult(result: StoredTestResult, principalId?: string): void {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const allHistory = stored ? JSON.parse(stored) : {};
    const key = principalId || 'anonymous';
    
    if (!allHistory[key]) {
      allHistory[key] = [];
    }
    
    allHistory[key].unshift(result);
    
    // Keep only last 50 results per user
    if (allHistory[key].length > 50) {
      allHistory[key] = allHistory[key].slice(0, 50);
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allHistory));
  } catch (error) {
    console.error('Error saving test result:', error);
  }
}

export function getTestResultById(id: string, principalId?: string): StoredTestResult | null {
  const history = getTestHistory(principalId);
  return history.find((result) => result.id === id) || null;
}
