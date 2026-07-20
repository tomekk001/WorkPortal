# 🧑‍💻 WorkPortal - Job Board System

A modern job board connecting **Candidates with Employers**.
Built as a **Monorepo (Frontend + Backend)**.

---

# 🚀 Technologies

- 🎨 **Frontend:** `React` + `TypeScript` + `Vite` + `Tailwind CSS`
- ⚙️ **Backend:** `NestJS` + `TypeScript` + `Prisma ORM`
- 🗄 **Database:** `PostgreSQL (Docker)`
- ✅ **Validation:** `Zod`

---

# 🛠 Prerequisites

Before running the project, make sure you have installed:

- [Node.js](https://nodejs.org/) *(LTS version)*
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)

---

# ⚡ Quick Start (Installation)

Follow these steps to run the project from scratch.

---

# 1️⃣ Database

Start the PostgreSQL container in the background:

```bash
docker-compose up -d
```

---

# 2️⃣ Backend (Server)

Open a terminal in the **server** folder:

```bash
cd server
```

### 1. Install dependencies

```bash
npm install
```

### 2. Configure `.env`

Make sure your `.env` file contains:

```env
DATABASE_URL="postgresql://admin:password123@localhost:5432/job_board?schema=public"
```

### 3. Database migration

Push the schema to PostgreSQL:

```bash
npx prisma migrate dev --name init
```

### 4. Start the server

```bash
npm run start:dev
```

The server will start at:

```
http://localhost:3000
```

---

# 3️⃣ Frontend (Client)

Open a new terminal in the **client** folder:

```bash
cd client
```

### 1. Install dependencies

```bash
npm install
```

### 2. Start the application

```bash
npm run dev
```

The application will be available at:

```
http://localhost:5173
```

---

# 📚 Command Cheatsheet

### 🔄 Database migration

The most important command – run it after every change to `schema.prisma`.

```bash
npx prisma migrate dev
```

---

### 🗄 Prisma Studio

A panel for viewing and editing data in the database:

```bash
npx prisma studio
```

---

### 🔧 Generating Prisma types

Useful when your IDE doesn't pick up changes:

```bash
npx prisma generate
```

---

### 🌱 Data seeding

Fills the database with sample data:

```bash
npx ts-node prisma/seed-random.ts
```

---

# 🧾 NPM Commands

| Command | Description |
|--------|------|
| `npm run dev` | Runs the Vite development server |
| `npm run build` | Builds the production version |
| `npm run preview` | Previews the built production version |

### Moduł I: Dla Kandydata (Poszukującego pracy)
- [✔️] **1. Prosta wyszukiwarka ofert** - Umożliwia wyszukiwanie ogłoszeń po wpisaniu frazy (tytuł stanowiska) oraz wybraniu lokalizacji z listy rozwijanej (województwo lub miasto). Działa w oparciu o proste zapytania do bazy danych.
- [✔️] **2. Filtrowanie wyników wyszukiwania** - Pozwala zawęzić listę ofert za pomocą checkboxów: kategoria (IT, Marketing, Budownictwo), widełki wynagrodzenia (od-do), rodzaj umowy (B2B/UoP) oraz wymiar etatu.
- [✔️] **3. Rejestracja i logowanie (E-mail)** - Standardowy system zakładania konta przy użyciu adresu e-mail i hasła, z funkcją weryfikacji adresu poprzez kliknięcie w link aktywacyjny.
- [✔️] **4. Profil użytkownika z wgrywaniem CV** - Formularz, w którym kandydat uzupełnia podstawowe dane (imię, nazwisko, telefon) i wgrywa gotowy plik CV (w formacie PDF lub DOC) z dysku komputera. Plik jest zapisywany na serwerze.
- [✔️] **5. Aplikowanie na ofertę (Formularz kontaktowy)** - Przycisk "Aplikuj" przy ogłoszeniu, który automatycznie wysyła dane kandydata i załączone CV do pracodawcy (jako wiadomość w systemie lub e-mail) i zapisuje zgłoszenie w bazie danych.
- [✔️] **6. Historia aplikacji** - Prosta tabela w panelu użytkownika wyświetlająca listę ofert, na które użytkownik już aplikował, wraz z datą wysłania zgłoszenia.
- [✔️] **7. Schowek (Ulubione ogłoszenia)** - Możliwość oznaczenia oferty "gwiazdką". Takie oferty trafiają na osobną listę "Zapisane", co pozwala kandydatowi wrócić do nich później.
- [✔️] **8. Sortowanie ofert** - Możliwość zmiany kolejności wyświetlania listy ogłoszeń: od najnowszych, od najstarszych, po najwyższym wynagrodzeniu lub alfabetycznie.
- [✔️] **9. Zgłaszanie nadużyć (Raportowanie)** - Przycisk przy ogłoszeniu pozwalający zgłosić ofertę do administratora, jeśli wydaje się podejrzana lub zawiera błędy (prosty formularz z powodem zgłoszenia).

