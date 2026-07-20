// Weryfikacja rzeczywistej zawartości pliku po sygnaturze bajtowej (magic bytes),
// bo `mimetype` zgłaszany przez multer pochodzi z nagłówka Content-Type ustawianego
// przez klienta i jest trywialny do podrobienia (np. plik .exe nazwany "cv.pdf"
// z ręcznie ustawionym Content-Type: application/pdf przejdzie fileFilter multera).
const SIGNATURES: Record<string, (buf: Buffer) => boolean> = {
  'application/pdf': buf => buf.subarray(0, 4).toString('latin1') === '%PDF',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': buf =>
    buf.subarray(0, 4).equals(Buffer.from([0x50, 0x4b, 0x03, 0x04])), // DOCX = ZIP
  'application/msword': buf =>
    buf.subarray(0, 8).equals(Buffer.from([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1])), // OLE
  'image/jpeg': buf => buf.subarray(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff])),
  'image/png': buf => buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])),
};

/** Sprawdza, czy zawartość bufora faktycznie odpowiada deklarowanemu mimetype. */
export function verifyFileSignature(buffer: Buffer, declaredMimetype: string): boolean {
  const check = SIGNATURES[declaredMimetype];
  if (!check) return true; // brak zdefiniowanej sygnatury dla tego typu — nie blokujemy
  return check(buffer);
}
