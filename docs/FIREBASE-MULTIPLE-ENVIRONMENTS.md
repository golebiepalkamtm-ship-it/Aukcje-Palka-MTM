# 🔄 Firebase App Hosting - Wiele Środowisk

## Przegląd

Firebase App Hosting pozwala na konfigurację wielu środowisk (np. `production`, `staging`) dla tego samego backendu, używając plików specyficznych dla środowiska.

**Dokumentacja:** https://firebase.google.com/docs/app-hosting/multiple-environments

---

## 📁 Pliki Konfiguracyjne

### Bazowy plik
- **`.apphosting.yaml`** - Konfiguracja bazowa dla wszystkich środowisk

### Pliki specyficzne dla środowiska
- **`.apphosting.production.yaml`** - Nadpisuje wartości dla środowiska `production`
- **`.apphosting.staging.yaml`** - Nadpisuje wartości dla środowiska `staging`

**Zasada:** Firebase App Hosting scala pliki - wartości z pliku specyficznego dla środowiska mają priorytet nad bazowym.

---

## 🚀 Konfiguracja Krok Po Kroku

### KROK 1: Utwórz środowisko w Firebase Console

1. Otwórz: https://console.firebase.google.com/project/m-t-m-62972/apphosting/backends/palka-mtm

2. Kliknij **"Settings"** (Ustawienia) → **"Environment"** (Środowisko)

3. W polu **"Environment name"** wpisz nazwę:
   - `production` - dla środowiska produkcyjnego
   - `staging` - dla środowiska staging

4. Kliknij **"Save"** (Zapisz)

### KROK 2: Skonfiguruj pliki YAML

Pliki zostały już utworzone:
- ✅ `.apphosting.yaml` - konfiguracja bazowa
- ✅ `.apphosting.production.yaml` - konfiguracja production
- ✅ `.apphosting.staging.yaml` - konfiguracja staging

### KROK 3: Ustaw zmienne środowiskowe w Firebase Console

**Dla środowiska PRODUCTION:**

1. Firebase Console → App Hosting → **palka-mtm** → **Environment Variables**

2. Ustaw wszystkie zmienne z `env.production`

3. **WAŻNE:** Dla wrażliwych danych (sekrety) użyj **Firebase Secrets**:
   - `DATABASE_URL` → utwórz secret `secretProductionDatabaseURL`
   - `NEXTAUTH_SECRET` → utwórz secret `secretProductionNextAuthSecret`
   - `FIREBASE_PRIVATE_KEY` → utwórz secret `secretProductionFirebasePrivateKey`

**Dla środowiska STAGING:**

1. Utwórz osobny backend `palka-mtm-staging` (lub użyj tego samego z inną nazwą środowiska)

2. Ustaw zmienne środowiskowe dla staging

3. Użyj Firebase Secrets dla wrażliwych danych

---

## 🔐 Firebase Secrets

**Zalecane podejście dla wrażliwych danych:**

Zamiast wpisywać wrażliwe wartości bezpośrednio w zmiennych środowiskowych, użyj Firebase Secrets.

### Utworzenie Secret

1. Firebase Console → **App Hosting** → **palka-mtm** → **Secrets**

2. Kliknij **"Create secret"**

3. Wpisz:
   - **Secret ID**: `secretProductionDatabaseURL`
   - **Secret value**: Wklej wartość `DATABASE_URL`

4. Kliknij **"Create"**

### Użycie Secret w YAML

W pliku `.apphosting.production.yaml`:

```yaml
env:
  - variable: DATABASE_URL
    secret: secretProductionDatabaseURL  # Odwołanie do secret
    availability:
      - RUNTIME
```

### Nadanie uprawnień

Po utworzeniu secret, musisz nadać uprawnienia kontu usługi App Hosting:

1. Firebase Console → **App Hosting** → **palka-mtm** → **Secrets**

2. Kliknij na secret → **"Permissions"**

3. Dodaj service account: `palka-mtm@apphosting-m-t-m-62972.iam.gserviceaccount.com`

---

## 📊 Porównanie Środowisk

