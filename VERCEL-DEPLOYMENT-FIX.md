# 🔧 Naprawa deploymentu na Vercel

## ✅ CO ZOSTAŁO NAPRAWIONE:

1. **Middleware** - `/auctions` nie jest już w `protectedRoutes`, tylko publiczne podtrasy są chronione
2. **HTTPS Redirect** - wyłączony dla Vercel (Vercel robi to automatycznie)
3. **vercel.json** - utworzony z właściwą konfiguracją

## 🚀 KROKI DO NAPRAWY DEPLOYMENTU:

### 1. Zmienne Środowiskowe w Vercel (WAŻNE!)

**Idź do Vercel Dashboard → Project → Settings → Environment Variables**

Dodaj wszystkie zmienne z `env.production`:

```env
# Base URL
NEXT_PUBLIC_BASE_URL=https://palkamtm.pl

# Database
DATABASE_URL=postgresql://username:password@host:5432/palkamtm_production

# NextAuth
NEXTAUTH_URL=https://palkamtm.pl
NEXTAUTH_SECRET=twoj-secret-key-produkcyjny

# Firebase Client SDK
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyCrGcWptUnRgcNnAQl01g5RjPdMfZ2tJCA
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=m-t-m-62972.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=m-t-m-62972
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=m-t-m-62972.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=714609522899
NEXT_PUBLIC_FIREBASE_APP_ID=1:714609522899:web:462e995a1f358b1b0c3c26
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-T645E1YQHW

# Firebase Admin SDK
FIREBASE_PROJECT_ID=m-t-m-62972
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@m-t-m-62972.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCcRe0BslSnISuR\nFcisDVbgkNvz3jekt/z9KI6LsR4ddyBfyH2up0BcEvLuNXwUTsTKxmTSbn1HoG7m\nnzDIJrzwL0xLBhzujhAbCfPg0nHYqifiVu0QY27nGh+2MltN9q99rDcdVQfVDSsj\nXwiD1py2oX1l5o6PeKsifenacG5tATcexfjnPuxxLdTFyF1LhgMwVNyoPKOvpEsd\nbGG8pWtAXW5xiyJTvHcYI5T0I8oLugNCKYazEWbD0Cz5ZCWUDFuo7jHitU+PYhvN\nsvEiDMySOhmjvdHqR+JvvcBxOnS9241KjTbeZ1adaFLg1E+FxQVfBOkJuJQY4ylX\nvHSrXss9AgMBAAECggEAQfUtlJK9MhFI/yKPoTa8HWpmu6ZmG+rgJ8XPbFxkVpFq\nI6NOkMHc4z/IMwx2A2g/nUphUYP68plfVY2JHGFlS4bbD6tT2MgzOgZYXeLU1Fr1\nHI4N3uXo8DfRfKgCa4ScC1H9rS6vcJfvRi2dPW/+kwLUF4dZUmre6F72rhDYOr8o\nhEQW3LAAgBdm40xWJo8gIRKKtGM7xl0o2CCrilt7XY0DqZrZVnYrNOrphCCt7e4g\nhkhzhDnL5P5Q6B4Vc0kY2xg3/c9Hb5QnBHzMV/N7d6rl3zMrQ7t9B7R8s0BudKRH\n5qtnBr3VjMzYolmpDAp626r55MjPqG2IWdBoSANRzQKBgQDSQCeKegcfM+g2UIOL\nPDwae4PR3BRTOdyvGMcv+lxeXXXE/b2ostiaKKimTKHtRCizozFz7v3gR6MHCCtP\nZqPh3Hya5r0HpslSN2j028wKi2Zj144tWCzyHjArZOsUBXJrh3b/RLrVhobOggDs\nMS4JJUDh+PAM5isX6B+V4Bf6HwKBgQC+Rv/Wi+F4XvhQG9rnOgZ7Cwdx0IRhb/Mi\nIzpeOCC9D/3HeDQHfnwjGJugNZiXibdv4TmjDYxPXWIiK+hQTT1rrt+jm5F3Qgyg\nJ/tBaTEc/eSDFsx9oIIWPk6sQKeUbUXDjCyzPpj7oxIS1FLE1WnJBFH3BQ9hLT9i\n24I72SdHIwKBgQDDA+apNw6sDoVw+7VHzJMjLTXTzgK8P4tGjgETq3FJxf6avZDR\njTIDq3ri5Wm8nd/y34fbNO4evdOljho+B8IymUSqmSL0metaazLbC5Ryo2JRcXra\n7FKkMQQU/AJgC71Zp8jkdWem7qTTnxoj+mns6bUI5NIj5MpL3m6NodIbmQKBgQC4\nccp+BopBTI4X2WiQy8aMb1yAD0jDyuk8JjnmKzJRErdGLFcDDLD4tFnnKw0HmA+g\n/AoK7I8eP79osHc5oCXxxEo1JhAUMopalWcROQ7Ks7JXADqpbHWtaiiJAQNw9Zuy\nuqZ5+iwBgUl7xyWUd+tbWDy73sPRxzKyeWX87bsNUQKBgEuRLuP3I2yJP1GzDClB\n3a0bc19XuXaGmxn0LBzHfqiqkq6lymWUIlFH5r+jibP9dDyvSHE9GWCkmVdfVhAf\nZUhXKc+ChCX0EWEb90+LhpIIY2pMZGg4gVn6NAW/xV3pyueGdDm1ciBPisrqWHMj\nJkH3fKiQfGi52ouES8nVl/tL\n-----END PRIVATE KEY-----\n"

# SMS
SMS_PROVIDER=firebase

# Node Environment (Vercel ustawia to automatycznie - NIE USTAWIAJ)
# NODE_ENV=production
```

