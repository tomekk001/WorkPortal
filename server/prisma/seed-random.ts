import { PrismaClient, WorkMode, ApplicationStatus, ReportStatus, ContactStatus } from '@prisma/client';
import { fakerPL as faker } from '@faker-js/faker';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const CITIES = ['Warszawa', 'Kraków', 'Wrocław', 'Gdańsk', 'Poznań', 'Łódź', 'Katowice', 'Szczecin', 'Zdalnie'];
const CONTRACTS = ['UOP', 'UZ', 'B2B', 'UOP,B2B', 'UZ,B2B'];
const REPORT_REASONS = ['Podejrzana oferta', 'Fałszywe informacje', 'Nieodpowiednie treści', 'Duplikat ogłoszenia', 'Błędne dane kontaktowe', 'Inne'];
const START_DATES = ['immediately', '2weeks', '1month', '3months', 'more3months'];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickSome<T>(arr: T[], min: number, max: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.floor(Math.random() * (max - min + 1)) + min);
}

async function main() {
  console.log('🎲 Dosiewanie losowych danych (bez usuwania istniejących)...');
  const password = await bcrypt.hash('haslo123', 10);

  // 1. Losowi kandydaci
  const candidateCount = 20;
  const newCandidates: any[] = [];
  for (let i = 0; i < candidateCount; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const email = faker.internet.email({ firstName, lastName, provider: 'example.com' }).toLowerCase() + `.${i}`;
    const user = await prisma.user.create({
      data: {
        email,
        password,
        role: 'CANDIDATE',
        firstName,
        lastName,
        phone: faker.phone.number({ style: 'national' }),
        candidateProfile: { create: { bio: faker.person.jobTitle() } },
      },
    });
    newCandidates.push(user);
  }
  console.log(`✓ Dodano ${newCandidates.length} kandydatów`);

  // 2. Losowe firmy (pracodawcy)
  const employerCount = 10;
  const newCompanies: any[] = [];
  for (let i = 0; i < employerCount; i++) {
    const companyName = faker.company.name();
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const email = faker.internet.email({ firstName, lastName, provider: 'firma.pl' }).toLowerCase() + `.${i}`;
    const user = await prisma.user.create({
      data: {
        email,
        password,
        role: 'EMPLOYER',
        firstName,
        lastName,
        phone: faker.phone.number({ style: 'national' }),
        companyProfile: {
          create: {
            companyName,
            description: faker.company.catchPhrase() + '. ' + faker.company.buzzPhrase() + '.',
            website: faker.internet.url(),
            location: pick(CITIES),
          },
        },
      },
      include: { companyProfile: true },
    });
    if (user.companyProfile) newCompanies.push(user.companyProfile);
  }
  console.log(`✓ Dodano ${newCompanies.length} firm`);

  const allCompanies = await prisma.companyProfile.findMany();
  const allCategories = await prisma.category.findMany();

  // 3. Losowe oferty pracy
  const offerCount = 30;
  const newOffers: any[] = [];
  for (let i = 0; i < offerCount; i++) {
    const company = pick(allCompanies);
    const category = pick(allCategories);
    const salaryMin = faker.number.int({ min: 5, max: 20 }) * 1000;
    const salaryMax = salaryMin + faker.number.int({ min: 2, max: 10 }) * 1000;
    const isApproved = Math.random() > 0.15; // większość zatwierdzona, część czeka na moderację
    const isActive = Math.random() > 0.1;
    const offer = await prisma.jobOffer.create({
      data: {
        title: faker.person.jobTitle(),
        description: faker.lorem.paragraphs(3, '\n\n'),
        location: pick(CITIES),
        salaryMin,
        salaryMax,
        currency: 'PLN',
        contract: pick(CONTRACTS),
        workMode: pick([WorkMode.REMOTE, WorkMode.HYBRID, WorkMode.ONSITE]),
        isActive,
        isApproved,
        isPromoted: Math.random() > 0.85,
        views: faker.number.int({ min: 0, max: 500 }),
        validUntil: new Date(Date.now() + faker.number.int({ min: 5, max: 110 }) * 24 * 60 * 60 * 1000),
        companyId: company.id,
        categoryId: category.id,
      },
    });
    newOffers.push(offer);
  }
  console.log(`✓ Dodano ${newOffers.length} ofert pracy`);

  // 4. Losowe aplikacje (istniejący + nowi kandydaci na losowe oferty)
  const allCandidateUsers = await prisma.user.findMany({ where: { role: 'CANDIDATE' } });
  const allOffers = await prisma.jobOffer.findMany();
  let applicationsCreated = 0;
  for (const candidate of allCandidateUsers) {
    const offersToApply = pickSome(allOffers, 0, 4);
    for (const offer of offersToApply) {
      try {
        await prisma.application.create({
          data: {
            userId: candidate.id,
            jobOfferId: offer.id,
            status: pick([ApplicationStatus.NEW, ApplicationStatus.REVIEWING, ApplicationStatus.REJECTED, ApplicationStatus.HIRED]),
            startDate: pick(START_DATES),
            contractType: pick(CONTRACTS),
            expectedSalary: faker.number.int({ min: 5, max: 25 }) * 1000,
            coverMessage: faker.lorem.paragraph(),
          },
        });
        applicationsCreated++;
      } catch {
        // duplikat (unique userId+jobOfferId) — pomiń
      }
    }
  }
  console.log(`✓ Dodano ${applicationsCreated} aplikacji`);

  // 5. Zapisane oferty
  let savedCreated = 0;
  for (const candidate of allCandidateUsers) {
    const offersToSave = pickSome(allOffers, 0, 3);
    for (const offer of offersToSave) {
      try {
        await prisma.savedOffer.create({ data: { userId: candidate.id, jobOfferId: offer.id } });
        savedCreated++;
      } catch {
        // duplikat — pomiń
      }
    }
  }
  console.log(`✓ Dodano ${savedCreated} zapisanych ofert`);

  // 6. Zgłoszenia (reports)
  let reportsCreated = 0;
  const reportCandidates = pickSome(allCandidateUsers, 5, 8);
  for (const candidate of reportCandidates) {
    const offer = pick(allOffers);
    try {
      await prisma.report.create({
        data: {
          userId: candidate.id,
          jobOfferId: offer.id,
          reason: pick(REPORT_REASONS),
          description: Math.random() > 0.4 ? faker.lorem.sentence() : null,
          status: pick([ReportStatus.PENDING, ReportStatus.REVIEWED, ReportStatus.RESOLVED]),
        },
      });
      reportsCreated++;
    } catch {
      // duplikat — pomiń
    }
  }
  console.log(`✓ Dodano ${reportsCreated} zgłoszeń`);

  // 7. Konwersacje + wiadomości (na bazie kilku aplikacji)
  const sampleApplications = await prisma.application.findMany({
    take: 10,
    include: { jobOffer: { include: { company: { include: { user: true } } } }, user: true },
    orderBy: { id: 'desc' },
  });
  let conversationsCreated = 0;
  for (const app of sampleApplications) {
    const employerUser = app.jobOffer.company.user;
    if (!employerUser) continue;
    try {
      const conv = await prisma.conversation.create({
        data: {
          employerId: employerUser.id,
          candidateId: app.userId,
          applicationId: app.id,
        },
      });
      const messageCount = faker.number.int({ min: 1, max: 5 });
      for (let m = 0; m < messageCount; m++) {
        await prisma.message.create({
          data: {
            conversationId: conv.id,
            senderId: m % 2 === 0 ? employerUser.id : app.userId,
            content: faker.lorem.sentence(),
          },
        });
      }
      conversationsCreated++;
    } catch {
      // duplikat konwersacji — pomiń
    }
  }
  console.log(`✓ Dodano ${conversationsCreated} konwersacji z wiadomościami`);

  // 8. Newsletter
  let newsletterCreated = 0;
  for (let i = 0; i < 30; i++) {
    try {
      await prisma.newsletterSubscriber.create({ data: { email: faker.internet.email().toLowerCase() + `.n${i}` } });
      newsletterCreated++;
    } catch {
      // duplikat — pomiń
    }
  }
  console.log(`✓ Dodano ${newsletterCreated} subskrybentów newslettera`);

  // 9. Wiadomości kontaktowe
  const contactSubjects = ['Pytanie o współpracę', 'Problem z kontem', 'Sugestia do platformy', 'Reklamacja', 'Zapytanie o ofertę', 'Współpraca reklamowa'];
  for (let i = 0; i < 20; i++) {
    await prisma.contactMessage.create({
      data: {
        name: faker.person.fullName(),
        email: faker.internet.email().toLowerCase(),
        subject: pick(contactSubjects),
        message: faker.lorem.paragraph(),
        status: Math.random() > 0.5 ? ContactStatus.NEW : ContactStatus.READ,
      },
    });
  }
  console.log('✓ Dodano 20 wiadomości kontaktowych');

  console.log('🎉 Losowe dosiewanie zakończone!');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
