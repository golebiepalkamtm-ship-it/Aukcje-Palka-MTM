# Firebase Phone Auth - Instrukcja konfiguracji

## Wymagania

System autoryzacji SMS został skonfigurowany do wysyłania prawdziwych SMS przez Firebase Phone Auth. Aby w pełni skonfigurować system, wykonaj poniższe kroki:

## 1. Firebase Console - Aktywacja Phone Auth

1. **Idź do Firebase Console**: https://console.firebase.google.com/
2. **Wybierz projekt**: Palka MTM Auctions
3. **Przejdź do Authentication**:
   - Kliknij na "Authentication" w menu po lewej stronie
   - Przejdź do zakładki "Sign-in method"

4. **Aktywuj Phone Provider**:
   - Znajdź "Phone" w liście providerów
   - Kliknij "Enable"
   - Potwierdź aktywację

## 2. Billing - Obowiązkowe dla produkcyjnego SMS

⚠️ **WAŻNE**: Firebase wymaga aktywnego bilingu do wysyłania prawdziwych SMS.

1. **Przejdź do Billing**:
   - W Firebase Console kliknij na ikonę "Billing" (🏷️) lub przejdź do Google Cloud Console
   - Link: https://console.cloud.google.com/billing

2. **Skonfiguruj billing**:
   - Podłącz kartę kredytową do konta Google Cloud
   - **SMS w Polsce**: około 0.01-0.02 USD za SMS
   - **Koszt testowy**: przy normalnym użytkowaniu (100-1000 SMS/miesiąc) < 20 USD/miesiąc

3. **Sprawdź limity**:
   - Upewnij się, że masz dostęp do SMS dla Polski (+48)

## 3. Dominy autoryzacyjne

1. **W Authentication Settings**:
   - Przejdź do "Settings" → "Authorized domains"
   - Dodaj domenę: `localhost:3000` (dla development)
   - Dodaj domenę produkcyjną: `palkamtm.pl`

## 4. Usuń testowe numery (opcjonalne)

⚠️ **Ostrzeżenie**: Usuń testowe numery tylko gdy masz aktywny billing!

1. **W Authentication Console**:
   - Przejdź do "Users"
   - Znajdź użytkowników z testowymi numerami (np. +1234567890)
   - **USUŃ ich lub zmień na prawdziwe numery**

## 5. Konfiguracja reCAPTCHA

1. **reCAPTCHA jest automatycznie skonfigurowany**
2. **Sprawdź działanie**:
   - Otwórz `/auth/verify-phone`
   - Spróbuj wysłać kod - powinien pojawić się niewidoczny reCAPTCHA

## 6. Testowanie w środowisku lokalnym

```bash
# 1. Skopiuj plik env
cp .env.production.example .env.local

# 2. Dodaj Firebase config (pobierz z Firebase Console)
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdef123456

# 3. Uruchom projekt
npm run dev:windows

# 4. Testuj autoryzację
# - Zaloguj się/zarejestruj
# - Idź do /auth/verify-phone
# - Wprowadź prawdziwy numer telefonu (+48...)
# - Otrzymaj realny SMS
```

## 7. Bezpieczeństwo i monitorowanie

1. **Monitoruj SMS usage**:
   - W Firebase Console → Authentication → Usage
   - Sprawdzaj dzienne limity i koszty

2. **Ustaw alerty billingowe** (opcjonalne):
   - Google Cloud Console → Billing → Budgets & alerts
   - Ustaw alert na np. 10 USD/miesiąc

3. **Sprawdź logs**:
   - Firebase Console → Authentication → Users
   - Monitoruj udane i nieudane próby weryfikacji

## Rozwiązywanie problemów

### Błąd: "APP_NOT_AUTHORIZED"
- **Przyczyna**: Domena nie jest autoryzowana
- **Rozwiązanie**: Dodaj domenę do Authorized domains

### Błąd: "QUOTA_EXCEEDED"
- **Przyczyna**: Przekroczono dzienny limit SMS
- **Rozwiązanie**: Poczekaj 24h lub skontaktuj się z Firebase Support

### Błąd: "INVALID_PHONE_NUMBER"
- **Przyczyna**: Zły format numeru telefonu
- **Rozwiązanie**: Użyj formatu +48XXXXXXXXX (PL)

### SMS nie przychodzi
1. **Sprawdź czy numer nie jest na czarnej liście**
2. **Sprawdź czy masz aktywny billing**
3. **Sprawdź logs w Firebase Console**

## Koszty (orientacyjne dla Polski)

- **SMS do Polski**: ~0.01-0.02 USD
- **Testowanie**: 10-100 SMS = < 2 USD
- **Mały ruch**: 100-500 SMS/miesiąc = ~10 USD
- **Średni ruch**: 500-2000 SMS/miesiąc = ~30-50 USD

## ✅ Gotowe!

Po wykonaniu tych kroków system będzie:
- ✅ Wysyłał prawdziwe SMS (nie testowe)
- ✅ Weryfikował numery telefonu przez Firebase
- ✅ Zapisywał status weryfikacji w bazie danych
- ✅ Chronił przed spamem przez reCAPTCHA

---

**Uwaga**: Jeśli chcesz wyłączyć SMS i użyć innego providera (np. Twilio), zmień `SMS_PROVIDER=firebase` na `SMS_PROVIDER=twilio` w pliku .env.
