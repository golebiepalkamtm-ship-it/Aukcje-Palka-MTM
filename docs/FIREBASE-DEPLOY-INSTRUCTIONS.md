# 🚀 Instrukcja Deployment na Firebase App Hosting

## Krok 1: Zainstaluj Firebase CLI

```powershell
npm install -g firebase-tools
```

## Krok 2: Zaloguj się do Firebase

```powershell
firebase login
```

Otworzy się przeglądarka - zaloguj się kontem Google.

## Krok 3: Wybierz projekt Firebase

```powershell
firebase use m-t-m-62972
```

Lub sprawdź dostępne projekty:
```powershell
firebase projects:list
```

## Krok 4: Utwórz Backend App Hosting w Firebase Console

1. Otwórz: https://console.firebase.google.com/project/m-t-m-62972/apphosting
2. Kliknij **"Create backend"** (lub **"Get started"**)
3. Wypełnij formularz:
   - **Backend ID**: `palka-mtm` (musi być zgodne z `firebase.json`)
   - **Region**: `europe-central2` (Warsaw) lub najbliższa
   - **Repository**: Opcjonalnie - możesz połączyć z GitHub (lub użyć CLI)
4. Kliknij **"Create"**

## Krok 5: Ustaw Zmienne Środowiskowe w Firebase Console

1. Firebase Console → **App Hosting** → **palka-mtm** → **Environment Variables**
2. Kliknij **"Add variable"** dla każdej zmiennej:

### Wymagane zmienne (z `env.production`):

```
DATABASE_URL=postgresql://username:password@host:5432/dbname
NEXT_PUBLIC_BASE_URL=https://palkamtm.pl
NEXTAUTH_URL=https://palkamtm.pl
NEXTAUTH_SECRET=twoj-secret-key-tutaj
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
```

### Firebase Client-side (NEXT_PUBLIC_*):

```
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyCrGcWptUnRgcNnAQl01g5RjPdMfZ2tJCA
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=m-t-m-62972.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=m-t-m-62972
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=m-t-m-62972.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=714609522899
NEXT_PUBLIC_FIREBASE_APP_ID=1:714609522899:web:462e995a1f358b1b0c3c26
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-T645E1YQHW
```

### Firebase Admin SDK (Server-side):

