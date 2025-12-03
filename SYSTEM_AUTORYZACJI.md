# Dokumentacja Systemu Rejestracji, Weryfikacji, Logowania i Autoryzacji SMS

## 🧠 Rationale i Strategia Implementacji

System rejestracji, weryfikacji, logowania i autoryzacji SMS w aplikacji Pałka MTM został zaprojektowany jako **produkcyjny, bezpieczny i skalowalny** mechanizm oparty na Firebase Auth z 3-poziomową weryfikacją użytkowników. Architektura dzieli się na warstwy: **klient (React/Next.js)**, **middleware (Next.js)**, **API routes (Next.js)** i **baza danych (Prisma/PostgreSQL)**. Kluczowe założenia to:

- **Bezpieczeństwo**: Firebase Admin SDK weryfikuje tokeny po stronie serwera, nigdy nie ufając klientowi
- **Skalowalność**: Redis caching dla często odpytywanych danych, middleware dla lekkich sprawdzeń UX
- **Obserwowalność**: Sentry dla błędów, Prometheus dla metryk, Winston dla logów
- **WCAG 2.1 AA**: Pełna dostępność komponentów UI/UX
- **Clean Architecture**: Separacja odpowiedzialności między warstwami

System wykorzystuje **Kluczowe Technologie** z PROD-READY STACK: Firebase Auth, Prisma ORM, Next.js 14 App Router, TypeScript Strict Mode, oraz wzorce takie jak `withRedisCache` dla optymalizacji.

## 💾 Kod Produkcyjny

### Schemat Bazy Danych (Prisma)

```prisma
model User {
  id                          String             @id @default(cuid())
  firebaseUid                 String   @unique
  firstName                   String?
  lastName                    String?
  email                       String             @unique
  emailVerified               DateTime?
  image                       String?
  role                        Role               @default(USER_REGISTERED)
  isActive                    Boolean            @default(false)
  activationToken             String?
  address                     String?
  city                        String?
  postalCode                  String?
  phoneNumber                 String?
  isPhoneVerified             Boolean            @default(false)
  phoneVerificationCode       String?
  phoneVerificationExpires    DateTime?
  isProfileVerified           Boolean            @default(false)
  twoFactorSecret             String?
  backupCodes                 String?
  is2FAEnabled                Boolean            @default(false)
  createdAt                   DateTime           @default(now())
  updatedAt                   DateTime           @updatedAt
  
  // Relacje...
  
  @@index([email])
  @@index([role])
  @@index([isActive])
  @@index([isPhoneVerified])
  @@index([isProfileVerified])
  @@index([createdAt])
}

enum Role {
  USER_REGISTERED
  USER_EMAIL_VERIFIED
  USER_FULL_VERIFIED
  ADMIN
}
```

### Kluczowe Funkcje Autoryzacji

```typescript
// contexts/AuthContext.tsx - Główny kontekst stanu użytkownika
interface AuthContextType {
  user: User | null;           // Firebase User
  dbUser: DbUser | null;       // Prisma User z bazy
  loading: boolean;
  error: string | null;
  signOut: () => Promise<void>;
  refetchDbUser: () => Promise<void>;
  clearError: () => void;
}

// lib/auth-middleware.ts - Middleware dla API routes
export async function requireEmailVerification(request: NextRequest) {
  // Wymaga roli USER_EMAIL_VERIFIED lub wyższej
}

export async function requireFullVerification(request: NextRequest) {
  // Wymaga roli USER_FULL_VERIFIED lub wyższej
}

export async function requirePhoneVerification(request: NextRequest) {
  // Wymaga zweryfikowanego telefonu
}

// lib/firebase-auth.ts - Weryfikacja Firebase tokenów
export async function requireFirebaseAuth(request: NextRequest) {
  const decodedToken = await verifyFirebaseToken(request);
  if (!decodedToken) {
    return NextResponse.json({ error: 'Nieautoryzowany dostęp' }, { status: 401 });
  }
  return { decodedToken };
}

// lib/admin-auth.ts - Autoryzacja administratorów
export async function requireAdminAuth(request: NextRequest) {
  // Sprawdza rolę ADMIN w bazie danych
}
```

### Flow Rejestracji i Weryfikacji

```typescript
// app/auth/register/page.tsx - Strona rejestracji
// Używa AuthFlipCard z Auth3DForm dla interaktywnego UI

// app/auth/verify-email/page.tsx - Weryfikacja email
// Obsługuje oobCode z Firebase, automatyczne logowanie

// app/auth/verify-phone/page.tsx - Weryfikacja telefonu
// Wysyła SMS przez Firebase Phone Auth, weryfikuje kod

// app/api/auth/sync/route.ts - Synchronizacja Firebase ↔ Prisma
export async function POST(req: NextRequest) {
  const { decodedToken } = await requireFirebaseAuth(req);
  // Synchronizuje dane między Firebase a bazą danych
  // Aktualizuje role na podstawie weryfikacji
}

// app/api/phone/send-verification/route.ts - Wysyłanie SMS
export async function POST(request: NextRequest) {
  // Aktualizuje numer telefonu w profilu
  // Przygotowuje do weryfikacji przez Firebase Phone Auth
}

// app/api/phone/check-verification/route.ts - Weryfikacja kodu SMS
export async function POST(request: NextRequest) {
  // Zapisuje status weryfikacji po stronie klienta
}
```

