# Backend (PostgreSQL + Prisma + JWT)

## 1) Поднимите PostgreSQL

Нужно Postgres 14+ с БД (например) `itcareerhub`.

Если есть Docker, можно использовать файл `docker-compose.yml` в корне проекта (опционально).

## 2) Настройте переменные окружения

Скопируйте `backend/.env.example` в `backend/.env` и укажите:

- `DATABASE_URL` — строка подключения к вашей Postgres БД
- `JWT_SECRET` — секрет для JWT
- `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` — данные для первого админа

## 3) Миграции и seed

В папке `backend` выполните:

```bash
npm run prisma:generate
npm run prisma:migrate
npm run seed
```

После этого в БД появятся таблицы и первый пользователь с ролью `ADMIN`.

## 4) Запуск backend и фронтенда

```bash
# backend
npm run dev

# frontend (в корне проекта)
npm run dev
```

Фронтенд в dev режиме проксирует запросы на `/api` на backend.

