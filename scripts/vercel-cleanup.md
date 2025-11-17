# Usuwanie buildów z Vercel

## Metoda 1: Przez Dashboard (najprostsza)

1. Przejdź do https://vercel.com/dashboard
2. Wybierz projekt **palka-mtm**
3. Przejdź do zakładki **Deployments**
4. Kliknij **"..."** przy wybranym deployment
5. Wybierz **"Delete"**
6. Potwierdź usunięcie

**Uwaga:** Możesz usunąć wiele deploymentów naraz, zaznaczając je i klikając "Delete" w menu.

## Metoda 2: Przez Vercel CLI

### Usunięcie pojedynczego deploymentu

```bash
# Zainstaluj Vercel CLI (jeśli nie masz)
npm i -g vercel

# Zaloguj się
vercel login

# Usuń deployment (podaj deployment ID)
vercel remove <deployment-id> --yes
```

### Usunięcie wszystkich deploymentów (ostrożnie!)

```bash
# Lista wszystkich deploymentów
vercel ls

# Usuń wszystkie deploymenty (UWAGA: usuwa WSZYSTKIE!)
# Najpierw sprawdź listę, potem usuń pojedynczo
```

### Usunięcie projektu całkowicie

```bash
# Usuń cały projekt (UWAGA: usuwa projekt i wszystkie deploymenty!)
vercel remove <project-name> --yes
```

## Metoda 3: Przez API Vercel

```bash
# Pobierz token z Vercel Dashboard → Settings → Tokens
export VERCEL_TOKEN="your-token"

# Lista deploymentów
curl -H "Authorization: Bearer $VERCEL_TOKEN" \
  "https://api.vercel.com/v6/deployments?projectId=<project-id>"

# Usuń deployment
curl -X DELETE \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  "https://api.vercel.com/v13/deployments/<deployment-id>"
```

## Zalecane podejście

**Najlepiej usuwać przez Dashboard:**
- Wizualna kontrola nad tym, co usuwasz
- Możliwość zaznaczenia wielu deploymentów
- Natychmiastowe potwierdzenie
- Bezpieczniejsze niż CLI/API

## Co zostaje po usunięciu deploymentów?

- ✅ Projekt pozostaje
- ✅ Konfiguracja (Environment Variables) pozostaje
- ✅ Domain settings pozostają
- ❌ Deploymenty są usunięte (nie można ich przywrócić)
- ❌ Logi deploymentów są usunięte

## Uwaga

Usunięcie deploymentów **nie usuwa**:
- Projektu
- Environment Variables
- Domain settings
- Integracji z GitHub

Aby usunąć **cały projekt**, musisz:
1. Dashboard → Settings → Delete Project