### Walidacja Telefonów

```typescript
// lib/phone-validation.ts - Walidacja międzynarodowa
export function validatePhoneNumber(
  phoneNumber: string,
  countryCode: string = 'PL'
): PhoneValidationResult {
  // Obsługuje formaty polskie i międzynarodowe
  // +48 123 456 789, 48123456789, itp.
}
```

## 🛠️ Instrukcje Implementacji

### 1. Konfiguracja Firebase
- Utwórz projekt w Firebase Console
- Włącz Authentication (Email/Password, Google, Phone)
- Skonfiguruj Firestore Rules i Storage Rules
- Pobierz `firebase-key.json` dla Admin SDK
- Ustaw zmienne środowiskowe w `.env.local`:
  ```
  NEXT_PUBLIC_FIREBASE_API_KEY=...
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
  NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
  FIREBASE_CLIENT_EMAIL=...
  FIREBASE_PRIVATE_KEY=...
  ```

### 2. Migracje Bazy Danych
```bash
npx prisma migrate dev
npx prisma generate
```

### 3. Uruchomienie Aplikacji
```bash
npm install
npm run dev:windows  # Windows-specific dla file watching
```

### 4. Testowanie
- **E2E**: `npx playwright test e2e/auth.e2e.spec.ts`
- **Unit**: `npm test`
- **Ręczne**: Przejdź przez flow rejestracji → weryfikacja email → uzupełnienie profilu → weryfikacja telefonu

### 5. Monitoring
- **Sentry**: Błędy automatycznie logowane w `sentry.server.config.ts`
- **Prometheus**: Metryki pod `/api/metrics`
- **Logi**: Sprawdzaj `logs/app.log`

## 📊 Wpływ na System i Kolejne Kroki

System rejestracji i autoryzacji stanowi **fundament bezpieczeństwa** całej platformy Pałka MTM, umożliwiając bezpieczne transakcje aukcyjne i ochronę przed oszustwami. Implementacja **eliminuje duplikację kodu** między komponentami autoryzacji, wprowadzając standaryzowane middleware i konteksty.

**Wpływ na PLAN NAPRAWY:**
- ✅ **Zrealizowane**: 3-poziomowa weryfikacja użytkowników
- ✅ **Zrealizowane**: Integracja Firebase Auth z Prisma
- 🚧 **W trakcie**: Admin API (30+ endpointów) - patrz `ADMIN_UPRAWNIENIA.md`
- 🔄 **Następne**: Implementacja reCAPTCHA dla publicznych formularzy (PRIORYTET 2) - patrz `INSTRUKCJA_RECAPTCHA.md`

**Kolejne Kroki:**
1. **Testy E2E**: Dodać pełne scenariusze weryfikacji w `e2e/auth.e2e.spec.ts`
2. **Monitoring**: Dodać metryki Prometheus dla rate limiting i autoryzacji
3. **reCAPTCHA**: Zaimplementować dla rejestracji i resetowania hasła
4. **Audit Logging**: Rozszerzyć logowanie dla operacji administratora
5. **2FA**: Dodać opcjonalne uwierzytelnianie dwuskładnikowe

System jest **produkcyjny i bezpieczny**, gotowy do obsługi tysięcy użytkowników z pełną obserwowalnością i skalowalnością.

## 👥 Flow Rejestracji i Weryfikacji - Po Polsku, Potocznie

Wyobraź sobie, że jesteś nowym użytkownikiem platformy aukcyjnej dla hodowców gołębi. Co się dzieje krok po kroku? Opiszę to tak, jakbyśmy siedzieli przy kawie i rozmawiali.

