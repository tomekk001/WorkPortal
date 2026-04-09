import { PrismaClient, Role, ContractType, WorkMode } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Rozpoczynam głębokie seedowanie bazy danych...');

  await prisma.jobOffer.deleteMany();
  await prisma.category.deleteMany();
  await prisma.companyProfile.deleteMany();
  // Nie usuwamy użytkowników, jeśli chcesz zachować swoje konta, 
  // ale skrypt użyje upsert, więc duplikaty nie powstaną.

  const password = await bcrypt.hash('haslo123', 10);

  // 1. Kategorie
  const categoriesData = [
    { name: 'IT & Software' },
    { name: 'Marketing & PR' },
    { name: 'Sales & Biz Dev' },
    { name: 'Customer Service' },
    { name: 'Human Resources' },
    { name: 'Finance & Accounting' },
    { name: 'Design & Creative' },
  ];

  for (const cat of categoriesData) {
    await prisma.category.upsert({
      where: { name: cat.name },
      update: {},
      create: cat,
    });
  }
  const allCats = await prisma.category.findMany();

  // 2. Firmy i ich konta
  const companies = [
    { email: 'contact@tech-solutions.com', name: 'Tech Solutions', loc: 'Warszawa' },
    { email: 'jobs@creative-agency.pl', name: 'Creative Agency', loc: 'Kraków' },
    { email: 'hr@global-finance.com', name: 'Global Finance', loc: 'Wrocław' },
  ];

  for (const comp of companies) {
    await prisma.user.upsert({
      where: { email: comp.email },
      update: {},
      create: {
        email: comp.email,
        password,
        role: Role.EMPLOYER,
        companyProfile: {
          create: {
            companyName: comp.name,
            location: comp.loc,
            description: `Oficjalny profil firmy ${comp.name}.`,
          }
        }
      }
    });
  }

  const allCompanies = await prisma.companyProfile.findMany();

  // 3. Masowe ogłoszenia
  const offersData = [
    { title: 'Fullstack Developer', cat: 'IT & Software', comp: 'Tech Solutions', salMin: 15000, salMax: 22000, mode: WorkMode.REMOTE },
    { title: 'Social Media Manager', cat: 'Marketing & PR', comp: 'Creative Agency', salMin: 6000, salMax: 9000, mode: WorkMode.HYBRID },
    { title: 'Senior Accountant', cat: 'Finance & Accounting', comp: 'Global Finance', salMin: 12000, salMax: 16000, mode: WorkMode.ONSITE },
    { title: 'UX/UI Designer', cat: 'Design & Creative', comp: 'Creative Agency', salMin: 10000, salMax: 15000, mode: WorkMode.REMOTE },
    { title: 'Python Engineer', cat: 'IT & Software', comp: 'Tech Solutions', salMin: 18000, salMax: 26000, mode: WorkMode.REMOTE },
    { title: 'Key Account Manager', cat: 'Sales & Biz Dev', comp: 'Global Finance', salMin: 8000, salMax: 14000, mode: WorkMode.HYBRID },
    { title: 'Recruiter', cat: 'Human Resources', comp: 'Tech Solutions', salMin: 7000, salMax: 11000, mode: WorkMode.HYBRID },
  ];

  for (const o of offersData) {
    const category = allCats.find(c => c.name === o.cat);
    const company = allCompanies.find(c => c.companyName === o.comp);

    if (category && company) {
      await prisma.jobOffer.create({
        data: {
          title: o.title,
          description: `Dołącz do ${o.comp} na stanowisko ${o.title}. Szukamy osoby z pasją i doświadczeniem.`,
          location: company.location || 'Nieokreślona',
          salaryMin: o.salMin,
          salaryMax: o.salMax,
          currency: 'PLN',
          contract: ContractType.B2B,
          workMode: o.mode,
          isActive: true,
          validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          companyId: company.id,
          categoryId: category.id,
        }
      });
    }
  }

  console.log('🎉 Seedowanie zakończone! Baza wypełniona.');
}

main().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());