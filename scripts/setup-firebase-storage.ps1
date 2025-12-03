# Setup Firebase Storage dla Upload Skryptu
# Ten skrypt pomoże skonfigurować credentials dla uploadu plików do Firebase Storage

$ErrorActionPreference = "Stop"

Write-Host "`n============================================" -ForegroundColor Cyan
Write-Host "   Firebase Storage - Setup Credentials" -ForegroundColor Cyan
Write-Host "============================================`n" -ForegroundColor Cyan

# Sprawdź czy firebase-key.json już istnieje
if (Test-Path "firebase-key.json") {
    Write-Host "✓ firebase-key.json już istnieje!" -ForegroundColor Green
    Write-Host "`nMożesz teraz użyć:`n" -ForegroundColor Yellow
    Write-Host "  npx tsx scripts/upload-public-to-firebase.ts --dry-run" -ForegroundColor White
    Write-Host "  npx tsx scripts/upload-public-to-firebase.ts`n" -ForegroundColor White
    exit 0
}

Write-Host "❌ firebase-key.json nie został znaleziony`n" -ForegroundColor Red

Write-Host "Aby pobrać klucz z Firebase Console:" -ForegroundColor Yellow
Write-Host "1. Otwórz: https://console.firebase.google.com/project/m-t-m-62972/settings/serviceaccounts/adminsdk" -ForegroundColor White
Write-Host "2. Kliknij 'Generate new private key'" -ForegroundColor White
Write-Host "3. Pobierz plik JSON" -ForegroundColor White
Write-Host "4. Skopiuj go jako 'firebase-key.json' do głównego folderu projektu`n" -ForegroundColor White

$response = Read-Host "Czy już pobrałeś klucz? (t/n)"

if ($response -eq "t" -or $response -eq "T") {
    Write-Host "`nOtwórz Eksplorator Plików i przeciągnij plik JSON tutaj, lub wpisz pełną ścieżkę:" -ForegroundColor Yellow
    $jsonPath = Read-Host "Ścieżka do pliku JSON"
    
    # Usuń cudzysłowy jeśli są
    $jsonPath = $jsonPath.Trim('"')
    
    if (Test-Path $jsonPath) {
        Copy-Item $jsonPath "firebase-key.json" -Force
        Write-Host "`n✓ firebase-key.json został skopiowany pomyślnie!" -ForegroundColor Green
        Write-Host "`nTeraz możesz użyć:`n" -ForegroundColor Yellow
        Write-Host "  npx tsx scripts/upload-public-to-firebase.ts --dry-run" -ForegroundColor White
        Write-Host "  npx tsx scripts/upload-public-to-firebase.ts`n" -ForegroundColor White
    } else {
        Write-Host "`n❌ Plik nie został znaleziony: $jsonPath" -ForegroundColor Red
        Write-Host "Sprawdź ścieżkę i spróbuj ponownie.`n" -ForegroundColor Yellow
        exit 1
    }
} else {
    Write-Host "`nPobierz klucz z Firebase Console, a następnie uruchom ten skrypt ponownie.`n" -ForegroundColor Yellow
    exit 0
}
