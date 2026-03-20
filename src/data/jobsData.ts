import { Job } from "@/types";

export const jobsDatabase: Job[] = [
  {
    id: "job-1",
    title: "Frontend React Developer",
    company: "TechCorp",
    location: "Москва", 
    salary: "150,000 - 250,000 ₽",
    type: "Полная занятость",
    description: "Разработка современных веб-приложений на React, TypeScript. Работа в команде с опытными разработчиками. Участие в проектировании архитектуры фронтенда.",
    skills: ["React", "TypeScript", "Redux", "CSS", "JavaScript"],
    postedTime: "2 дня назад",
    aiMatch: 95
  },
  {
    id: "job-2", 
    title: "Backend Python Developer",
    company: "DataFlow",
    location: "Санкт-Петербург",
    salary: "180,000 - 300,000 ₽", 
    type: "Удаленно",
    description: "Создание и поддержка высоконагруженных API, работа с большими данными и машинным обучением. Разработка микросервисов.",
    skills: ["Python", "Django", "PostgreSQL", "Docker", "Redis"],
    postedTime: "1 день назад",
    aiMatch: 87
  },
  {
    id: "job-3",
    title: "DevOps Engineer", 
    company: "CloudSystems",
    location: "Екатеринбург",
    salary: "200,000 - 350,000 ₽",
    type: "Гибрид",
    description: "Автоматизация процессов разработки, настройка CI/CD, работа с облачными платформами. Мониторинг и логирование.",
    skills: ["Kubernetes", "AWS", "Docker", "Jenkins", "Terraform"],
    postedTime: "3 дня назад",
    aiMatch: 78
  },
  {
    id: "job-4",
    title: "Fullstack JavaScript Developer",
    company: "StartupXYZ", 
    location: "Москва",
    salary: "120,000 - 200,000 ₽",
    type: "Полная занятость",
    description: "Разработка полного цикла веб-приложений. Frontend на React, backend на Node.js. Работа в стартап-среде.",
    skills: ["JavaScript", "React", "Node.js", "MongoDB", "Express"],
    postedTime: "4 дня назад",
    aiMatch: 82
  },
  {
    id: "job-5",
    title: "Senior Frontend Developer",
    company: "DigitalAgency",
    location: "Удаленно",
    salary: "250,000 - 400,000 ₽",
    type: "Удаленно", 
    description: "Лидерство фронтенд-команды, архитектурные решения, менторинг junior разработчиков. Работа с крупными корпоративными клиентами.",
    skills: ["React", "TypeScript", "Next.js", "GraphQL", "Leadership"],
    postedTime: "5 дней назад",
    aiMatch: 91
  },
  {
    id: "job-6",
    title: "Mobile React Native Developer",
    company: "MobileFirst",
    location: "Новосибирск",
    salary: "160,000 - 280,000 ₽", 
    type: "Гибрид",
    description: "Разработка кроссплатформенных мобильных приложений. Интеграция с нативными модулями, оптимизация производительности.",
    skills: ["React Native", "JavaScript", "iOS", "Android", "Redux"],
    postedTime: "1 неделю назад",
    aiMatch: 76
  },
  {
    id: "job-7",
    title: "Backend Java Developer",
    company: "Enterprise Solutions",
    location: "Казань",
    salary: "170,000 - 320,000 ₽",
    type: "Полная занятость",
    description: "Разработка корпоративных систем на Java Spring. Работа с микросервисной архитектурой, интеграция с legacy системами.",
    skills: ["Java", "Spring", "PostgreSQL", "Kafka", "Microservices"],
    postedTime: "1 неделю назад", 
    aiMatch: 65
  }
];

export const popularSkills = [
  "JavaScript", "Python", "React", "Docker", "AWS", "Node.js", 
  "PostgreSQL", "TypeScript", "Kubernetes", "Java", "CSS", "Git"
];

export const cities = [
  "Москва", "Санкт-Петербург", "Новосибирск", "Екатеринбург", 
  "Казань", "Нижний Новгород", "Самара", "Удаленно"
];

export const experienceLevels = [
  "Без опыта", "1-3 года", "3-6 лет", "Более 6 лет"
];