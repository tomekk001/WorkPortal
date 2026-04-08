import { PrismaClient, Role, ContractType, WorkMode } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Rozpoczynam seedowanie bazy danych...');

  // 1. Czyszczenie starych ofert (aby zapobiec duplikatom przy ponownym uruchomieniu)
  await prisma.jobOffer.deleteMany();
  
  // 2. Hashowanie hasła testowego
  const hashedPassword = await bcrypt.hash('haslo123', 10);

  // 3. Tworzenie konta Pracodawcy (używamy upsert, żeby nie wywaliło błędu, gdy odpalamy drugi raz)
  const employerUser = await prisma.user.upsert({
    where: { email: 'hr@techcorp.pl' },
    update: {},
    create: {
      email: 'hr@techcorp.pl',
      password: hashedPassword,
      role: Role.EMPLOYER,
      firstName: 'Anna',
      lastName: 'Nowak',
      companyProfile: {
        create: {
          companyName: 'TechCorp Sp. z o.o.',
          description: 'Lider innowacji na polskim rynku IT.',
          location: 'Warszawa',
        }
      }
    },
    include: { companyProfile: true } // Pobieramy ID profilu firmy
  });

  // 4. Tworzenie kategorii 'IT'
  const categoryIT = await prisma.category.upsert({
    where: { name: 'IT' },
    update: {},
    create: { name: 'IT' }
  });

  // 5. Dodawanie Ofert Pracy
  const companyId = employerUser.companyProfile?.id;

  if (companyId) {
    await prisma.jobOffer.createMany({
      data: [
        {
          title: 'Senior React Developer',
          description: 'Szukamy eksperta od React.js do naszego nowego projektu...',
          location: 'Warszawa',
          salaryMin: 18000,
          salaryMax: 25000,
          currency: 'PLN',
          contract: ContractType.B2B,
          workMode: WorkMode.REMOTE,
          isActive: true, // Ważne: oferta musi być aktywna, by Wyszukiwarka ją złapała
          validUntil: new Date(new Date().setMonth(new Date().getMonth() + 1)), // Ważne przez miesiąc
          companyId: companyId,
          categoryId: categoryIT.id,
        },
        {
          title: 'Junior Frontend Developer',
          description: 'Idealna praca na start. Wymagana znajomość HTML, CSS i podstaw JS.',
          location: 'Kraków',
          // Celowo brak salaryMin i salaryMax dla testów
          currency: 'PLN',
          contract: ContractType.UOP,
          workMode: WorkMode.HYBRID,
          isActive: true,
          validUntil: new Date(new Date().setMonth(new Date().getMonth() + 1)),
          companyId: companyId,
          categoryId: categoryIT.id,
        }
      ]
    });
    console.log('✅ Dodano testowe oferty pracy!');
  }

  console.log('🎉 Seedowanie zakończone sukcesem!');
}

main()
  .catch((e) => {
    console.error('❌ Błąd seedowania:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });