# Script to push code to GitHub with proper authentication
# Usage: .\scripts\push-to-github.ps1

Write-Host "🚀 Przygotowanie do push na GitHub" -ForegroundColor Cyan
Write-Host ""

# Check if we're in the right directory
if (-not (Test-Path ".git")) {
    Write-Host "❌ Błąd: To nie jest repozytorium Git!" -ForegroundColor Red
    exit 1
}

# Check remote
$remote = git remote get-url origin
Write-Host "📦 Remote: $remote" -ForegroundColor Yellow
Write-Host ""

# Check if user wants to use SSH
$useSSH = Read-Host "Czy chcesz użyć SSH? (y/n) (Zalecane: n - użyj HTTPS z tokenem)"

if ($useSSH -eq "y") {
    Write-Host ""
    Write-Host "📝 Konfiguracja SSH:" -ForegroundColor Cyan
    Write-Host "1. Sprawdź czy masz klucz SSH: ssh-keygen -t ed25519 -C 'twoj@email.com'"
    Write-Host "2. Dodaj klucz do GitHub: Settings -> SSH and GPG keys"
    Write-Host "3. Zmień remote na SSH:"
    Write-Host "   git remote set-url origin git@github.com:borysbory69-hash/palka-mtm.git"
    Write-Host ""
    $changeRemote = Read-Host "Czy zmienić remote na SSH? (y/n)"
    if ($changeRemote -eq "y") {
        git remote set-url origin git@github.com:borysbory69-hash/palka-mtm.git
        Write-Host "✅ Remote zmieniony na SSH" -ForegroundColor Green
    }
} else {
    Write-Host ""
    Write-Host "📝 Konfiguracja HTTPS z Personal Access Token:" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "1. Utwórz Personal Access Token:" -ForegroundColor Yellow
    Write-Host "   - Przejdź do: https://github.com/settings/tokens"
    Write-Host "   - Kliknij 'Generate new token (classic)'"
    Write-Host "   - Nazwa: 'palka-mtm-deploy'"
    Write-Host "   - Wybierz scope: 'repo' (pełny dostęp do repozytoriów)"
    Write-Host "   - Kliknij 'Generate token'"
    Write-Host "   - SKOPIUJ TOKEN (będzie widoczny tylko raz!)"
    Write-Host ""
    Write-Host "2. Przy następnym push użyj tokenu jako hasła"
    Write-Host ""
    
    $hasToken = Read-Host "Czy masz już token? (y/n)"
    if ($hasToken -eq "y") {
        Write-Host ""
        Write-Host "⚠️  Przy następnym 'git push' użyj:" -ForegroundColor Yellow
        Write-Host "   Username: borysbory69-hash" -ForegroundColor Yellow
        Write-Host "   Password: [TWÓJ_TOKEN]" -ForegroundColor Yellow
        Write-Host ""
    }
}

Write-Host ""
Write-Host "🔄 Próba push..." -ForegroundColor Cyan
Write-Host ""

# Try to push
git push -u origin main --force

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Sukces! Kod został wypchnięty na GitHub!" -ForegroundColor Green
    Write-Host "🔗 Repozytorium: https://github.com/borysbory69-hash/palka-mtm" -ForegroundColor Cyan
} else {
    Write-Host ""
    Write-Host "❌ Błąd podczas push. Sprawdź:" -ForegroundColor Red
    Write-Host "   1. Czy masz uprawnienia do repo borysbory69-hash/palka-mtm"
    Write-Host "   2. Czy użyłeś poprawnego tokenu/hasła"
    Write-Host "   3. Czy jesteś zalogowany na właściwe konto GitHub"
    Write-Host ""
    Write-Host "💡 Wskazówka: Możesz też użyć GitHub Desktop lub VS Code do push"
}

