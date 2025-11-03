# Przewodnik Phone Verification przez Firebase

## Przegląd

Aplikacja używa **tylko Firebase Phone Authentication** do weryfikacji numeru telefonu.

**To jest Phone Verification** (weryfikacja numeru jako część profilu), **nie Multi-Factor Authentication (MFA)**.

## Jak to działa

1. **Wysyłanie SMS** - `/api/phone/send-verification`
   - Użytkownik jest już zalogowany (email/hasło)
   - Użytkownik wprowadza numer telefonu w profilu
   - Firebase Phone Auth SDK automatycznie wysyła SMS z kodem weryfikacyjnym
   - Używamy `PhoneAuthProvider.verifyPhoneNumber()` - **bez logowania użytkownika**
   - Numer telefonu jest zapisywany w profilu

2. **Weryfikacja kodu** - `/api/phone/check-verification`
   - Użytkownik wprowadza kod otrzymany w SMS
   - Firebase weryfikuje kod przez `PhoneAuthProvider.credential()` (po stronie klienta)
   - Po pomyślnej weryfikacji aktualizujemy status `isPhoneVerified = true` w bazie danych
   - **Użytkownik pozostaje zalogowany jako wcześniej**

## Struktura danych

```typescript
User {
  phoneNumber: string | null
  isPhoneVerified: boolean
  phoneVerificationCode: string | null // Nie używane w Firebase Phone Auth
  phoneVerificationExpires: DateTime | null // Nie używane w Firebase Phone Auth
}
```

## Konfiguracja Firebase

Zobacz: [FIREBASE-PHONE-AUTH-SETUP.md](./FIREBASE-PHONE-AUTH-SETUP.md)

### Wymagane zmienne środowiskowe

```env
# Firebase Configuration (WYMAGANE)
NEXT_PUBLIC_FIREBASE_API_KEY="your-api-key"
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="pigeon-aucion.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="pigeon-aucion"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="pigeon-aucion.firebasestorage.app"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="your-sender-id"
NEXT_PUBLIC_FIREBASE_APP_ID="your-app-id"
```

## Zabezpieczenia

- **reCAPTCHA**: Automatyczna weryfikacja przez Firebase reCAPTCHA
- **Rate limiting**: Firebase zarządza limitami SMS
- **Expiration**: Firebase zarządza wygaśnięciem kodów
- **Authentication required**: Wymagane zalogowanie przed weryfikacją telefonu

## Testowanie

### Numery testowe w Firebase

1. Firebase Console → **Authentication** → **Sign-in method** → **Phone**
2. W sekcji **Phone numbers for testing** dodaj numery testowe
3. Numery testowe zawsze otrzymają kod `123456`

### Lokalne środowisko

- Dodaj `localhost` do **Authorized domains** w Firebase Console
- Użyj numerów testowych (bez kosztów SMS)

### Produkcja

- **Plan Blaze**: Wymagany płatny plan Firebase Blaze do wysyłania SMS
- Dodaj domenę produkcyjną do **Authorized domains**
- Sprawdź limity SMS w Firebase Console → Usage and billing

## Troubleshooting

### SMS nie są wysyłane

1. Sprawdź czy Phone Authentication jest włączone w Firebase Console
2. Sprawdź czy jesteś na planie Blaze (wymagane dla produkcji)
3. Sprawdź limity SMS w Firebase Console → Usage and billing
4. Sprawdź czy domena jest dodana w Authorized domains

### Błąd reCAPTCHA

- Sprawdź czy domena jest dodana w **Authorized domains**
- Sprawdź czy reCAPTCHA jest poprawnie załadowana w przeglądarce (sprawdź konsolę)

### Kod weryfikacyjny nie działa

- Sprawdź czy kod został wprowadzony poprawnie (6 cyfr)
- Sprawdź czy kod nie wygasł (Firebase ma własne limity czasowe)
- Sprawdź logi w konsoli przeglądarki (errors)

### Błąd autoryzacji

- Upewnij się, że użytkownik jest zalogowany przed weryfikacją
- Sprawdź Firebase token
- Sprawdź czy użytkownik istnieje w bazie danych
