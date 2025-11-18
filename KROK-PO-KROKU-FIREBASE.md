# 🚀 Firebase App Hosting - Krok Po Kroku

## ✅ KROK 1: Zainstaluj Firebase CLI

Otwórz PowerShell i wykonaj:

```powershell
npm install -g firebase-tools
```

**Sprawdź czy się zainstalowało:**
```powershell
npx firebase-tools --version
```

**UWAGA**: Na Windows używaj `npx firebase-tools` zamiast `firebase` (lub dodaj do PATH).

---

## ✅ KROK 2: Zaloguj się do Firebase

```powershell
npx firebase-tools login
```

**Lub jeśli `firebase` jest w PATH:**
```powershell
firebase login
```

**Co się stanie:**
- Otworzy się przeglądarka
- Zaloguj się kontem Google, które ma dostęp do projektu `m-t-m-62972`
- Wróć do PowerShell - powinno być "Success! Logged in as..."

---

## ✅ KROK 3: Wybierz projekt Firebase

```powershell
npx firebase-tools use m-t-m-62972
```

**Sprawdź dostępne projekty (jeśli nie działa):**
```powershell
npx firebase-tools projects:list
```

**Lub jeśli `firebase` jest w PATH:**
```powershell
firebase use m-t-m-62972
firebase projects:list
```

**Jeśli projekt nie jest na liście:**
- Sprawdź czy używasz właściwego konta Google
- Sprawdź czy masz dostęp do projektu `m-t-m-62972` w Firebase Console

---

## ✅ KROK 4: Otwórz Firebase Console i utwórz Backend

1. **Otwórz przeglądarkę:**
   https://console.firebase.google.com/project/m-t-m-62972/apphosting

2. **Kliknij "Create backend"** (lub "Get started")

3. **Wypełnij formularz:**
   - **Backend ID**: `palka-mtm` ⚠️ **WAŻNE** - musi być dokładnie `palka-mtm` (jak w `firebase.json`)
   - **Region**: `europe-central2` (Warsaw, Poland) lub wybierz najbliższą
   - **Repository**: Zostaw puste na razie (możesz połączyć później)

4. **Kliknij "Create"**

5. **Poczekaj** aż backend się utworzy (30-60 sekund)

---

## ✅ KROK 5: Ustaw zmienne środowiskowe w Firebase Console

1. **W Firebase Console:**
   - App Hosting → **palka-mtm** → **Environment Variables** (lub **Configuration**)

2. **Kliknij "Add variable"** i dodaj po kolei:

### 🔑 Wymagane zmienne (z `env.production`):

**1. DATABASE_URL**
```
DATABASE_URL
```
Wartość: Twój connection string PostgreSQL (np. `postgresql://user:pass@host:5432/dbname`)
⚠️ **WAŻNE**: Musi być dostępny z Firebase App Hosting

**2. NEXT_PUBLIC_BASE_URL**
```
NEXT_PUBLIC_BASE_URL
```
Wartość: `https://palkamtm.pl`

**3. NEXTAUTH_URL**
```
NEXTAUTH_URL
```
Wartość: `https://palkamtm.pl`

**4. NEXTAUTH_SECRET**
```
NEXTAUTH_SECRET
```
Wartość: Wygeneruj losowy string (np. użyj: `openssl rand -base64 32`)

**5. NODE_ENV**
```
NODE_ENV
```
Wartość: `production`

**6. NEXT_TELEMETRY_DISABLED**
```
NEXT_TELEMETRY_DISABLED
```
Wartość: `1`

### 🔥 Firebase Client-side (NEXT_PUBLIC_*):

**7. NEXT_PUBLIC_FIREBASE_API_KEY**
```
NEXT_PUBLIC_FIREBASE_API_KEY
```
Wartość: `AIzaSyCrGcWptUnRgcNnAQl01g5RjPdMfZ2tJCA`

**8. NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN**
```
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
```
Wartość: `m-t-m-62972.firebaseapp.com`

**9. NEXT_PUBLIC_FIREBASE_PROJECT_ID**
```
NEXT_PUBLIC_FIREBASE_PROJECT_ID
```
Wartość: `m-t-m-62972`

**10. NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET**
```
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
```
Wartość: `m-t-m-62972.firebasestorage.app`

**11. NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID**
```
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
```
Wartość: `714609522899`

**12. NEXT_PUBLIC_FIREBASE_APP_ID**
```
NEXT_PUBLIC_FIREBASE_APP_ID
```
Wartość: `1:714609522899:web:462e995a1f358b1b0c3c26`

