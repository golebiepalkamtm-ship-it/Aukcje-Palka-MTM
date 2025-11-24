# Przyznaj dostep Firebase App Hosting do secretow w Cloud Secret Manager
# Uzyj tego skryptu, jesli sekrety juz istnieja, ale brakuje uprawnien

$PROJECT_ID = "m-t-m-62972"
$BACKEND_ID = "palkamtm"

Write-Host "Przyznaje dostep Firebase App Hosting do secretow..." -ForegroundColor Cyan

# Lista secretow z apphosting.yaml
$secrets = @(
    "database-url",
    "firebase-project-id",
    "firebase-client-email",
    "firebase-private-key",
    "nextauth-secret"
)

foreach ($secret in $secrets) {
    Write-Host "`nPrzetwarzam: $secret" -ForegroundColor Yellow
    
    # Sprawdz czy secret istnieje
    $secretExists = gcloud secrets describe $secret --project=$PROJECT_ID 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "   Secret '$secret' nie istnieje!" -ForegroundColor Red
        Write-Host "   Utworz go najpierw w Cloud Secret Manager" -ForegroundColor Yellow
        continue
    }
    
    # Przyznaj dostep przez Firebase CLI
    Write-Host "   Przyznaje dostep..." -ForegroundColor Gray
    firebase apphosting:secrets:grantaccess `
        --backend=$BACKEND_ID `
        --secret=$secret `
        --project=$PROJECT_ID 2>&1 | Out-Null
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   Dostep przyznany" -ForegroundColor Green
    } else {
        Write-Host "   Blad lub dostep juz przyznany" -ForegroundColor Yellow
    }
}

Write-Host "`nZakonczono!" -ForegroundColor Green
Write-Host "`nWeryfikacja:" -ForegroundColor Cyan
Write-Host "   Sprawdz uprawnienia: gcloud secrets get-iam-policy database-url --project=$PROJECT_ID" -ForegroundColor Gray
