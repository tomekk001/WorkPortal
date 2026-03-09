WorkPortal - Job Board System
Nowoczesny system ogłoszeń o pracę zbudowany w architekturze Fullstack (Decoupled). Projekt ma na celu umożliwienie kandydatom aplikowanie na oferty, a pracodawcom zarządzanie procesem rekrutacji.

🚀 Tech Stack
Frontend: React (Vite) + TypeScript + Tailwind CSS

Backend: NestJS + TypeScript

Database: PostgreSQL

ORM: Prisma

Infrastructure: Docker & Docker Compose

Validation: Zod

🏗️ Project Structure
/server - API serwerowe oparte o NestJS.

/client - Aplikacja kliencka (SPA) oparta o React.

docker-compose.yml - Konfiguracja kontenerów dla bazy danych.

🛠️ Getting Started
1. Prerequisites
Upewnij się, że masz zainstalowane:

Node.js (LTS)

Docker & Docker Compose

2. Environment Setup
W folderze /server utwórz plik .env (jeśli nie istnieje) i skonfiguruj połączenie z bazą:

Fragment kodu
DATABASE_URL="postgresql://admin:password123@localhost:5432/job_board?schema=public"
3. Database & Backend
Uruchom bazę danych i serwer:

Bash
# Uruchom bazę danych (w głównym folderze)
docker-compose up -d

# Przejdź do serwera i zainstaluj zależności
cd server
npm install

# Wykonaj migracje Prisma
npx prisma migrate dev --name init

# Uruchom backend w trybie dev
npm run start:dev
4. Frontend
Uruchom aplikację kliencką:

Bash
cd client
npm install
npm run dev
📈 Roadmap
[x] Initial project setup (Server & Client)

[x] Docker & PostgreSQL configuration

[x] Prisma integration

[ ] Next step: Full database schema implementation (Users, Jobs, Applications)

[ ] Authentication (JWT)

[ ] Employer & Candidate Dashboards