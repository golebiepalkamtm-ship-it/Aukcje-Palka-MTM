# Automatyczna konfiguracja Cloud SQL i Secret Manager dla Firebase App Hosting
# Wymaga: włączonego billing w projekcie m-t-m-62972

$ErrorActionPreference = "Stop"
$projectId = "m-t-m-62972"
$instanceName = "m-t-m-62972-instance"
$region = "europe-west4"
$databaseName = "palkamtm_production"
$dbUser = "palkamtm_user"

Write-Host "🔧 Konfiguracja Cloud SQL dla Firebase App Hosting" -ForegroundColor Cyan
Write-Host ""

# 1. Sprawdź czy instancja istnieje
Write-Host "📋 Sprawdzanie instancji Cloud SQL..." -ForegroundColor Yellow
$instance = gcloud sql instances describe $instanceName --project=$projectId --format="value(name,region,settings.tier,state)" 2>&1

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Instancja $instanceName nie istnieje lub billing nie jest włączony" -ForegroundColor Red
    Write-Host "   Włącz billing: https://console.developers.google.com/billing/enable?project=$projectId" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Instancja znaleziona: $instanceName" -ForegroundColor Green

# 2. Sprawdź czy instancja jest aktywna
$state = gcloud sql instances describe $instanceName --project=$projectId --format="value(state)" 2>&1
if ($state -eq "SUSPENDED") {
    Write-Host "⚠️  Instancja jest zawieszona. Wznawianie..." -ForegroundColor Yellow
    gcloud sql instances patch $instanceName --activation-policy=ALWAYS --project=$projectId
    Write-Host "✅ Instancja wznowiona" -ForegroundColor Green
}

# 3. Utwórz bazę danych (jeśli nie istnieje)
Write-Host ""
Write-Host "🗃️  Sprawdzanie bazy danych..." -ForegroundColor Yellow
$dbList = gcloud sql databases list --instance=$instanceName --project=$projectId --format="value(name)" 2>&1
$dbExists = ($dbList | Select-String -Pattern "^$databaseName$") -ne $null

if (-not $dbExists) {
    Write-Host "📦 Tworzenie bazy danych: $databaseName" -ForegroundColor Yellow
    gcloud sql databases create $databaseName --instance=$instanceName --project=$projectId
    Write-Host "✅ Baza danych utworzona" -ForegroundColor Green
} else {
    Write-Host "✅ Baza danych już istnieje" -ForegroundColor Green
}

# 4. Utwórz użytkownika (jeśli nie istnieje)
Write-Host ""
Write-Host "👤 Sprawdzanie użytkownika bazy danych..." -ForegroundColor Yellow
$userList = gcloud sql users list --instance=$instanceName --project=$projectId --format="value(name)" 2>&1
$userExists = ($userList | Select-String -Pattern "^$dbUser$") -ne $null

if (-not $userExists) {
    Write-Host "🔑 Generowanie hasła dla użytkownika..." -ForegroundColor Yellow
    $dbPassword = -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})
    $dbPassword | Out-File -FilePath ".db-password.txt" -Encoding utf8 -NoNewline
    
    Write-Host "👤 Tworzenie użytkownika: $dbUser" -ForegroundColor Yellow
    gcloud sql users create $dbUser --instance=$instanceName --password=$dbPassword --project=$projectId
    Write-Host "✅ Użytkownik utworzony. Hasło zapisane w .db-password.txt" -ForegroundColor Green
} else {
    Write-Host "✅ Użytkownik już istnieje" -ForegroundColor Green
    if (Test-Path ".db-password.txt") {
        $dbPassword = Get-Content ".db-password.txt" -Raw
    } else {
        Write-Host "⚠️  Hasło nie jest zapisane. Użyj istniejącego hasła lub zresetuj:" -ForegroundColor Yellow
        Write-Host "   gcloud sql users set-password $dbUser --instance=$instanceName --password=NEW_PASSWORD --project=$projectId" -ForegroundColor Cyan
        $dbPassword = Read-Host "Wprowadź hasło użytkownika"
    }
}

# 5. Utwórz DATABASE_URL
Write-Host ""
Write-Host "🔗 Tworzenie DATABASE_URL..." -ForegroundColor Yellow
$databaseUrl = "postgresql://${dbUser}:${dbPassword}@/${databaseName}?host=/cloudsql/${projectId}:${region}:${instanceName}"
$databaseUrl | Out-File -FilePath ".database-url.txt" -Encoding utf8 -NoNewline
Write-Host "✅ DATABASE_URL zapisany w .database-url.txt" -ForegroundColor Green

