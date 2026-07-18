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
npx prisma db seed
```

---

# 🧾 NPM Commands

| Command | Description |
|--------|------|
| `npm run dev` | Runs the Vite development server |
| `npm run build` | Builds the production version |
| `npm run preview` | Previews the built production version |

### Module I: For Candidates (Job Seekers)
- [ ] **1. Simple job search** - Allows searching listings by keyword (job title) and selecting a location from a dropdown (voivodeship or city). Based on simple database queries.
- [ ] **2. Search results filtering** - Lets users narrow down the list of offers using checkboxes: category (IT, Marketing, Construction), salary range (from-to), contract type (B2B/employment contract), and working time.
- [ ] **3. Registration and login (E-mail)** - Standard account creation system using an email address and password, with email verification via an activation link.
- [ ] **4. User profile with CV upload** - A form where the candidate fills in basic data (first name, last name, phone) and uploads a ready-made CV file (in PDF or DOC format) from their computer. The file is saved on the server.
- [ ] **5. Applying to an offer (Contact form)** - An "Apply" button on a listing that automatically sends the candidate's data and attached CV to the employer (as a message in the system or an email) and saves the application in the database.
- [ ] **6. Application history** - A simple table in the user panel showing the list of offers the user has already applied to, along with the application date.
- [ ] **7. Bookmarks (Favorite listings)** - The ability to "star" an offer. Such offers go to a separate "Saved" list, allowing the candidate to come back to them later.
- [ ] **8. Sorting offers** - The ability to change the order of the listing display: newest first, oldest first, highest salary, or alphabetically.
- [ ] **9. Reporting abuse** - A button on a listing allowing it to be reported to the administrator if it looks suspicious or contains errors (a simple form with a reason for the report).

### Module II: For Employers (Recruiters)
- [ ] **10. Employer panel** - A separate view after login for companies, allowing them to manage company data, add a logo, and edit the company description shown next to listings.
- [ ] **11. Adding a listing (Form)** - A simple wizard where the employer enters the title, listing content, selects a category from a list, enters the salary and the listing's validity period (e.g. 30 days).
- [ ] **12. List of received applications** - A tabular view for the employer for each active listing, showing the list of people who submitted a CV. Allows downloading the CV file to disk.
- [ ] **13. Changing candidate status** - The ability to mark a candidate on the list with a simple status: "New", "Rejected", "Invited for interview". This helps the employer keep the recruitment process organized.
- [ ] **14. Duplicating listings** - A "Post similar" feature that copies the content of a finished or existing listing into a new form, so the employer doesn't have to type everything from scratch.
- [ ] **15. Listing view counter** - A simple statistic that counts every visit to the listing page and shows the employer, in their panel, how many people have viewed their offer.
- [ ] **16. Editing and closing offers** - The ability to correct the listing content at any time or end recruitment early (hiding the offer from the main list).

### Module III: Admin Panel (Back-Office)
- [ ] **17. User management** - A list of all registered people and companies with the ability to block (ban) them, edit their data, or delete an account on request.
- [ ] **18. Listing moderation** - A list of new listings awaiting approval. The administrator must click "Approve" for the listing to appear publicly on the site (prevents spam).
- [ ] **19. Category management** - The ability to add, edit, and delete job categories (e.g. adding a new industry) without needing to modify the site's source code.
- [ ] **20. Manually featuring listings (Instead of online payment)** - The administrator has a "Featured" checkbox in their panel. They can check it manually, e.g. after receiving a traditional bank transfer from a company, which makes the listing appear at the top of the list or in a different color.
- [ ] **21. Managing informational pages (CMS)** - A simple editor allowing the administrator to change the content of subpages such as "Terms of Service", "About Us", "Privacy Policy".

### Module IV: General and Technical Features
- [ ] **22. Newsletter (Database signup)** - A form in the site footer where the user provides an email address. The address is saved to the database, allowing the administrator to export the list later and send a mailing manually.
- [ ] **23. Contact form** - A "Contact" page that allows sending a message directly to the site administrator (message saved in the database or sent to the admin's email).
- [ ] **24. Password reset** - A mechanism allowing the user to regain access to their account. The system generates a unique link (token) and sends it via email, allowing a new password to be set.
- [ ] **25. Responsiveness (RWD)** - Adapting the system's interface so it displays clearly on mobile devices (smartphones, tablets) and desktop computers (a requirement of modern systems).
