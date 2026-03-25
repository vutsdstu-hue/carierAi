import dotenv from "dotenv";
import { PrismaClient, Role } from "@prisma/client";
import bcryptjs from "bcryptjs";

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.SEED_ADMIN_EMAIL;
  const adminPassword = process.env.SEED_ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    console.log("Seed skipped: SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD are not set.");
    return;
  }

  const adminHash = await bcryptjs.hash(adminPassword, 12);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      passwordHash: adminHash,
      role: Role.ADMIN,
      name: "Администратор",
      location: "Москва",
      avatar: "—",
      position: "Администратор",
      experience: "5+ лет",
      level: "Senior",
      joinDate: new Date().toISOString().slice(0, 10),
    },
  });

  const moderatorPassword = "moderator_12345";
  const userPassword = "user_12345";
  const moderatorHash = await bcryptjs.hash(moderatorPassword, 12);
  const userHash = await bcryptjs.hash(userPassword, 12);

  const moderator = await prisma.user.upsert({
    where: { email: "moderator@example.com" },
    update: {},
    create: {
      email: "moderator@example.com",
      passwordHash: moderatorHash,
      role: Role.MODERATOR,
      name: "Модератор",
      location: "Санкт-Петербург",
      avatar: "—",
      position: "HR / Модератор",
      experience: "3 года",
      level: "Middle",
      joinDate: new Date().toISOString().slice(0, 10),
    },
  });

  const user = await prisma.user.upsert({
    where: { email: "user@example.com" },
    update: {},
    create: {
      email: "user@example.com",
      passwordHash: userHash,
      role: Role.USER,
      name: "Иван Петров",
      location: "Казань",
      avatar: "—",
      position: "Frontend Developer",
      experience: "1-3 года",
      level: "Junior",
      joinDate: new Date().toISOString().slice(0, 10),
    },
  });

  const jobs = [
    {
      id: "job-1",
      title: "Frontend React Developer",
      company: "TechCorp",
      location: "Москва",
      salary: "150 000 – 250 000 ₽",
      type: "Полная занятость",
      description:
        "Разработка современных веб‑приложений на React/TypeScript. Участие в проектировании UI, работа с API, оптимизация производительности.",
      skills: ["React", "TypeScript", "Redux", "CSS", "JavaScript"],
      postedTime: "2 дня назад",
      aiMatch: 95,
    },
    {
      id: "job-2",
      title: "Backend Node.js Developer",
      company: "DataFlow",
      location: "Санкт-Петербург",
      salary: "180 000 – 300 000 ₽",
      type: "Удаленно",
      description:
        "Разработка и поддержка API на Node.js/Express. Работа с PostgreSQL, оптимизация запросов, внедрение логирования и мониторинга.",
      skills: ["Node.js", "Express", "PostgreSQL", "Docker", "REST"],
      postedTime: "1 день назад",
      aiMatch: 87,
    },
    {
      id: "job-3",
      title: "DevOps Engineer",
      company: "CloudSystems",
      location: "Екатеринбург",
      salary: "200 000 – 350 000 ₽",
      type: "Гибрид",
      description:
        "Настройка CI/CD, контейнеризация, инфраструктура как код. Мониторинг, алёрты, логирование, работа с Kubernetes.",
      skills: ["Kubernetes", "Docker", "CI/CD", "Linux", "Terraform"],
      postedTime: "3 дня назад",
      aiMatch: 78,
    },
    {
      id: "job-4",
      title: "QA Automation Engineer",
      company: "QualityLab",
      location: "Новосибирск",
      salary: "140 000 – 220 000 ₽",
      type: "Полная занятость",
      description:
        "Автоматизация тестирования UI и API, поддержка пайплайна, анализ результатов прогона тестов, улучшение качества релизов.",
      skills: ["TypeScript", "Playwright", "API testing", "CI/CD", "Git"],
      postedTime: "5 дней назад",
      aiMatch: 72,
    },
    {
      id: "job-5",
      title: "Fullstack Developer",
      company: "StartupXYZ",
      location: "Удаленно",
      salary: "220 000 – 360 000 ₽",
      type: "Удаленно",
      description:
        "Fullstack разработка: фронт на React, бэк на Node.js. Работа в продуктовой команде, быстрые итерации, ответственность за фичи end‑to‑end.",
      skills: ["React", "Node.js", "TypeScript", "PostgreSQL", "Prisma"],
      postedTime: "1 неделю назад",
      aiMatch: 82,
    },
    {
      id: "job-6",
      title: "Data Analyst",
      company: "InsightAI",
      location: "Москва",
      salary: "160 000 – 260 000 ₽",
      type: "Гибрид",
      description:
        "Сбор и анализ данных, построение дашбордов, формирование метрик, A/B анализ. SQL + BI инструменты.",
      skills: ["SQL", "Power BI", "Python", "Статистика", "A/B тесты"],
      postedTime: "2 недели назад",
      aiMatch: 69,
    },
    {
      id: "job-7",
      title: "Mobile React Native Developer",
      company: "MobileFirst",
      location: "Казань",
      salary: "170 000 – 280 000 ₽",
      type: "Гибрид",
      description:
        "Разработка мобильного приложения на React Native, интеграция с REST API, оптимизация производительности, публикация релизов.",
      skills: ["React Native", "JavaScript", "TypeScript", "iOS", "Android"],
      postedTime: "4 дня назад",
      aiMatch: 76,
    },
    {
      id: "job-8",
      title: "Java Developer (Spring)",
      company: "Enterprise Solutions",
      location: "Нижний Новгород",
      salary: "190 000 – 320 000 ₽",
      type: "Полная занятость",
      description:
        "Разработка микросервисов на Spring Boot, интеграции, работа с очередями, сопровождение продакшена.",
      skills: ["Java", "Spring Boot", "PostgreSQL", "Kafka", "Docker"],
      postedTime: "6 дней назад",
      aiMatch: 65,
    },
    {
      id: "job-9",
      title: "UX/UI Designer",
      company: "DesignPro",
      location: "Удаленно",
      salary: "120 000 – 200 000 ₽",
      type: "Удаленно",
      description:
        "Проектирование интерфейсов, прототипирование, дизайн‑системы, работа с исследованием пользователей, handoff разработке.",
      skills: ["Figma", "UX", "UI", "Design System", "Исследования"],
      postedTime: "3 дня назад",
      aiMatch: 58,
    },
    {
      id: "job-10",
      title: "Product Manager",
      company: "FinTechNow",
      location: "Москва",
      salary: "250 000 – 450 000 ₽",
      type: "Полная занятость",
      description:
        "Ведение бэклога, гипотезы и эксперименты, коммуникация со стейкхолдерами, метрики и рост продукта.",
      skills: ["Product", "Аналитика", "Коммуникации", "SQL", "Roadmap"],
      postedTime: "2 дня назад",
      aiMatch: 61,
    },
  ];

  for (const j of jobs) {
    await prisma.job.upsert({
      where: { id: j.id },
      update: {},
      create: j as any,
    });
  }

  const tests = [
    {
      id: "js-basics",
      title: "JavaScript Основы",
      category: "Frontend",
      difficulty: "BEGINNER" as const,
      timeLimit: 20,
      description: "Базовые концепции JavaScript: типы данных, операторы, функции",
      questions: [
        {
          id: 1,
          question: "Что выведет `typeof null`?",
          options: ["null", "undefined", "object", "boolean"],
          correctAnswer: 2,
          explanation: "Это известная особенность JavaScript: typeof null === 'object'.",
        },
        {
          id: 2,
          question: "Какой результат `1 + '1'`?",
          options: ["2", "11", "NaN", "Ошибка"],
          correctAnswer: 1,
          explanation: "Происходит конкатенация со строкой.",
        },
      ],
    },
    {
      id: "react-hooks",
      title: "React Hooks",
      category: "Frontend",
      difficulty: "INTERMEDIATE" as const,
      timeLimit: 25,
      description: "useState/useEffect/useMemo/useCallback и типичные ошибки",
      questions: [
        {
          id: 1,
          question: "Для чего используется useCallback?",
          options: ["Кэшировать значения", "Мемоизировать функции", "Работать с ref", "Делать запросы"],
          correctAnswer: 1,
        },
        {
          id: 2,
          question: "Когда лучше использовать useMemo?",
          options: ["Всегда", "Когда вычисление дорогое", "Когда есть useEffect", "Никогда"],
          correctAnswer: 1,
        },
      ],
    },
    {
      id: "sql-basics",
      title: "SQL Основы",
      category: "Database",
      difficulty: "BEGINNER" as const,
      timeLimit: 20,
      description: "SELECT/JOIN/WHERE/GROUP BY и агрегаты",
      questions: [
        {
          id: 1,
          question: "Что делает INNER JOIN?",
          options: ["Берёт только совпадающие строки", "Берёт все строки слева", "Берёт все строки справа", "Удаляет строки"],
          correctAnswer: 0,
        },
      ],
    },
  ];

  for (const t of tests) {
    await prisma.testDefinition.upsert({
      where: { id: t.id },
      update: {},
      create: {
        id: t.id,
        title: t.title,
        category: t.category,
        difficulty: t.difficulty,
        timeLimit: t.timeLimit,
        description: t.description,
        questions: t.questions as any,
      },
    });
  }

  const app1 = await prisma.jobApplication.upsert({
    where: { userId_jobId: { userId: user.id, jobId: "job-1" } },
    update: { status: "В процессе", date: new Date().toLocaleDateString("ru-RU") },
    create: {
      userId: user.id,
      jobId: "job-1",
      company: "TechCorp",
      position: "Frontend React Developer",
      status: "В процессе",
      date: new Date().toLocaleDateString("ru-RU"),
    },
  });

  const app2 = await prisma.jobApplication.upsert({
    where: { userId_jobId: { userId: user.id, jobId: "job-2" } },
    update: { status: "Отклик отправлен", date: new Date().toLocaleDateString("ru-RU") },
    create: {
      userId: user.id,
      jobId: "job-2",
      company: "DataFlow",
      position: "Backend Node.js Developer",
      status: "Отклик отправлен",
      date: new Date().toLocaleDateString("ru-RU"),
    },
  });

  await prisma.jobApplicationLog.createMany({
    data: [
      {
        jobApplicationId: app1.id,
        jobId: app1.jobId,
        actorUserId: user.id,
        action: "CREATED",
        fromStatus: null,
        toStatus: app1.status,
        note: "Демо‑создание отклика пользователем",
      },
      {
        jobApplicationId: app1.id,
        jobId: app1.jobId,
        actorUserId: moderator.id,
        action: "STATUS_CHANGED",
        fromStatus: "Отклик отправлен",
        toStatus: "В процессе",
        note: "Демо‑смена статуса модератором",
      },
      {
        jobApplicationId: app2.id,
        jobId: app2.jobId,
        actorUserId: user.id,
        action: "CREATED",
        fromStatus: null,
        toStatus: app2.status,
        note: "Второй отклик (демо)",
      },
    ],
    skipDuplicates: true as any,
  } as any);

  await prisma.testResult.upsert({
    where: { userId_testId: { userId: user.id, testId: "js-basics" } },
    update: { score: 85, date: new Date().toLocaleDateString("ru-RU"), timeSpent: 18, answers: [2, 1] as any },
    create: {
      userId: user.id,
      testId: "js-basics",
      testTitle: "JavaScript Основы",
      score: 85,
      date: new Date().toLocaleDateString("ru-RU"),
      answers: [2, 1] as any,
      timeSpent: 18,
    },
  });

  console.log("Seed completed.");
  console.log(`Admin: ${adminEmail} / (password from .env)`);
  console.log(`Moderator: moderator@example.com / ${moderatorPassword}`);
  console.log(`User: user@example.com / ${userPassword}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