**WAŻNE dla FIREBASE_PRIVATE_KEY:**
- Musi być w cudzysłowach `"`
- Musi zawierać `\n` (nie `\\n`) w miejscach przełamania linii
- Cały klucz w jednej linii

### 2. Dodaj domenę w Vercel

1. Vercel Dashboard → Project → Settings → Domains
2. Kliknij **Add Domain**
3. Wpisz: `palkamtm.pl` i `www.palkamtm.pl`
4. Vercel pokaże dokładne wartości DNS

### 3. Konfiguracja DNS w Home.pl

**W Home.pl DNS Manager:**

**Dla głównej domeny `palkamtm.pl`:**
- Type: **A**
- Host: `palkamtm.pl.` (lub `@`)
- Value: **[IP z Vercel Dashboard]** (lub **CNAME: cname.vercel-dns.com** jeśli Vercel to sugeruje)

**Dla subdomeny `www.palkamtm.pl`:**
- Type: **CNAME**
- Host: `www.palkamtm.pl.`
- Value: `cname.vercel-dns.com` (lub wartość z Vercel Dashboard)

**UWAGA:** Sprawdź w Vercel Dashboard dokładne wartości - mogą się różnić!

### 4. Dodaj domenę w Firebase

1. Firebase Console → Authentication → Settings
2. **Authorized domains** → **Add domain**
3. Dodaj: `palkamtm.pl` i `www.palkamtm.pl`

### 5. Redeploy w Vercel

1. Vercel Dashboard → Deployments
2. Kliknij **Redeploy** na najnowszym deployment
3. Lub zrób nowy push do repozytorium

## 🔍 DIAGNOSTYKA PROBLEMÓW:

### Strona nie działa - sprawdź:

1. **Build logs w Vercel:**
   - Vercel Dashboard → Deployments → [Najnowszy] → Build Logs
   - Sprawdź czy build przeszedł pomyślnie

2. **Environment Variables:**
   - Sprawdź czy wszystkie zmienne są dodane
   - Sprawdź czy są dla środowiska **Production**

3. **DNS Propagation:**
   ```bash
   nslookup palkamtm.pl
   dig palkamtm.pl
   ```
   - Sprawdź czy DNS wskazuje na Vercel

4. **SSL Certificate:**
   - Vercel automatycznie wystawia SSL
   - Poczekaj 1-5 minut po dodaniu domeny

5. **Console w przeglądarce:**
   - F12 → Console
   - Sprawdź błędy JavaScript

### Błędy builda - typowe problemy:

- **Brak zmiennych środowiskowych** → Dodaj w Vercel Settings
- **Błąd Prisma** → Sprawdź `DATABASE_URL`
- **Błąd Firebase** → Sprawdź wszystkie `FIREBASE_*` zmienne
- **Błąd Next.js** → Sprawdź build logs

## ✅ CHECKLIST:

- [ ] Wszystkie zmienne środowiskowe dodane w Vercel
- [ ] Domena `palkamtm.pl` dodana w Vercel
- [ ] DNS skonfigurowany w Home.pl
- [ ] Domena dodana w Firebase Authorized domains
- [ ] Redeploy wykonany w Vercel
- [ ] SSL certificate aktywny (automatycznie przez Vercel)
- [ ] Strona działa na URL z Vercel (przed podpięciem domeny)
- [ ] Strona działa na `palkamtm.pl`

## 📞 Wsparcie:

Jeśli strona nadal nie działa:
1. Sprawdź build logs w Vercel
2. Sprawdź funkcję API routes: `https://palkamtm.pl/api/health` (jeśli istnieje)
3. Sprawdź czy middleware nie blokuje requestów

