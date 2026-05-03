import { PrismaClient, Role, ContractType, WorkMode } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Rozpoczynam głębokie seedowanie bazy danych...');

  // Usuwamy w prawidłowej kolejności - od zależnych do niezależnych
  await prisma.application.deleteMany(); // Najpierw aplikacje
  await prisma.jobOffer.deleteMany();    // Potem oferty
  await prisma.category.deleteMany();    // Potem kategorie
  await prisma.companyProfile.deleteMany(); // Potem profile firm

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
    { name: 'Operations & Administration' },
    { name: 'Product Management' },
    { name: 'Data & Analytics' },
  ];

  for (const cat of categoriesData) {
    await prisma.category.upsert({
      where: { name: cat.name },
      update: {},
      create: cat,
    });
  }
  const allCats = await prisma.category.findMany();

  // 2. Firmy i ich konta - rozszerzenie
  const companies = [
    { email: 'contact@tech-solutions.com', name: 'Tech Solutions', loc: 'Warszawa' },
    { email: 'jobs@creative-agency.pl', name: 'Creative Agency', loc: 'Kraków' },
    { email: 'hr@global-finance.com', name: 'Global Finance', loc: 'Wrocław' },
    { email: 'careers@innovation-hub.com', name: 'Innovation Hub', loc: 'Poznań' },
    { email: 'jobs@digital-forge.pl', name: 'Digital Forge', loc: 'Gdańsk' },
    { email: 'hr@business-partners.com', name: 'Business Partners', loc: 'Łódź' },
    { email: 'careers@cloud-systems.com', name: 'Cloud Systems', loc: 'Warszawa' },
    { email: 'jobs@ecommerce-pro.pl', name: 'eCommerce Pro', loc: 'Kraków' },
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

  // 3. Masowe ogłoszenia - 30+ różnorodnych ofert
  const offersData = [
    // IT & Software (8 ofert)
    { title: 'Senior Fullstack Developer', cat: 'IT & Software', comp: 'Tech Solutions', salMin: 18000, salMax: 26000, mode: WorkMode.REMOTE, loc: 'Warszawa' },
    { title: 'Frontend Developer React', cat: 'IT & Software', comp: 'Creative Agency', salMin: 14000, salMax: 20000, mode: WorkMode.HYBRID, loc: 'Kraków' },
    { title: 'Backend Python Engineer', cat: 'IT & Software', comp: 'Tech Solutions', salMin: 16000, salMax: 24000, mode: WorkMode.REMOTE, loc: 'Warszawa' },
    { title: 'DevOps Engineer', cat: 'IT & Software', comp: 'Cloud Systems', salMin: 16000, salMax: 22000, mode: WorkMode.REMOTE, loc: 'Warszawa' },
    { title: 'Java Developer', cat: 'IT & Software', comp: 'Digital Forge', salMin: 15000, salMax: 21000, mode: WorkMode.HYBRID, loc: 'Gdańsk' },
    { title: 'QA Automation Tester', cat: 'IT & Software', comp: 'Tech Solutions', salMin: 12000, salMax: 17000, mode: WorkMode.ONSITE, loc: 'Warszawa' },
    { title: 'Mobile App Developer Flutter', cat: 'IT & Software', comp: 'Innovation Hub', salMin: 13000, salMax: 19000, mode: WorkMode.REMOTE, loc: 'Poznań' },
    { title: 'Database Administrator', cat: 'IT & Software', comp: 'Cloud Systems', salMin: 14000, salMax: 20000, mode: WorkMode.ONSITE, loc: 'Warszawa' },

    // Marketing & PR (5 ofert)
    { title: 'Social Media Manager', cat: 'Marketing & PR', comp: 'Creative Agency', salMin: 6000, salMax: 9000, mode: WorkMode.HYBRID, loc: 'Kraków' },
    { title: 'Content Marketing Specialist', cat: 'Marketing & PR', comp: 'eCommerce Pro', salMin: 7000, salMax: 10000, mode: WorkMode.REMOTE, loc: 'Kraków' },
    { title: 'SEO Specialist', cat: 'Marketing & PR', comp: 'Digital Forge', salMin: 8000, salMax: 12000, mode: WorkMode.REMOTE, loc: 'Gdańsk' },
    { title: 'Marketing Manager', cat: 'Marketing & PR', comp: 'Business Partners', salMin: 10000, salMax: 14000, mode: WorkMode.HYBRID, loc: 'Łódź' },
    { title: 'PR Specialist', cat: 'Marketing & PR', comp: 'Tech Solutions', salMin: 7500, salMax: 11000, mode: WorkMode.ONSITE, loc: 'Warszawa' },

    // Sales & Biz Dev (4 ofert)
    { title: 'Key Account Manager', cat: 'Sales & Biz Dev', comp: 'Global Finance', salMin: 10000, salMax: 16000, mode: WorkMode.HYBRID, loc: 'Wrocław' },
    { title: 'Sales Executive', cat: 'Sales & Biz Dev', comp: 'Business Partners', salMin: 8000, salMax: 13000, mode: WorkMode.ONSITE, loc: 'Łódź' },
    { title: 'Business Development Manager', cat: 'Sales & Biz Dev', comp: 'Innovation Hub', salMin: 12000, salMax: 18000, mode: WorkMode.REMOTE, loc: 'Poznań' },
    { title: 'Inside Sales Representative', cat: 'Sales & Biz Dev', comp: 'eCommerce Pro', salMin: 6000, salMax: 9500, mode: WorkMode.ONSITE, loc: 'Kraków' },

    // Customer Service (3 oferty)
    { title: 'Customer Support Specialist', cat: 'Customer Service', comp: 'Tech Solutions', salMin: 5000, salMax: 7500, mode: WorkMode.ONSITE, loc: 'Warszawa' },
    { title: 'Customer Success Manager', cat: 'Customer Service', comp: 'Cloud Systems', salMin: 8000, salMax: 12000, mode: WorkMode.HYBRID, loc: 'Warszawa' },
    { title: 'Support Team Lead', cat: 'Customer Service', comp: 'Digital Forge', salMin: 9000, salMax: 13000, mode: WorkMode.ONSITE, loc: 'Gdańsk' },

    // Human Resources (3 oferty)
    { title: 'HR Recruiter', cat: 'Human Resources', comp: 'Tech Solutions', salMin: 7000, salMax: 11000, mode: WorkMode.HYBRID, loc: 'Warszawa' },
    { title: 'HR Manager', cat: 'Human Resources', comp: 'Business Partners', salMin: 11000, salMax: 16000, mode: WorkMode.ONSITE, loc: 'Łódź' },
    { title: 'Technical Recruiter', cat: 'Human Resources', comp: 'Cloud Systems', salMin: 8000, salMax: 12000, mode: WorkMode.REMOTE, loc: 'Warszawa' },

    // Finance & Accounting (3 oferty)
    { title: 'Senior Accountant', cat: 'Finance & Accounting', comp: 'Global Finance', salMin: 12000, salMax: 18000, mode: WorkMode.ONSITE, loc: 'Wrocław' },
    { title: 'Finance Analyst', cat: 'Finance & Accounting', comp: 'Business Partners', salMin: 10000, salMax: 14000, mode: WorkMode.HYBRID, loc: 'Łódź' },
    { title: 'Financial Controller', cat: 'Finance & Accounting', comp: 'Global Finance', salMin: 16000, salMax: 22000, mode: WorkMode.ONSITE, loc: 'Wrocław' },

    // Design & Creative (3 oferty)
    { title: 'UX/UI Designer', cat: 'Design & Creative', comp: 'Creative Agency', salMin: 11000, salMax: 16000, mode: WorkMode.REMOTE, loc: 'Kraków' },
    { title: 'Graphic Designer', cat: 'Design & Creative', comp: 'Creative Agency', salMin: 8000, salMax: 12000, mode: WorkMode.HYBRID, loc: 'Kraków' },
    { title: 'Web Designer', cat: 'Design & Creative', comp: 'Digital Forge', salMin: 9000, salMax: 13000, mode: WorkMode.REMOTE, loc: 'Gdańsk' },

    // Operations & Administration (2 oferty)
    { title: 'Operations Manager', cat: 'Operations & Administration', comp: 'Tech Solutions', salMin: 10000, salMax: 14000, mode: WorkMode.ONSITE, loc: 'Warszawa' },
    { title: 'Administrative Assistant', cat: 'Operations & Administration', comp: 'Business Partners', salMin: 5500, salMax: 8000, mode: WorkMode.ONSITE, loc: 'Łódź' },

    // Product Management (2 oferty)
    { title: 'Product Manager', cat: 'Product Management', comp: 'Tech Solutions', salMin: 15000, salMax: 22000, mode: WorkMode.REMOTE, loc: 'Warszawa' },
    { title: 'Associate Product Manager', cat: 'Product Management', comp: 'eCommerce Pro', salMin: 10000, salMax: 14000, mode: WorkMode.HYBRID, loc: 'Kraków' },

    // Data & Analytics (3 oferty)
    { title: 'Data Analyst', cat: 'Data & Analytics', comp: 'Global Finance', salMin: 12000, salMax: 17000, mode: WorkMode.REMOTE, loc: 'Wrocław' },
    { title: 'Data Scientist', cat: 'Data & Analytics', comp: 'Cloud Systems', salMin: 16000, salMax: 24000, mode: WorkMode.REMOTE, loc: 'Warszawa' },
    { title: 'Business Intelligence Engineer', cat: 'Data & Analytics', comp: 'Business Partners', salMin: 13000, salMax: 19000, mode: WorkMode.HYBRID, loc: 'Łódź' },
  ];

  for (const o of offersData) {
    const category = allCats.find(c => c.name === o.cat);
    const company = allCompanies.find(c => c.companyName === o.comp);

    if (category && company) {
      await prisma.jobOffer.create({
        data: {
          title: o.title,
          description: `Dołącz do ${o.comp} na stanowisko ${o.title}. Szukamy ambitnej osoby z doświadczeniem w tej dziedzinie. Oferujemy konkurencyjne wynagrodzenie i możliwość rozwoju zawodowego.`,
          location: o.loc,
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

  console.log('🎉 Seedowanie zakończone! Baza wypełniona 36 ofertami pracy.');
}

main().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());