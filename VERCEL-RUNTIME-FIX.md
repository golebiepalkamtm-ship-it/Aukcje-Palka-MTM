# 🔧 Naprawa Runtime Errors na Vercel

## ✅ CO ZOSTAŁO NAPRAWIONE:

1. **SSR Safety** - Dodano sprawdzenia `typeof window === 'undefined'` i `typeof document === 'undefined'`
2. **Loading Overlay** - Dodano fallback jeśli video się nie załaduje (10 sekund timeout)
3. **Video Error Handling** - Dodano `onError` handler dla video
4. **Client-side only rendering** - Loading overlay renderuje się tylko w przeglądarce

## 🐛 TYPOWE PROBLEMY RUNTIME NA VERCEL:

### 1. **Strona pokazuje biały ekran / nic się nie renderuje**

**Przyczyna:** Loading overlay blokuje renderowanie lub video nie może się załadować

**Naprawione:** 
- ✅ Fallback timeout po 10 sekundach
- ✅ Obsługa błędów video (`onError`)
- ✅ Renderowanie tylko w przeglądarce (`isClient`)

### 2. **Błędy SSR (document/window is not defined)**

**Przyczyna:** Kod próbuje użyć `document` lub `window` podczas SSR

**Naprawione:**
- ✅ `app/layout.tsx` - sprawdzenie `isClient` przed renderowaniem overlay
- ✅ `app/page.tsx` - sprawdzenie `typeof window === 'undefined'` przed użyciem

### 3. **Firebase initialization errors**

**Przyczyna:** Brak zmiennych środowiskowych w runtime

**Sprawdź:**
- Vercel Dashboard → Project → Settings → Environment Variables
- Wszystkie zmienne `NEXT_PUBLIC_*` i `FIREBASE_*` muszą być dodane
- Muszą być dla środowiska **Production**

### 4. **Middleware blokuje requesty**

**Przyczyna:** Middleware blokował `/auctions` całkowicie

**Naprawione:**
- ✅ `/auctions` nie jest już w `protectedRoutes`
- ✅ Tylko konkretne podtrasy są chronione (`/auctions/create`, `/auctions/bid`)

## 🔍 DIAGNOSTYKA - SPRAWDŹ W VERCEL DASHBOARD:

### 1. **Runtime Logs:**
```
Vercel Dashboard → Project → Deployments → [Najnowszy] → Runtime Logs
```
- Sprawdź czy są błędy JavaScript
- Sprawdź czy są błędy Firebase initialization
- Sprawdź czy są błędy API routes

### 2. **Function Logs:**
```
Vercel Dashboard → Project → Deployments → [Najnowszy] → Function Logs
```
- Sprawdź czy API routes działają
- Sprawdź czy middleware nie blokuje requestów

### 3. **Build Logs (już sprawdzone - build się udał):**
```
Vercel Dashboard → Project → Deployments → [Najnowszy] → Build Logs
```

## 🧪 TESTY - SPRAWDŹ CZY DZIAŁA:

### 1. **Health Check:**
```bash
curl https://twoja-domena.vercel.app/api/health
# lub
curl https://palkamtm.pl/api/health
```
Powinno zwrócić: `{"status":"ok","timestamp":...}`

### 2. **Strona główna:**
```bash
curl https://twoja-domena.vercel.app/
# lub
curl https://palkamtm.pl/
```
Powinno zwrócić HTML strony głównej

### 3. **Console w przeglądarce:**
1. Otwórz stronę w przeglądarce
2. F12 → Console
3. Sprawdź czy są błędy:
   - `Firebase: Error (auth/...)`
   - `Uncaught ReferenceError: ... is not defined`
   - `Cannot read property ... of undefined`

### 4. **Network Tab:**
1. F12 → Network
2. Odśwież stronę
3. Sprawdź czy wszystkie requesty się udają (status 200)
4. Sprawdź czy nie ma błędów 404, 500, 503

## 🔧 NASTĘPNE KROKI:

### Jeśli strona nadal nie działa:

1. **Sprawdź Runtime Logs w Vercel** - tam będą dokładne błędy
2. **Sprawdź Console w przeglądarce** - błędy JavaScript
3. **Sprawdź Network Tab** - które requesty się nie udają
4. **Sprawdź zmienne środowiskowe** - czy wszystkie są dodane w Vercel

### Typowe błędy i rozwiązania:

#### "Firebase: Error (auth/unauthorized-domain)"
→ Dodaj domenę w Firebase Console → Authentication → Settings → Authorized domains

#### "Cannot read property 'X' of undefined"
→ Sprawdź czy zmienne środowiskowe są dostępne (mogą być dostępne w build, ale nie w runtime)

#### "500 Internal Server Error"
→ Sprawdź Runtime Logs w Vercel, sprawdź czy API routes działają

#### "Biały ekran / nic się nie renderuje"
→ Sprawdź Console w przeglądarce, sprawdź czy są błędy JavaScript

## ✅ CHECKLIST:

- [ ] Build zakończony pomyślnie ✅
- [ ] Runtime Logs sprawdzone
- [ ] Console w przeglądarce sprawdzone (F12)
- [ ] Network Tab sprawdzone (F12)
- [ ] Wszystkie zmienne środowiskowe dodane w Vercel
- [ ] Domena dodana w Firebase Authorized domains
- [ ] `/api/health` zwraca `{"status":"ok"}`
- [ ] Strona główna się renderuje