| Parametr | Production | Staging |
|----------|-----------|---------|
| **CPU** | 2 | 1 |
| **Memory** | 2048 MiB | 1024 MiB |
| **Max Instances** | 10 | 3 |
| **Min Instances** | 1 | 0 |
| **Concurrency** | 100 | 50 |
| **Base URL** | https://palkamtm.pl | https://staging.palkamtm.pl |

---

## 🎯 Przykładowa Konfiguracja

### Bazowy `.apphosting.yaml`

```yaml
runConfig:
  runtime: nodejs20
  env:
    - variable: NODE_ENV
      value: production

buildConfig:
  commands:
    - npm ci
    - npm run build
```

### Production `.apphosting.production.yaml`

```yaml
runConfig:
  cpu: 2
  memoryMiB: 2048
  maxInstances: 10
  minInstances: 1

env:
  - variable: NEXT_PUBLIC_BASE_URL
    value: https://palkamtm.pl
  - variable: DATABASE_URL
    secret: secretProductionDatabaseURL  # Secret zamiast wartości
```

### Staging `.apphosting.staging.yaml`

```yaml
runConfig:
  cpu: 1
  memoryMiB: 1024
  maxInstances: 3
  minInstances: 0

env:
  - variable: NEXT_PUBLIC_BASE_URL
    value: https://staging.palkamtm.pl
  - variable: DATABASE_URL
    secret: secretStagingDatabaseURL  # Osobny secret dla staging
```

---

## 🔄 Deployment

Po skonfigurowaniu środowiska w Firebase Console:

```powershell
# Deploy do production (jeśli backend ma environment: production)
npm run deploy:firebase

# Lub deploy ręcznie
npx firebase-tools deploy --only apphosting
```

Firebase automatycznie:
1. Sprawdza nazwę środowiska w Firebase Console
2. Ładuje odpowiedni plik `.apphosting.ENVIRONMENT_NAME.yaml`
3. Scala z bazowym `.apphosting.yaml`
4. Używa wartości ze specyficznego pliku (priorytet)

---

## ✅ Weryfikacja

1. **Sprawdź logi deploymentu:**
   - Firebase Console → App Hosting → palka-mtm → Deployments
   - Kliknij na deployment → zobacz scaloną konfigurację

2. **Sprawdź zmienne środowiskowe:**
   - Firebase Console → App Hosting → palka-mtm → Environment Variables
   - Sprawdź czy wszystkie zmienne są ustawione

3. **Sprawdź secrets:**
   - Firebase Console → App Hosting → palka-mtm → Secrets
   - Sprawdź czy secrets mają odpowiednie uprawnienia

---

## 🚨 Rozwiązywanie Problemów

### Backend nie używa właściwego środowiska

**Problem:** Deployment używa bazowego `.apphosting.yaml` zamiast specyficznego.

**Rozwiązanie:**
1. Sprawdź czy nazwa środowiska w Firebase Console jest poprawna
2. Sprawdź czy plik `.apphosting.ENVIRONMENT_NAME.yaml` istnieje
3. Sprawdź czy nazwa pliku jest dokładnie zgodna z nazwą środowiska

### Secrets nie działają

**Problem:** Aplikacja nie może odczytać secrets.

**Rozwiązanie:**
1. Sprawdź czy secret został utworzony
2. Sprawdź czy service account ma uprawnienia do secret
3. Sprawdź czy nazwa secret w YAML jest poprawna

### Zmienne środowiskowe nie działają

**Problem:** Aplikacja nie widzi zmiennych środowiskowych.

**Rozwiązanie:**
1. Sprawdź `availability` - czy zmienna jest dostępna w `RUNTIME`?
2. Sprawdź logi w Firebase Console → Logs
3. Sprawdź czy zmienna jest ustawiona w Firebase Console → Environment Variables

---

## 📚 Dokumentacja

- [Firebase App Hosting - Multiple Environments](https://firebase.google.com/docs/app-hosting/multiple-environments)
- [Firebase Secrets](https://firebase.google.com/docs/app-hosting/manage-secrets)

