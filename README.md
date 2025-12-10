kugo# Pałka MTM - Platforma Aukcyjna Gołębi Pocztowych

> **Mistrzowie Sprintu** - Profesjonalna platforma aukcyjna z pełnym stackiem produkcyjnym

## Quick Start

```powershell
# Install dependencies
npm install

# Setup Firebase credentials
npm run setup-firebase

# Start dev server
npm run dev:windows

# Start monitoring stack
docker-compose up -d
```

## Dokumentacja

Cała dokumentacja projektu znajduje się w folderze [\docs/\](docs/):

- [SETUP_INSTRUCTIONS.md](docs/SETUP_INSTRUCTIONS.md) - Instrukcje instalacji i konfiguracji
- [DOCUMENTATION.md](docs/DOCUMENTATION.md) - Główna dokumentacja techniczna
- [README.md](docs/README.md) - Szczegółowy opis projektu
- [QUICK-DEPLOY-HOMEPL.md](docs/QUICK-DEPLOY-HOMEPL.md) - Szybki deployment

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM, PostgreSQL
- **Auth**: Firebase Auth + Admin SDK (3-poziomowa weryfikacja)
- **Cache**: Redis
- **Monitoring**: Sentry, Prometheus, Grafana
- **Tests**: Playwright (E2E), Vitest (Unit)
- **PWA**: next-pwa (offline support)

## Autoryzacja

Projekt używa 3-poziomowego systemu weryfikacji:

1. **USER_REGISTERED** - tylko logowanie
2. **USER_EMAIL_VERIFIED** - dostęp do profilu
3. **USER_FULL_VERIFIED** - tworzenie aukcji, licytowanie
4. **ADMIN** - pełny dostęp administratora

## Główne Komendy

```powershell
npm run dev:windows      # Dev server (Windows)
npm run build            # Production build
npm test                 # Unit tests
npm run playwright test  # E2E tests
npx prisma migrate dev   # Database migrations
npx prisma generate      # Generate Prisma client
```

## Wymagania

- Node.js 18+
- PostgreSQL 14+
- Redis 7+
- Docker (opcjonalnie, dla monitoringu)

## Więcej Informacji

Sprawdź folder [\docs/\](docs/) dla pełnej dokumentacji projektu.
