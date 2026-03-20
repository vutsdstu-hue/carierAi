import { Test, TestCategory } from "@/types";

export const testQuestions = {
  "js-basics": [
    {
      id: 1,
      question: "Что выведет следующий код?\n\nconsole.log(typeof null);",
      options: ["null", "undefined", "object", "boolean"],
      correctAnswer: 2,
      explanation: "typeof null возвращает 'object' - это известная особенность JavaScript."
    },
    {
      id: 2,
      question: "Какой результат выполнения?\n\nconsole.log(1 + '1');",
      options: ["2", "11", "'11'", "NaN"],
      correctAnswer: 2,
      explanation: "JavaScript приводит число к строке при конкатенации со строкой."
    },
    {
      id: 3,
      question: "Что такое замыкание (closure) в JavaScript?",
      options: [
        "Функция, которая имеет доступ к переменным внешней функции",
        "Способ объявления переменных",
        "Метод массива",
        "Синтаксис стрелочных функций"
      ],
      correctAnswer: 0,
      explanation: "Замыкание - это функция, которая имеет доступ к переменным из внешней области видимости даже после завершения выполнения внешней функции."
    }
  ],
  "react-advanced": [
    {
      id: 1,
      question: "Для чего используется useCallback hook?",
      options: [
        "Для кэширования значений",
        "Для мемоизации функций",
        "Для работы с состоянием",
        "Для side effects"
      ],
      correctAnswer: 1,
      explanation: "useCallback используется для мемоизации функций, чтобы избежать их пересоздания при каждом рендере."
    },
    {
      id: 2,
      question: "Когда компонент React перерендеривается?",
      options: [
        "Только при изменении props",
        "Только при изменении state",
        "При изменении props или state",
        "При каждом вызове функции"
      ],
      correctAnswer: 2,
      explanation: "Компонент перерендеривается при изменении props, state, или когда родительский компонент перерендеривается."
    }
  ],
  "python-backend": [
    {
      id: 1,
      question: "Что такое декоратор в Python?",
      options: [
        "Тип данных",
        "Функция, которая модифицирует поведение другой функции",
        "Библиотека",
        "Синтаксис циклов"
      ],
      correctAnswer: 1,
      explanation: "Декоратор - это функция, которая принимает другую функцию и расширяет её поведение без явного её изменения."
    }
  ]
};

export const tests: Test[] = [
  {
    id: "js-basics",
    title: "JavaScript Основы", 
    category: "Frontend",
    difficulty: "Начальный",
    questions: testQuestions["js-basics"],
    timeLimit: 20,
    description: "Базовые концепции JavaScript: типы данных, операторы, функции"
  },
  {
    id: "react-advanced",
    title: "React Advanced",
    category: "Frontend", 
    difficulty: "Продвинутый",
    questions: testQuestions["react-advanced"],
    timeLimit: 35,
    description: "Продвинутые паттерны React: hooks, оптимизация, архитектура"
  },
  {
    id: "python-backend",
    title: "Python для Backend",
    category: "Backend",
    difficulty: "Средний",
    questions: testQuestions["python-backend"],
    timeLimit: 25,
    description: "Backend разработка на Python: Django/FastAPI, базы данных, API"
  }
];

export const testCategories: TestCategory[] = [
  {
    id: "frontend",
    title: "Frontend разработка",
    icon: "Code",
    color: "from-blue-500 to-purple-600",
    description: "HTML, CSS, JavaScript, React, Vue, Angular",
    tests: tests.filter(t => t.category === "Frontend")
  },
  {
    id: "backend", 
    title: "Backend разработка",
    icon: "Server",
    color: "from-green-500 to-teal-600", 
    description: "Python, Java, Node.js, C#, PHP, Go",
    tests: tests.filter(t => t.category === "Backend")
  },
  {
    id: "database",
    title: "Базы данных",
    icon: "Database",
    color: "from-orange-500 to-red-600",
    description: "SQL, PostgreSQL, MongoDB, Redis", 
    tests: []
  },
  {
    id: "mobile",
    title: "Mobile разработка",
    icon: "Smartphone", 
    color: "from-purple-500 to-pink-600",
    description: "React Native, Flutter, iOS, Android",
    tests: []
  },
  {
    id: "devops",
    title: "DevOps",
    icon: "TrendingUp",
    color: "from-cyan-500 to-blue-600",
    description: "Docker, Kubernetes, AWS, CI/CD",
    tests: []
  },
  {
    id: "ml", 
    title: "Machine Learning",
    icon: "Brain",
    color: "from-indigo-500 to-purple-600",
    description: "Python, TensorFlow, PyTorch, Data Science",
    tests: []
  }
];