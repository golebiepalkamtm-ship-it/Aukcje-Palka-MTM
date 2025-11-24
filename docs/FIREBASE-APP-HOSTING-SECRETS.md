# 🔐 Konfiguracja Secretów dla Firebase App Hosting

## Problem

Firebase App Hosting wymaga dostępu do secretów w Google Cloud Secret Manager. Błąd:
```
Odmowa uprawnień „secretmanager.versions.get" dla zasobu 'projects/mtm-62972/secrets/database-url/versions/latest'
```

## Rozwiązanie

### KROK 1: Utworzenie Secretów w Google Cloud Secret Manager

Wykonaj w Google Cloud Console lub przez CLI:

```bash
# Projekt
PROJECT_ID="mtm-62972"

# 1. DATABASE_URL
echo -n "postgresql://user:password@/dbname?host=/cloudsql/m-t-m-62972:europe-west4:m-t-m-62972-instance" | \
  gcloud secrets create database-url \
    --project=$PROJECT_ID \
    --data-file=-

# 2. FIREBASE_PROJECT_ID
echo -n "m-t-m-62972" | \
  gcloud secrets create firebase-project-id \
    --project=$PROJECT_ID \
    --data-file=-

# 3. FIREBASE_CLIENT_EMAIL
echo -n "firebase-adminsdk-fbsvc@m-t-m-62972.iam.gserviceaccount.com" | \
  gcloud secrets create firebase-client-email \
    --project=$PROJECT_ID \
    --data-file=-

# 4. FIREBASE_PRIVATE_KEY
# Wklej pełny klucz prywatny z env.production (zachowaj \n)
echo -n "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCcRe0BslSnISuR\nFcisDVbgkNvz3jekt/z9KI6LsR4ddyBfyH2up0BcEvLuNXwUTsTKxmTSbn1HoG7m\nnzDIJrzwL0xLBhzujhAbCfPg0nHYqifiVu0QY27nGh+2MltN9q99rDcdVQfVDSsj\nXwiD1py2oX1l5o6PeKsifenacG5tATcexfjnPuxxLdTFyF1LhgMwVNyoPKOvpEsd\nbGG8pWtAXW5xiyJTvHcYI5T0I8oLugNCKYazEWbD0Cz5ZCWUDFuo7jHitU+PYhvN\nsvEiDMySOhmjvdHqR+JvvcBxOnS9241KjTbeZ1adaFLg1E+FxQVfBOkJuJQY4ylX\nvHSrXss9AgMBAAECggEAQfUtlJK9MhFI/yKPoTa8HWpmu6ZmG+rgJ8XPbFxkVpFq\nI6NOkMHc4z/IMwx2A2g/nUphUYP68plfVY2JHGFlS4bbD6tT2MgzOgZYXeLU1Fr1\nHI4N3uXo8DfRfKgCa4ScC1H9rS6vcJfvRi2dPW/+kwLUF4dZUmre6F72rhDYOr8o\nhEQW3LAAgBdm40xWJo8gIRKKtGM7xl0o2CCrilt7XY0DqZrZVnYrNOrphCCt7e4g\nhkhzhDnL5P5Q6B4Vc0kY2xg3/c9Hb5QnBHzMV/N7d6rl3zMrQ7t9B7R8s0BudKRH\n5qtnBr3VjMzYolmpDAp626r55MjPqG2IWdBoSANRzQKBgQDSQCeKegcfM+g2UIOL\nPDwae4PR3BRTOdyvGMcv+lxeXXXE/b2ostiaKKimTKHtRCizozFz7v3gR6MHCCtP\nZqPh3Hya5r0HpslSN2j028wKi2Zj144tWCzyHjArZOsUBXJrh3b/RLrVhobOggDs\nMS4JJUDh+PAM5isX6B+V4Bf6HwKBgQC+Rv/Wi+F4XvhQG9rnOgZ7Cwdx0IRhb/Mi\nIzpeOCC9D/3HeDQHfnwjGJugNZiXibdv4TmjDYxPXWIiK+hQTT1rrt+jm5F3Qgyg\nJ/tBaTEc/eSDFsx9oIIWPk6sQKeUbUXDjCyzPpj7oxIS1FLE1WnJBFH3BQ9hLT9i\n24I72SdHIwKBgQDDA+apNw6sDoVw+7VHzJMjLTXTzgK8P4tGjgETq3FJxf6avZDR\njTIDq3ri5Wm8nd/y34fbNO4evdOljho+B8IymUSqmSL0metaazLbC5Ryo2JRcXra\n7FKkMQQU/AJgC71Zp8jkdWem7qTTnxoj+mns6bUI5NIj5MpL3m6NodIbmQKBgQC4\nccp+BopBTI4X2WiQy8aMb1yAD0jDyuk8JjnmKzJRErdGLFcDDLD4tFnnKw0HmA+g\n/AoK7I8eP79osHc5oCXxxEo1JhAUMopalWcROQ7Ks7JXADqpbHWtaiiJAQNw9Zuy\nuqZ5+iwBgUl7xyWUd+tbWDy73sPRxzKyeWX87bsNUQKBgEuRLuP3I2yJP1GzDClB\n3a0bc19XuXaGmxn0LBzHfqiqkq6lymWUIlFH5r+jibP9dDyvSHE9GWCkmVdfVhAf\nZUhXKc+ChCX0EWEb90+LhpIIY2pMZGg4gVn6NAW/xV3pyueGdDm1ciBPisrqWHMj\nJkH3fKiQfGi52ouES8nVl/tL\n-----END PRIVATE KEY-----\n" | \
  gcloud secrets create firebase-private-key \
    --project=$PROJECT_ID \
    --data-file=-

# 5. NEXTAUTH_SECRET
echo -n "your-production-secret-key-here-change-this" | \
  gcloud secrets create nextauth-secret \
    --project=$PROJECT_ID \
    --data-file=-
```

