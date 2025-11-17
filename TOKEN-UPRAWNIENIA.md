# ⚠️ Problem z Tokenem

Twój token **działa**, ale **nie ma uprawnień do push**.

## Rozwiązanie: Utwórz Classic Token

Fine-grained token (ten który masz) wymaga specjalnych uprawnień. Lepiej użyj **Classic Token**:

### Krok 1: Utwórz Nowy Token

1. Przejdź do: **https://github.com/settings/tokens**
2. Kliknij: **Generate new token** → **Generate new token (classic)**
3. Wypełnij:
   - **Note**: `palka-mtm-push`
   - **Expiration**: `90 days` lub `No expiration`
   - **Select scopes**: Zaznacz ✅ **`repo`** (pełny dostęp do repozytoriów)
4. Kliknij: **Generate token**
5. **SKOPIUJ TOKEN** (zaczyna się od `ghp_...`)

### Krok 2: Użyj Nowego Tokenu

W PowerShell:

```powershell
# Wstaw nowy token (ghp_...)
$newToken = "ghp_TWOJ_NOWY_TOKEN_TUTAJ"

# Ustaw remote z tokenem
git remote set-url origin "https://borysbory69-hash:$newToken@github.com/borysbory69-hash/palka-mtm.git"

# Push
git push -u origin main --force
```

---

## Alternatywa: Sprawdź Uprawnienia Fine-Grained Token

Jeśli chcesz użyć obecnego tokenu:

1. Przejdź do: **https://github.com/settings/tokens**
2. Znajdź swój token (ten który zaczyna się od `github_pat_...`)
3. Kliknij na niego
4. W sekcji **Repository access**:
   - Wybierz: **Only select repositories**
   - Dodaj: **palka-mtm**
5. W sekcji **Repository permissions**:
   - **Contents**: Read and write
   - **Metadata**: Read-only
6. **Save**

Potem spróbuj ponownie push.

---

**Najprostsze: Classic Token z scope `repo`** ⚡

