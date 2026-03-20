// User types
export interface User {
  id: string;
  name: string;
  email: string;
  location: string;
  joinDate: string;
  avatar: string;
  position: string;
  experience: string;
  level: string;
}

// Skills and competencies
export interface Skill {
  name: string;
  level: number;
  category: string;
}

// Test types
export interface TestQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

export interface Test {
  id: string;
  title: string;
  category: string;
  difficulty: 'Начальный' | 'Средний' | 'Продвинутый' | 'Эксперт';
  questions: TestQuestion[];
  timeLimit: number; // in minutes
  description: string;
}

export interface TestResult {
  testId: string;
  testTitle: string;
  score: number;
  date: string;
  answers: number[];
  timeSpent: number;
}

export interface TestCategory {
  id: string;
  title: string;
  icon: string;
  color: string;
  description: string;
  tests: Test[];
}

// Job types
export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  type: string;
  description: string;
  skills: string[];
  postedTime: string;
  aiMatch?: number;
}

export interface JobFilter {
  query: string;
  location: string;
  experience: string;
  skills: string[];
  salary: {
    min: number;
    max: number;
  };
}

// Achievement types
export interface Achievement {
  name: string;
  description: string;
  icon: string;
  date: string;
  type: 'test' | 'skill' | 'general';
}

// Application types
export interface JobApplication {
  id: string;
  jobId: string;
  company: string;
  position: string;
  status: 'Отклик отправлен' | 'В процессе' | 'Получен ответ' | 'Отклонен';
  date: string;
}