### 1. **Rejestracja - Pierwszy Kontakt**
- Wchodzisz na stronę `/auth/register` - tam jest taki fajny, interaktywny formularz z kostką 3D, która się obraca (to `AuthFlipCard` z `Auth3DForm`).
- Wpisujesz email i hasło (albo logujesz się przez Google jednym kliknięciem).
- Jeśli rejestrujesz się pierwszy raz, aplikacja tworzy konto w Firebase (to taki bezpieczny system Google'a do logowania) i od razu wysyła email weryfikacyjny.
- **Po samej rejestracji nie masz dostępu do niczego - tylko jesteś zalogowany, nic więcej.**
- W tym momencie masz **poziom dostępu 1** - jesteś zarejestrowany, ale jeszcze nic nie możesz robić.

### 2. **Weryfikacja Emaila - Potwierdzenie, Że Jesteś Sobą**
- Otrzymujesz email od Firebase z linkiem do weryfikacji.
- Klikasz w link - prowadzi do strony `/auth/verify-email`.
- Aplikacja sprawdza kod w linku (`oobCode`), potwierdza email w Firebase i automatycznie Cię loguje.
- **Po weryfikacji emaila dostajesz dostęp do panelu użytkownika (`/profile`), gdzie możesz uzupełnić swoje dane: telefon, adresowe, ustawienia aukcji itd.**
- Teraz masz **poziom dostępu 2** - możesz wejść do panelu użytkownika (`/profile`), zobaczyć swoje dane, ale jeszcze nie możesz tworzyć aukcji ani licytować.
- System zapisuje w bazie danych, że email jest zweryfikowany, i ustawia ciasteczka `level2-ok=1`.

### 3. **Uzupełnienie Profilu - Trochę Szczegółów o Tobie**
- Po weryfikacji emaila, aplikacja Cię przekierowuje do `/profile`.
- Musisz wypełnić podstawowe dane: imię, nazwisko, adres, miasto, kod pocztowy, numer telefonu.
- To jest ważne, bo bez kompletnego profilu nie przejdziesz dalej.
- System sprawdza, czy wszystkie pola są wypełnione - to jest `isProfileVerified`.

### 4. **Weryfikacja Telefonu - SMS do Potwierdzenia**
- Teraz przechodzisz do `/auth/verify-phone`.
- Wpisujesz swój numer telefonu (aplikacja sprawdza format - polskie numery jak +48 123 456 789, albo międzynarodowe).
- Klikasz "Wyślij kod" - Firebase wysyła SMS z 6-cyfrowym kodem na Twój telefon.
- Wpisujesz kod z SMS-a i potwierdzasz.
- Aplikacja zapisuje w bazie, że telefon jest zweryfikowany (`isPhoneVerified: true`).
- Teraz masz **poziom dostępu 3** - pełny dostęp! Możesz tworzyć aukcje, licytować, dodawać treści, wszystko.

### 5. **Logowanie - Jak Wracasz Następnym Razem**
- Jeśli masz już konto, wchodzisz na `/auth/login`.
- Wpisujesz email i hasło, albo klikasz Google.
- Jeśli email nie był zweryfikowany, system znowu wyśle link weryfikacyjny.
- Po zalogowaniu, aplikacja synchronizuje dane między Firebase a naszą bazą danych przez `/api/auth/sync`.
- Ustawia ciasteczka dostępu i przekierowuje Cię tam, gdzie chciałeś iść.

### 6. **Poziomy Dostępu - Co Możesz Robić na Każdym Etapie**
- **Poziom 1 (USER_REGISTERED)**: Tylko logowanie, nic więcej. Jesteś w systemie, ale nieaktywny.
- **Poziom 2 (USER_EMAIL_VERIFIED)**: Możesz wejść do profilu, zobaczyć dashboard, ale nie możesz tworzyć aukcji ani licytować.
- **Poziom 3 (USER_FULL_VERIFIED)**: Pełny dostęp - aukcje, licytacje, referencje, spotkania hodowców, wszystko.
- **ADMIN**: Jeśli jesteś administratorem, masz dostęp do wszystkiego, włącznie z panelem admina.

### 7. **Bezpieczeństwo i Jak To Wszystko Działa**
- Cały czas aplikacja sprawdza, czy jesteś tym, za kogo się podajesz - przez tokeny Firebase.
- Middleware (to taki strażnik na wejściu) sprawdza ciasteczka i przekierowuje Cię, jeśli nie masz odpowiedniego poziomu.
- API routes używają funkcji jak `requireEmailVerification()` czy `requireFullVerification()` - jeśli nie masz dostępu, dostajesz błąd 403.
- Wszystko jest logowane w Sentry (jak coś pójdzie nie tak) i monitorowane przez Prometheus.

### 8. **Co Jeśli Coś Pójdzie Nie Tak?**
- Jeśli link weryfikacyjny wygaśnie - zaloguj się i wyślij nowy.
- Jeśli SMS nie przyjdzie - sprawdź numer telefonu i spróbuj ponownie.
- Jeśli coś się zepsuje - aplikacja pokaże błąd i zaloguje go w systemie.

To jest taki bezpieczny, krokowy proces, żeby nikt nie mógł się podszyć pod Ciebie i żeby transakcje były uczciwe. Wszystko jest zrobione tak, żeby było łatwo dla użytkownika, ale bezpiecznie dla systemu. Jakbyś miał pytania o jakiś konkretny krok, pytaj! 😉