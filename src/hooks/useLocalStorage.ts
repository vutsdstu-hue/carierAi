import { useState, useEffect } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T) {
  // Get from local storage then parse stored json or return initialValue
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Return a wrapped version of useState's setter function that persists the new value to localStorage
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // Allow value to be a function so we have the same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue] as const;
}

// Specialized hooks for different data types
export function useUserData() {
  return useLocalStorage('user-data', {
    id: "user-1",
    name: "Анна Смирнова",
    email: "anna.smirnova@email.com",
    location: "Москва, Россия",
    joinDate: "Март 2024",
    avatar: "AS",
    position: "Frontend Developer",
    experience: "3 года",
    level: "Middle"
  });
}

export function useUserSkills() {
  return useLocalStorage('user-skills', [
    { name: "JavaScript", level: 85, category: "Frontend" },
    { name: "React", level: 90, category: "Frontend" },
    { name: "TypeScript", level: 75, category: "Frontend" },
    { name: "CSS/SCSS", level: 80, category: "Frontend" },
    { name: "Node.js", level: 60, category: "Backend" },
    { name: "Git", level: 85, category: "Tools" }
  ]);
}

export function useTestResults() {
  return useLocalStorage('test-results', [
    { testId: "react-advanced", testTitle: "Advanced React Patterns", score: 92, date: "20.03.2024", answers: [], timeSpent: 25 },
    { testId: "js-es6", testTitle: "JavaScript ES6+", score: 88, date: "18.03.2024", answers: [], timeSpent: 22 },
    { testId: "css-grid", testTitle: "CSS Grid & Flexbox", score: 95, date: "15.03.2024", answers: [], timeSpent: 18 }
  ]);
}

export function useJobApplications() {
  return useLocalStorage('job-applications', [
    { id: "1", jobId: "job-1", company: "TechCorp", position: "Senior Frontend Developer", status: "В процессе" as const, date: "22.03.2024" },
    { id: "2", jobId: "job-2", company: "StartupXYZ", position: "React Developer", status: "Отклик отправлен" as const, date: "20.03.2024" },
    { id: "3", jobId: "job-3", company: "DigitalAgency", position: "Frontend Lead", status: "Получен ответ" as const, date: "18.03.2024" }
  ]);
}