### Moduł II: Dla Pracodawcy (Rekrutera)
- [✔️] **10. Panel Pracodawcy** - Osobny widok po zalogowaniu dla firm, pozwalający zarządzać danymi firmy, dodawać logo oraz edytować opis działalności wyświetlany przy ofertach.
- [✔️] **11. Dodawanie ogłoszenia (Formularz)** - Prosty kreator, w którym pracodawca wpisuje tytuł, treść ogłoszenia, wybiera kategorię z listy, wpisuje wynagrodzenie i okres ważności ogłoszenia (np. 30 dni).
- [✔️] **12. Lista otrzymanych aplikacji** - Widok tabelaryczny dla pracodawcy przy każdym aktywnym ogłoszeniu, pokazujący listę osób, które przesłały CV. Umożliwia pobranie pliku CV na dysk.
- [✔️] **13. Zmiana statusu kandydata** - Możliwość oznaczenia kandydata na liście prostym statusem: "Nowy", "Odrzucony", "Zaproszony na rozmowę". Pozwala to pracodawcy utrzymać porządek w rekrutacji.
- [✔️] **14. Duplikowanie ogłoszeń** - Funkcja "Wystaw podobne", która kopiuje treść zakończonego lub istniejącego ogłoszenia do nowego formularza, aby pracodawca nie musiał wpisywać wszystkiego od nowa.
- [✔️] **15. Licznik wyświetleń oferty** - Prosta statystyka, która zlicza każde wejście na stronę ogłoszenia i pokazuje pracodawcy w panelu, ile osób zobaczyło jego ofertę.
- [✔️] **16. Edycja i zamykanie ofert** - Możliwość poprawienia treści ogłoszenia w dowolnym momencie lub wcześniejszego zakończenia rekrutacji (ukrycie oferty z listy głównej).

### Moduł III: Panel Administratora (Back-Office)
- [✔️] **17. Zarządzanie użytkownikami** - Lista wszystkich zarejestrowanych osób i firm z możliwością ich blokowania (banowania), edycji danych lub usuwania konta na żądanie.
- [✔️] **18. Moderacja ogłoszeń** - Lista nowych ogłoszeń oczekujących na akceptację. Administrator musi kliknąć "Zatwierdź", aby ogłoszenie pojawiło się publicznie na stronie (zapobiega spamowi).
- [✔️] **19. Zarządzanie kategoriami** - Możliwość dodawania, edycji i usuwania kategorii pracy (np. dodanie nowej branży) bez konieczności ingerencji w kod źródłowy strony.
- [✔️] **20. Ręczne wyróżnianie ofert (Zamiast płatności online)** - Administrator w swoim panelu ma checkbox "Wyróżniona". Może go zaznaczyć ręcznie, np. po otrzymaniu tradycyjnego przelewu od firmy, co sprawi, że oferta wyświetli się na górze listy lub w innym kolorze.
- [✔️] **21. Zarządzanie stronami informacyjnymi (CMS)** - Prosty edytor pozwalający administratorowi zmieniać treść podstron takich jak "Regulamin", "O nas", "Polityka Prywatności".

### Moduł IV: Funkcje Ogólne i Techniczne
- [✔️] **22. Newsletter (Zapis do bazy)** - Formularz w stopce strony, gdzie użytkownik podaje e-mail. Adres trafia do bazy danych, co pozwala administratorowi w przyszłości wyeksportować listę i wysłać mailing ręcznie.
- [✔️] **23. Formularz kontaktowy** - Strona "Kontakt", która umożliwia wysłanie wiadomości bezpośrednio do administratora serwisu (wiadomość zapisywana w bazie lub wysyłana na e-mail admina).
- [✔️] **24. Resetowanie hasła** - Mechanizm pozwalający użytkownikowi odzyskać dostęp do konta. System generuje unikalny link (token) i wysyła go na e-mail, umożliwiając ustawienie nowego hasła.
- [✔️] **25. Responsywność (RWD)** - Dostosowanie interfejsu systemu tak, aby czytelnie wyświetlał się na urządzeniach mobilnych (smartfony, tablety) oraz komputerach stacjonarnych (wymóg współczesnych systemów).
- [✔️] **26. Weryfikacja NIP pracodawcy** - Rejestracja firmy wymaga podania numeru NIP, sprawdzanego na żywo w Wykazie Podatników VAT Ministerstwa Finansów, oraz osobnego adresu e-mail firmowego.
