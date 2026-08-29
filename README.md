# Clarity

Personal diary, tasks, expenses & calendar — desktop and mobile.

## Stack

- **Backend:** Spring Boot 3.5.3 + Java 25 + PostgreSQL
- **Desktop:** Tauri 2 + React 19 + Vite 8 + Tailwind 4
- **Mobile:** React Native (Expo) — coming soon

## Setup

### 1. Backend

**Prerequisites:**
- Java 25
- PostgreSQL
- Maven

**Steps:**
```bash
cd backend

# Copy .env.example → .env and fill in your values
cp .env.example .env

# Create database
createdb clarity

# Run
mvn spring-boot:run
```

Backend runs at `http://localhost:8080`

### 2. Desktop

**Prerequisites:**
- Node.js 24+
- **Rust** (required for Tauri)

**Install Rust:**
```bash
# Windows (PowerShell)
winget install Rustlang.Rustup

# or download from https://rustup.rs
```

**Steps:**
```bash
cd desktop

# Install deps
npm install

# Dev mode (hot reload)
npm run dev

# Build production app
npm run tauri build
```

## Features

- ✅ Calendar (year/month/day views)
- ✅ Tasks with reminders
- ✅ Password-protected diary
- ✅ Expense tracking
- ✅ Projects
- ✅ Email reminders
- 🚧 Mobile app (coming soon)
- 🚧 AI features (stretch goal)

## API Endpoints

| Path | Method | What |
|---|---|---|
| `/api/auth/register` | POST | Sign up |
| `/api/auth/login` | POST | Login |
| `/api/tasks` | GET/POST/PUT/DELETE | To-dos |
| `/api/diary` | GET/PUT/DELETE | Diary (needs `X-Diary-Pin` header) |
| `/api/diary/pin` | POST | Set diary PIN |
| `/api/expenses` | GET/POST/DELETE | Expenses |
| `/api/expenses/summary` | GET | Monthly total |
| `/api/calendar` | GET/POST/PUT/DELETE | Calendar events |
| `/api/calendar/year/{year}` | GET | Year heatmap |
| `/api/projects` | GET/POST/PUT/DELETE | Projects |

## License

MIT — open source, use however you want.