**13. NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID**
```
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
```
Wartość: `G-T645E1YQHW`

### 🔐 Firebase Admin SDK (Server-side):

**14. FIREBASE_PROJECT_ID**
```
FIREBASE_PROJECT_ID
```
Wartość: `m-t-m-62972`

**15. FIREBASE_CLIENT_EMAIL**
```
FIREBASE_CLIENT_EMAIL
```
Wartość: `firebase-adminsdk-fbsvc@m-t-m-62972.iam.gserviceaccount.com`

**16. FIREBASE_PRIVATE_KEY**
```
FIREBASE_PRIVATE_KEY
```
Wartość: Skopiuj CAŁĄ wartość z `env.production` (włącznie z `-----BEGIN PRIVATE KEY-----` i `-----END PRIVATE KEY-----`)
⚠️ **WAŻNE**: Firebase Console automatycznie obsłuży `\n` - wklej całość jak jest

**17. SMS_PROVIDER** (opcjonalne)
```
SMS_PROVIDER
```
Wartość: `firebase`

---

## ✅ KROK 6: Sprawdź czy wszystko jest gotowe

W katalogu projektu wykonaj:

```powershell
firebase projects:list
```

Powinieneś zobaczyć projekt `m-t-m-62972` z gwiazdką (*).

---

## ✅ KROK 7: Deployment aplikacji

**W PowerShell (w katalogu projektu):**

```powershell
npm run deploy:firebase
```

**Lub ręcznie:**
```powershell
npx firebase-tools deploy --only apphosting
```

**Co się stanie:**
- Firebase CLI zbuduje aplikację (`npm run build`)
- Wyśle pliki do Firebase App Hosting
- Utworzy deployment

**To może potrwać 5-10 minut** - poczekaj cierpliwie.

---

## ✅ KROK 8: Sprawdź logi deploymentu

1. **Otwórz Firebase Console:**
   https://console.firebase.google.com/project/m-t-m-62972/apphosting

2. **Kliknij na backend `palka-mtm`**

3. **Zobacz sekcję "Deployments"**

4. **Kliknij na najnowszy deployment**

5. **Sprawdź:**
   - Czy build się udał (zielony znaczek ✅)
   - Czy są jakieś błędy w logach

---

## ✅ KROK 9: Sprawdź URL aplikacji

W Firebase Console → App Hosting → palka-mtm zobaczysz:
- **URL**: `https://palka-mtm-XXXXX.web.app` (lub podobny)

**Otwórz ten URL w przeglądarce** i sprawdź czy strona działa.

---

## ✅ KROK 10: Skonfiguruj domenę niestandardową (OPCJONALNIE)

1. **Firebase Console** → App Hosting → **palka-mtm** → **Custom domains**

2. **Kliknij "Add domain"**

3. **Wpisz:** `palkamtm.pl`

4. **Firebase wygeneruje instrukcje DNS**

5. **Dodaj rekordy DNS** u swojego dostawcy domeny:
   - Zwykle potrzebujesz rekordy **CNAME** lub **A**
   - Instrukcje pojawią się w Firebase Console

6. **Poczekaj na weryfikację** (5-15 minut)

7. **Sprawdź:** `https://palkamtm.pl`

---

## ❌ Rozwiązywanie problemów

### Błąd: "Project not found"
- Sprawdź czy używasz właściwego konta Google
- Sprawdź czy masz dostęp do projektu `m-t-m-62972`

### Błąd: "Backend not found"
- Wróć do KROKU 4 i utwórz backend `palka-mtm` w Firebase Console

### Build fails
- Sprawdź logi w Firebase Console → Deployments
- Upewnij się, że wszystkie zmienne środowiskowe są ustawione
- Sprawdź czy `DATABASE_URL` jest poprawny

### Runtime error
- Sprawdź logi w Firebase Console → Logs
- Sprawdź czy `FIREBASE_PRIVATE_KEY` jest poprawnie wklejony

### Strona nie działa
- Sprawdź czy deployment się udał (zielony znaczek ✅)
- Sprawdź logi runtime w Firebase Console
- Sprawdź czy wszystkie zmienne środowiskowe są ustawione

---

## 📞 Gdy coś nie działa

1. Sprawdź logi w Firebase Console
2. Sprawdź czy wszystkie zmienne środowiskowe są ustawione
3. Sprawdź czy build się udał
4. Sprawdź czy URL jest poprawny

---

## ✅ Gotowe!

Po wykonaniu wszystkich kroków aplikacja będzie działać na Firebase App Hosting.