# 6. Generuj NEXTAUTH_SECRET
Write-Host ""
Write-Host "🔐 Generowanie NEXTAUTH_SECRET..." -ForegroundColor Yellow
if (-not (Test-Path ".nextauth-secret.txt")) {
    $nextauthSecret = node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
    $nextauthSecret | Out-File -FilePath ".nextauth-secret.txt" -Encoding utf8 -NoNewline
    Write-Host "✅ NEXTAUTH_SECRET wygenerowany i zapisany" -ForegroundColor Green
} else {
    Write-Host "✅ NEXTAUTH_SECRET już istnieje" -ForegroundColor Green
    $nextauthSecret = Get-Content ".nextauth-secret.txt" -Raw
}

# 7. Utwórz sekrety w Cloud Secret Manager
Write-Host ""
Write-Host "🔒 Tworzenie sekretów w Cloud Secret Manager..." -ForegroundColor Yellow

$secrets = @(
    @{Name="database-url"; Value=$databaseUrl},
    @{Name="firebase-project-id"; Value=$projectId},
    @{Name="firebase-client-email"; Value="firebase-adminsdk-fbsvc@${projectId}.iam.gserviceaccount.com"},
    @{Name="nextauth-secret"; Value=$nextauthSecret}
)

foreach ($secret in $secrets) {
    Write-Host "  📝 Tworzenie sekretu: $($secret.Name)..." -ForegroundColor Cyan
    $exists = gcloud secrets describe $secret.Name --project=$projectId 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "    ⚠️  Sekret już istnieje. Aktualizowanie..." -ForegroundColor Yellow
        echo $secret.Value | gcloud secrets versions add $secret.Name --data-file=- --project=$projectId
    } else {
        echo $secret.Value | gcloud secrets create $secret.Name --data-file=- --project=$projectId
    }
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "    ✅ Sekret $($secret.Name) utworzony/zaktualizowany" -ForegroundColor Green
    } else {
        Write-Host "    ❌ Błąd przy tworzeniu sekretu $($secret.Name)" -ForegroundColor Red
    }
}

# 8. Utwórz sekret firebase-private-key
Write-Host ""
Write-Host "  📝 Tworzenie sekretu: firebase-private-key..." -ForegroundColor Cyan
$privateKeyLine = Get-Content "env.production" | Select-String -Pattern 'FIREBASE_PRIVATE_KEY='
if ($privateKeyLine) {
    $privateKey = $privateKeyLine.Line -replace 'FIREBASE_PRIVATE_KEY="', '' -replace '"$', ''
    $privateKey = $privateKey -replace '\\n', "`n"
} else {
    Write-Host "    ❌ Nie znaleziono FIREBASE_PRIVATE_KEY w env.production" -ForegroundColor Red
    exit 1
}

$keyExists = gcloud secrets describe firebase-private-key --project=$projectId 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "    ⚠️  Sekret już istnieje. Aktualizowanie..." -ForegroundColor Yellow
    $privateKey | gcloud secrets versions add firebase-private-key --data-file=- --project=$projectId
} else {
    $privateKey | gcloud secrets create firebase-private-key --data-file=- --project=$projectId
}

if ($LASTEXITCODE -eq 0) {
    Write-Host "    ✅ Sekret firebase-private-key utworzony/zaktualizowany" -ForegroundColor Green
} else {
    Write-Host "    ❌ Błąd przy tworzeniu sekretu firebase-private-key" -ForegroundColor Red
}

# 9. Zaktualizuj apphosting.yaml
Write-Host ""
Write-Host "📝 Aktualizowanie apphosting.yaml..." -ForegroundColor Yellow
$apphostingContent = Get-Content "apphosting.yaml" -Raw

if ($apphostingContent -notmatch "cloudSql:") {
    Write-Host "  ⚠️  Sekcja cloudSql nie jest skonfigurowana" -ForegroundColor Yellow
} else {
    $apphostingContent = $apphostingContent -replace "# cloudSql:", "cloudSql:" -replace "#   connections:", "  connections:" -replace "#     - instance: PROJECT_ID:REGION:INSTANCE_NAME", "    - instance: ${projectId}:${region}:${instanceName}" -replace "#       # Example:.*", ""
    $apphostingContent | Set-Content "apphosting.yaml" -NoNewline
    Write-Host "  ✅ apphosting.yaml zaktualizowany" -ForegroundColor Green
}

Write-Host ""
Write-Host "✅ Konfiguracja zakończona!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Następne kroki:" -ForegroundColor Cyan
Write-Host "  1. Sprawdź apphosting.yaml - sekcja cloudSql powinna być odkomentowana" -ForegroundColor White
Write-Host "  2. Wdróż aplikację: git push origin main" -ForegroundColor White
Write-Host "  3. Sprawdź logi deployment w Firebase Console" -ForegroundColor White
Write-Host ""

