# 🧑‍💻 WorkPortal - Job Board System

Nowoczesny portal ogłoszeniowy łączący **Kandydatów z Pracodawcami**.  
Projekt realizowany w architekturze **Monorepo (Frontend + Backend)**.

---

# 🚀 Technologie

- 🎨 **Frontend:** `React` + `TypeScript` + `Vite` + `Tailwind CSS`
- ⚙️ **Backend:** `NestJS` + `TypeScript` + `Prisma ORM`
- 🗄 **Baza danych:** `PostgreSQL (Docker)`
- ✅ **Walidacja:** `Zod`

---

# 🛠 Wymagania (Prerequisites)

Przed uruchomieniem upewnij się, że masz zainstalowane:

- [Node.js](https://nodejs.org/) *(wersja LTS)*
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)

---

# ⚡ Szybki Start (Instalacja)

Wykonaj te kroki, aby uruchomić projekt od zera.

---

# 1️⃣ Baza Danych

Uruchom kontener z PostgreSQL w tle:

```bash
docker-compose up -d
```

---

# 2️⃣ Backend (Server)

Otwórz terminal w folderze **server**:

```bash
cd server
```

### 1. Instalacja zależności

```bash
npm install
```

### 2. Konfiguracja `.env`

Upewnij się, że masz w pliku `.env`:

```env
DATABASE_URL="postgresql://admin:password123@localhost:5432/job_board?schema=public"
```

### 3. Migracja bazy danych

Zapisanie schematu do PostgreSQL:

```bash
npx prisma migrate dev --name init
```

### 4. Uruchom serwer

```bash
npm run start:dev
```

Serwer wystartuje pod adresem:

```
http://localhost:3000
```

---

# 3️⃣ Frontend (Client)

Otwórz nowy terminal w folderze **client**:

```bash
cd client
```

### 1. Instalacja zależności

```bash
npm install
```

### 2. Uruchom aplikację

```bash
npm run dev
```

Aplikacja będzie dostępna pod adresem:

```
http://localhost:5173
```

---

# 📚 Ściąga z Komend (Cheatsheet)

### 🔄 Migracja bazy danych

Najważniejsza komenda – uruchamiaj po każdej zmianie w `schema.prisma`.

```bash
npx prisma migrate dev
```

---

### 🗄 Prisma Studio

Panel do podglądu i edycji danych w bazie:

```bash
npx prisma studio
```

---

### 🔧 Generowanie typów Prisma

Pomocne gdy IDE nie widzi zmian:

```bash
npx prisma generate
```

---

### 🌱 Seed danych

Wypełnia bazę przykładowymi danymi:

```bash
npx prisma db seed
```

---

# 🧾 Komendy NPM

| Komenda | Opis |
|--------|------|
| `npm run dev` | Uruchamia serwer deweloperski Vite |
| `npm run build` | Buduje wersję produkcyjną |
| `npm run preview` | Podgląd zbudowanej wersji produkcyjnej |