```
FIREBASE_PROJECT_ID=m-t-m-62972
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@m-t-m-62972.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCcRe0BslSnISuR\nFcisDVbgkNvz3jekt/z9KI6LsR4ddyBfyH2up0BcEvLuNXwUTsTKxmTSbn1HoG7m\nnzDIJrzwL0xLBhzujhAbCfPg0nHYqifiVu0QY27nGh+2MltN9q99rDcdVQfVDSsj\nXwiD1py2oX1l5o6PeKsifenacG5tATcexfjnPuxxLdTFyF1LhgMwVNyoPKOvpEsd\nbGG8pWtAXW5xiyJTvHcYI5T0I8oLugNCKYazEWbD0Cz5ZCWUDFuo7jHitU+PYhvN\nsvEiDMySOhmjvdHqR+JvvcBxOnS9241KjTbeZ1adaFLg1E+FxQVfBOkJuJQY4ylX\nvHSrXss9AgMBAAECggEAQfUtlJK9MhFI/yKPoTa8HWpmu6ZmG+rgJ8XPbFxkVpFq\nI6NOkMHc4z/IMwx2A2g/nUphUYP68plfVY2JHGFlS4bbD6tT2MgzOgZYXeLU1Fr1\nHI4N3uXo8DfRfKgCa4ScC1H9rS6vcJfvRi2dPW/+kwLUF4dZUmre6F72rhDYOr8o\nhEQW3LAAgBdm40xWJo8gIRKKtGM7xl0o2CCrilt7XY0DqZrZVnYrNOrphCCt7e4g\nhkhzhDnL5P5Q6B4Vc0kY2xg3/c9Hb5QnBHzMV/N7d6rl3zMrQ7t9B7R8s0BudKRH\n5qtnBr3VjMzYolmpDAp626r55MjPqG2IWdBoSANRzQKBgQDSQCeKegcfM+g2UIOL\nPDwae4PR3BRTOdyvGMcv+lxeXXXE/b2ostiaKKimTKHtRCizozFz7v3gR6MHCCtP\nZqPh3Hya5r0HpslSN2j028wKi2Zj144tWCzyHjArZOsUBXJrh3b/RLrVhobOggDs\nMS4JJUDh+PAM5isX6B+V4Bf6HwKBgQC+Rv/Wi+F4XvhQG9rnOgZ7Cwdx0IRhb/Mi\nIzpeOCC9D/3HeDQHfnwjGJugNZiXibdv4TmjDYxPXWIiK+hQTT1rrt+jm5F3Qgyg\nJ/tBaTEc/eSDFsx9oIIWPk6sQKeUbUXDjCyzPpj7oxIS1FLE1WnJBFH3BQ9hLT9i\n24I72SdHIwKBgQDDA+apNw6sDoVw+7VHzJMjLTXTzgK8P4tGjgETq3FJxf6avZDR\njTIDq3ri5Wm8nd/y34fbNO4evdOljho+B8IymUSqmSL0metaazLbC5Ryo2JRcXra\n7FKkMQQU/AJgC71Zp8jkdWem7qTTnxoj+mns6bUI5NIj5MpL3m6NodIbmQKBgQC4\nccp+BopBTI4X2WiQy8aMb1yAD0jDyuk8JjnmKzJRErdGLFcDDLD4tFnnKw0HmA+g\n/AoK7I8eP79osHc5oCXxxEo1JhAUMopalWcROQ7Ks7JXADqpbHWtaiiJAQNw9Zuy\nuqZ5+iwBgUl7xyWUd+tbWDy73sPRxzKyeWX87bsNUQKBgEuRLuP3I2yJP1GzDClB\n3a0bc19XuXaGmxn0LBzHfqiqkq6lymWUIlFH5r+jibP9dDyvSHE9GWCkmVdfVhAf\nZUhXKc+ChCX0EWEb90+LhpIIY2pMZGg4gVn6NAW/xV3pyueGdDm1ciBPisrqWHMj\nJkH3fKiQfGi52ouES8nVl/tL\n-----END PRIVATE KEY-----\n
```

**WAŻNE**: Dla `FIREBASE_PRIVATE_KEY` - musisz zachować `\n` w wartości (Firebase Console automatycznie to obsłuży).

### Opcjonalne:

```
SMS_PROVIDER=firebase
```

## Krok 6: Deployment

```powershell
npm run deploy:firebase
```

Lub ręcznie:
```powershell
firebase deploy --only apphosting
```

## Krok 7: Sprawdź logi

1. Firebase Console → **App Hosting** → **palka-mtm** → **Deployments**
2. Kliknij na najnowszy deployment
3. Zobacz logi build i runtime

## Krok 8: Skonfiguruj domenę niestandardową

1. Firebase Console → **App Hosting** → **palka-mtm** → **Custom domains**
2. Kliknij **"Add domain"**
3. Wpisz: `palkamtm.pl`
4. Firebase wygeneruje instrukcje DNS
5. Dodaj rekordy DNS u swojego dostawcy domeny
6. Poczekaj na weryfikację (5-15 minut)

## Krok 9: Przetestuj

Otwórz w przeglądarce:
- Firebase URL: `https://palka-mtm-XXXXX.web.app`
- Lub Twoja domena: `https://palkamtm.pl` (po skonfigurowaniu DNS)

## Troubleshooting

### Build fails
- Sprawdź logi w Firebase Console → App Hosting → Deployments
- Upewnij się, że wszystkie zmienne środowiskowe są ustawione
- Sprawdź czy `DATABASE_URL` jest dostępny z Firebase App Hosting

### Runtime errors
- Sprawdź logi w Firebase Console → App Hosting → Logs
- Sprawdź czy `FIREBASE_PRIVATE_KEY` jest poprawnie sformatowany

### Błąd autoryzacji
- Sprawdź czy domena jest dodana do Firebase Authorized Domains
- Firebase Console → Authentication → Settings → Authorized domains

