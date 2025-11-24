# 🌐 Konfiguracja Domeny Niestandardowej dla Firebase App Hosting

## Przegląd

Firebase App Hosting umożliwia mapowanie domeny niestandardowej (np. `palkamtm.pl`) na backend. Domena jest już skonfigurowana w `apphosting.yaml` jako `NEXT_PUBLIC_BASE_URL` i `NEXTAUTH_URL`.

## Metoda 1: Przez Firebase Console (Zalecane)

### KROK 1: Otwórz Firebase Console

1. Przejdź do: https://console.firebase.google.com/
2. Wybierz projekt: **m-t-m-62972**
3. W lewym menu kliknij **App Hosting**

### KROK 2: Wybierz Backend

1. Kliknij na backend **palkamtm**
2. Przejdź do zakładki **Custom domains** (lub **Domains**)

### KROK 3: Dodaj Domenę

1. Kliknij **Add custom domain** (lub **Add domain**)
2. Wprowadź domenę: `palkamtm.pl`
3. Kliknij **Continue**

### KROK 4: Weryfikacja Domeny

Firebase wygeneruje rekordy DNS do dodania:

**Opcja A: TXT Record (weryfikacja)**
```
TXT @ palkamtm.pl
Wartość: firebase=<kod-weryfikacyjny>
```

**Opcja B: CNAME Record (mapowanie)**
```
CNAME @ palkamtm.pl
Wartość: <backend-id>.apphosting.run
```

### KROK 5: Dodaj Rekordy DNS

1. Zaloguj się do panelu zarządzania domeną (np. OVH, GoDaddy, Cloudflare)
2. Przejdź do sekcji **DNS** / **DNS Records**
3. Dodaj rekordy zgodnie z instrukcjami Firebase:
   - **TXT record** dla weryfikacji
   - **CNAME record** dla mapowania (opcjonalnie, jeśli Firebase tego wymaga)

### KROK 6: Weryfikacja

1. W Firebase Console kliknij **Verify**
2. Poczekaj na propagację DNS (może zająć do 48h, zwykle 5-30 minut)
3. Po weryfikacji domena będzie aktywna

## Metoda 2: Przez Firebase CLI

### KROK 1: Dodaj Domenę

```bash
firebase apphosting:domains:add \
  --backend=palkamtm \
  --domain=palkamtm.pl \
  --project=m-t-m-62972
```

### KROK 2: Pobierz Rekordy DNS

```bash
firebase apphosting:domains:list \
  --backend=palkamtm \
  --project=m-t-m-62972
```

### KROK 3: Dodaj Rekordy w Panelu DNS

Dodaj rekordy zgodnie z wyświetlonymi instrukcjami.

### KROK 4: Weryfikacja

```bash
firebase apphosting:domains:verify \
  --backend=palkamtm \
  --domain=palkamtm.pl \
  --project=m-t-m-62972
```

## Konfiguracja DNS - Szczegóły

### Dla Domeny Głównej (palkamtm.pl)

**Opcja 1: CNAME (jeśli Firebase to obsługuje)**
```
Type: CNAME
Name: @ (lub palkamtm.pl)
Value: palkamtm-<hash>.apphosting.run
TTL: 3600
```

**Opcja 2: A Record (jeśli Firebase poda IP)**
```
Type: A
Name: @ (lub palkamtm.pl)
Value: <IP-adres-z-Firebase>
TTL: 3600
```

### Dla Subdomeny (www.palkamtm.pl)

```
Type: CNAME
Name: www
Value: palkamtm-<hash>.apphosting.run
TTL: 3600
```

## Weryfikacja Konfiguracji

### 1. Sprawdź Rekordy DNS

```bash
# Windows PowerShell
nslookup palkamtm.pl

# Linux/Mac
dig palkamtm.pl
```

### 2. Sprawdź Status w Firebase

```bash
firebase apphosting:domains:list \
  --backend=palkamtm \
  --project=m-t-m-62972
```

Status powinien być: **ACTIVE** lub **VERIFIED**

## Konfiguracja SSL/HTTPS

Firebase automatycznie:
- Generuje certyfikat SSL dla domeny
- Włącza HTTPS
- Wymusza przekierowanie HTTP → HTTPS

**Czas aktywacji SSL:** 1-24 godziny po weryfikacji domeny

## Aktualizacja Zmiennych Środowiskowych

Domena jest już skonfigurowana w `apphosting.yaml`:

```yaml
env:
  - variable: NEXT_PUBLIC_BASE_URL
    value: https://palkamtm.pl
  - variable: NEXTAUTH_URL
    value: https://palkamtm.pl
```

Po dodaniu domeny w Firebase Console, aplikacja automatycznie będzie dostępna pod `https://palkamtm.pl`.

## Rozwiązywanie Problemów

### Problem: DNS nie propaguje się

**Rozwiązanie:**
- Sprawdź rekordy DNS: `nslookup palkamtm.pl`
- Upewnij się, że rekordy są poprawne
- Poczekaj do 48h na pełną propagację

### Problem: Błąd weryfikacji

**Rozwiązanie:**
- Sprawdź, czy rekord TXT jest poprawnie dodany
- Upewnij się, że wartość TXT jest dokładnie taka jak w Firebase
- Usuń stare rekordy DNS i dodaj nowe

### Problem: SSL nie działa

**Rozwiązanie:**
- Poczekaj 24h na wygenerowanie certyfikatu
- Sprawdź status w Firebase Console
- Upewnij się, że domena jest w pełni zweryfikowana

## Dodatkowe Ustawienia

### Przekierowanie www → domena główna

W Firebase Console możesz skonfigurować przekierowanie:
- `www.palkamtm.pl` → `palkamtm.pl`
- `palkamtm.pl` → `www.palkamtm.pl` (jeśli preferujesz www)

### Subdomeny

Możesz dodać subdomeny (np. `api.palkamtm.pl`, `admin.palkamtm.pl`) w ten sam sposób.

## Dokumentacja Firebase

- [Firebase App Hosting - Custom Domains](https://firebase.google.com/docs/app-hosting/configure#custom-domains)
- [Firebase CLI - Domains](https://firebase.google.com/docs/cli/apphosting#domains)