**Alternatywnie przez Google Cloud Console:**

1. Otwórz: https://console.cloud.google.com/security/secret-manager?project=mtm-62972
2. Kliknij **CREATE SECRET**
3. Dla każdego secretu:
   - **Name**: `database-url`, `firebase-project-id`, `firebase-client-email`, `firebase-private-key`, `nextauth-secret`
   - **Secret value**: Wklej wartość z `env.production`
   - **Create**

### KROK 2: Przyznanie Dostępu Firebase App Hosting

Firebase App Hosting używa service account do dostępu do secretów. Przyznaj dostęp:

```bash
PROJECT_ID="mtm-62972"
BACKEND_ID="palkamtm"

# Pobierz service account dla backendu
SERVICE_ACCOUNT=$(firebase apphosting:backends:get $BACKEND_ID --project=$PROJECT_ID --format=json | jq -r '.serviceAccount')

# Przyznaj dostęp do wszystkich secretów
SECRETS=("database-url" "firebase-project-id" "firebase-client-email" "firebase-private-key" "nextauth-secret")

for SECRET in "${SECRETS[@]}"; do
  gcloud secrets add-iam-policy-binding $SECRET \
    --project=$PROJECT_ID \
    --member="serviceAccount:$SERVICE_ACCOUNT" \
    --role="roles/secretmanager.secretAccessor"
done
```

**Alternatywnie przez Firebase CLI:**

```bash
firebase apphosting:secrets:grantaccess \
  --backend=palkamtm \
  --secret=database-url \
  --project=mtm-62972

firebase apphosting:secrets:grantaccess \
  --backend=palkamtm \
  --secret=firebase-project-id \
  --project=mtm-62972

firebase apphosting:secrets:grantaccess \
  --backend=palkamtm \
  --secret=firebase-client-email \
  --project=mtm-62972

firebase apphosting:secrets:grantaccess \
  --backend=palkamtm \
  --secret=firebase-private-key \
  --project=mtm-62972

firebase apphosting:secrets:grantaccess \
  --backend=palkamtm \
  --secret=nextauth-secret \
  --project=mtm-62972
```

### KROK 3: Weryfikacja

Sprawdź, czy sekrety są dostępne:

```bash
# Lista secretów
gcloud secrets list --project=mtm-62972

# Sprawdź uprawnienia dla konkretnego secretu
gcloud secrets get-iam-policy database-url --project=mtm-62972
```

### KROK 4: Aktualizacja Secretów (w przyszłości)

Aby zaktualizować wartość secretu:

```bash
# Przykład: aktualizacja DATABASE_URL
echo -n "nowa-wartosc" | \
  gcloud secrets versions add database-url \
    --project=mtm-62972 \
    --data-file=-
```

## Ważne Uwagi

1. **DATABASE_URL format**: Dla Cloud SQL użyj formatu:
   ```
   postgresql://user:password@/dbname?host=/cloudsql/PROJECT_ID:REGION:INSTANCE_ID
   ```

2. **FIREBASE_PRIVATE_KEY**: Zachowaj format z `\n` (nowe linie) w secret value.

3. **Service Account**: Firebase App Hosting automatycznie tworzy service account. Użyj Firebase CLI do przyznania dostępu.

4. **Region**: Upewnij się, że sekrety są w tym samym regionie co backend (europe-west4).

## Dokumentacja

- [Firebase App Hosting - Secret Parameters](https://firebase.google.com/docs/app-hosting/configure#secret-parameters)
- [Google Cloud Secret Manager](https://cloud.google.com/secret-manager/docs)

