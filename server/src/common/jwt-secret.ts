if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  throw new Error(
    'JWT_SECRET nie jest ustawiony (lub jest za krótki) w zmiennych środowiskowych. ' +
    'Ustaw silny, losowy sekret (min. 32 znaki) w server/.env — aplikacja nie uruchomi się bez niego.',
  );
}

export const JWT_SECRET = process.env.JWT_SECRET;
