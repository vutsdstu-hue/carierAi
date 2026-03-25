# IT Career Hub (React + Vite + PostgreSQL + Prisma + JWT)

Этот проект состоит из двух частей:
- Frontend: React/Vite (корень репозитория)
- Backend: Node.js/Express + Prisma + PostgreSQL (папка `backend/`)

Frontend обращается к backend через прокси по пути `/api` (см. `vite.config.ts`).

## Что нужно заранее
1. Node.js (лучше текущий LTS), npm
2. PostgreSQL:
   - либо локально (pgAdmin)
   - либо через Docker (рекомендую, если Docker есть)

## Быстрый старт на другом ПК (рекомендованный вариант: Docker для Postgres)
### 1) Склонировать проект
```bash
git clone https://github.com/Samultra/aiCariers.git
cd aiCariers
```

### 2) Запустить PostgreSQL через Docker
В корне проекта:
```bash
docker-compose up -d
```

После этого Postgres будет слушать `localhost:5432`.
В `docker-compose.yml` заданы креды:
- user: `postgres`
- password: `postgres`
- db: `itcareerhub`

### 3) Настроить переменные окружения backend
```bash
cd backend
copy .env.example .env
```
Открой `backend/.env` и проверь/замени строку:
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/itcareerhub?schema=public
```

### 4) Установить зависимости backend и сделать миграции
```bash
npm i
npm run prisma:generate
npm run prisma:migrate
npm run seed
```

Что делает `seed`:
- создаёт первого пользователя с ролью `ADMIN` (если `SEED_ADMIN_EMAIL`/`SEED_ADMIN_PASSWORD` заданы)

### 5) Запустить backend
```bash
npm run dev
```
Backend будет доступен по:
- `http://localhost:3001/health`

### 6) Установить зависимости frontend и запустить
Открой новое окно терминала (или вернись в корень):
```bash
cd ..
npm i
npm run dev
```
Обычно frontend откроется на:
- `http://localhost:5173/`

## Вход по ролям
По умолчанию после `npm run seed` в базе будет админ:
- `SEED_ADMIN_EMAIL` (по `backend/.env.example` это `admin@example.com`)
- `SEED_ADMIN_PASSWORD` (по `backend/.env.example` это `change_me_strong_password`)

Модераторов/пользователей в таблицах автоматически `seed` НЕ создаёт.

## Запуск без Docker (Postgres локально через pgAdmin)
### 1) Создай БД и пользователя
В pgAdmin выполни запросы **по отдельности** (важно: `CREATE DATABASE` нельзя внутри одной транзакции):

```sql
-- role
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'itcareerhub_user') THEN
    CREATE ROLE itcareerhub_user LOGIN PASSWORD 'itcareerhub_dev_password';
  END IF;
END $$;
```

```sql
-- database (отдельно!)
CREATE DATABASE itcareerhub OWNER itcareerhub_user;
```

```sql
-- права (отдельно!)
GRANT ALL PRIVILEGES ON DATABASE itcareerhub TO itcareerhub_user;
ALTER ROLE itcareerhub_user CREATEDB;
```

### 2) Поставь `DATABASE_URL` в `backend/.env`
Строка должна соответствовать вашим кредам:
```env
DATABASE_URL=postgresql://itcareerhub_user:itcareerhub_dev_password@localhost:5432/itcareerhub?schema=public
```

### 3) Дальше как обычно
```bash
cd backend
npm i
npm run prisma:generate
npm run prisma:migrate
npm run seed
```

## Если миграции падают на shadow database
Сообщение вида “нет прав для создания базы данных” означает, что Prisma пытается создать shadow DB.
Решение: дай роли право `CREATEDB` (см. `ALTER ROLE ... CREATEDB;` в разделе выше) или используй superuser для `DATABASE_URL`.

## Примечание про API
В режиме dev frontend проксирует запросы на `/api` в `http://localhost:3001`.
Поэтому **backend должен быть доступен с того же ПК**, где запущен frontend (или нужно поменять конфигурацию прокси/URL).

