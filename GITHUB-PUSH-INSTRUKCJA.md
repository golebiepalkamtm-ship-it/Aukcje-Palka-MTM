# 🚀 Jak Wypchnąć Kod na GitHub - PROSTY SPOSÓB

## Problem
Git używa konta `Mantaxx`, a próbujesz pushować do repo `borysbory69-hash/palka-mtm`.

## Rozwiązanie - 3 Proste Kroki

### Krok 1: Utwórz Token na GitHub

1. **Otwórz przeglądarkę** i przejdź do:
   ```
   https://github.com/settings/tokens
   ```

2. **Kliknij**: `Generate new token` → `Generate new token (classic)`

3. **Wypełnij formularz**:
   - **Note**: `palka-mtm-push`
   - **Expiration**: `90 days` (lub `No expiration`)
   - **Select scopes**: Zaznacz ✅ **`repo`** (pełny dostęp)

4. **Kliknij**: `Generate token` na dole

5. **SKOPIUJ TOKEN** (będzie widoczny tylko raz!)
   - Wygląda tak: `ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

### Krok 2: Wyczyść Stare Poświadczenia

**W PowerShell wpisz:**

```powershell
# Wyczyść Windows Credential Manager
cmdkey /delete:git:https://github.com

# Wyczyść Git Credential Manager
git credential-manager-core erase https://github.com
```

### Krok 3: Push z Tokenem

**W PowerShell wpisz:**

```powershell
git push -u origin main --force
```

**Gdy Git zapyta o dane:**

1. **Username**: `borysbory69-hash`
2. **Password**: `[Wklej skopiowany token z Kroku 1]`

---

## Alternatywa: Użyj GitHub Desktop

Jeśli masz problemy z tokenem:

1. **Pobierz GitHub Desktop**: https://desktop.github.com/
2. **Zaloguj się** na konto `borysbory69-hash`
3. **File** → **Clone Repository** → **URL**
4. Wpisz: `https://github.com/borysbory69-hash/palka-mtm.git`
5. **Wybierz folder** projektu
6. **Publish repository** (lub **Push origin**)

---

## Alternatywa: VS Code

1. **Otwórz projekt** w VS Code
2. **Source Control** (Ctrl+Shift+G)
3. **...** (trzy kropki) → **Push**
4. VS Code poprosi o zalogowanie - użyj konta `borysbory69-hash`

---

## Jeśli Nic Nie Działa

**Opcja ostatnia - Zmień Remote na SSH:**

```powershell
# Zmień na SSH
git remote set-url origin git@github.com:borysbory69-hash/palka-mtm.git

# Push
git push -u origin main --force
```

**Ale najpierw musisz:**
1. Wygenerować klucz SSH: `ssh-keygen -t ed25519 -C "twoj@email.com"`
2. Dodać klucz do GitHub: https://github.com/settings/keys

---

**Najprostsze rozwiązanie: Token (Krok 1-3) - zajmie 2 minuty!** ⚡

