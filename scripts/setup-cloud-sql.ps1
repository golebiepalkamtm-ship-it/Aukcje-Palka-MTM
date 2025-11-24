# Automatyczna konfiguracja Cloud SQL PostgreSQL dla Firebase App Hosting
# Wymagania: Włączony billing w projekcie m-t-m-62972

$PROJECT_ID = "m-t-m-62972"
$REGION = "europe-central2"
$INSTANCE_NAME = "palka-mtm-db"
$DATABASE_NAME = "palkamtm_production"
$DB_USER = "palkamtm_user"
$CONNECTION_NAME = "$PROJECT_ID`:$REGION`:$INSTANCE_NAME"

Write-Host "🚀 Rozpoczynam automatyczną konfigurację Cloud SQL PostgreSQL..." -ForegroundColor Cyan

# Sprawdź czy billing jest włączony
Write-Host "`n📋 Sprawdzam status billing..." -ForegroundColor Yellow
$billingEnabled = gcloud beta billing projects describe $PROJECT_ID --format="value(billingEnabled)" 2>&1
if ($billingEnabled -ne "True") {
    Write-Host "❌ Billing nie jest włączony!" -ForegroundColor Red
    Write-Host "   Włącz billing: https://console.cloud.google.com/billing?project=$PROJECT_ID" -ForegroundColor Yellow
    exit 1
}
Write-Host "✅ Billing jest włączony" -ForegroundColor Green

# Sprawdź czy instancja już istnieje
Write-Host "`n📋 Sprawdzam czy instancja już istnieje..." -ForegroundColor Yellow
$existingInstance = gcloud sql instances describe $INSTANCE_NAME --project=$PROJECT_ID 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "⚠️  Instancja $INSTANCE_NAME już istnieje" -ForegroundColor Yellow
    $createInstance = Read-Host "Czy chcesz utworzyć nową instancję? (t/n)"
    if ($createInstance -ne "t") {
        Write-Host "Używam istniejącej instancji..." -ForegroundColor Yellow
    } else {
        Write-Host "Usuwam istniejącą instancję..." -ForegroundColor Yellow
        gcloud sql instances delete $INSTANCE_NAME --project=$PROJECT_ID --quiet
        Start-Sleep -Seconds 5
    }
}

# Utwórz Cloud SQL instance
if ($createInstance -eq "t" -or $LASTEXITCODE -ne 0) {
    Write-Host "`n🗄️  Tworzę Cloud SQL instance..." -ForegroundColor Yellow
    $dbPassword = -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 16 | ForEach-Object {[char]$_})
    
    gcloud sql instances create $INSTANCE_NAME `
        --database-version=POSTGRES_15 `
        --tier=db-f1-micro `
        --region=$REGION `
        --storage-type=SSD `
        --storage-size=20GB `
        --backup `
        --root-password=$dbPassword `
        --project=$PROJECT_ID
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Błąd podczas tworzenia instancji!" -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ Instancja utworzona" -ForegroundColor Green
    Write-Host "   Root password: $dbPassword" -ForegroundColor Cyan
    Write-Host "   ZAPISZ TO HASŁO!" -ForegroundColor Red
} else {
    Write-Host "⚠️  Używam istniejącej instancji. Musisz znać hasło root." -ForegroundColor Yellow
    $dbPassword = Read-Host "Wprowadź root password (lub naciśnij Enter jeśli nie znasz)"
}

# Utwórz bazę danych
Write-Host "`n📊 Tworzę bazę danych..." -ForegroundColor Yellow
gcloud sql databases create $DATABASE_NAME --instance=$INSTANCE_NAME --project=$PROJECT_ID 2>&1 | Out-Null
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Baza danych utworzona" -ForegroundColor Green
} else {
    Write-Host "⚠️  Baza danych może już istnieć" -ForegroundColor Yellow
}

# Utwórz użytkownika
Write-Host "`n👤 Tworzę użytkownika bazy danych..." -ForegroundColor Yellow
$userPassword = -join ((48..57) + (65..90) + (97..122) + (33..47) | Get-Random -Count 20 | ForEach-Object {[char]$_})
gcloud sql users create $DB_USER --instance=$INSTANCE_NAME --password=$userPassword --project=$PROJECT_ID 2>&1 | Out-Null
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Użytkownik utworzony" -ForegroundColor Green
    Write-Host "   Username: $DB_USER" -ForegroundColor Cyan
    Write-Host "   Password: $userPassword" -ForegroundColor Cyan
    Write-Host "   ZAPISZ TO HASŁO!" -ForegroundColor Red
} else {
    Write-Host "⚠️  Użytkownik może już istnieć. Ustawiam nowe hasło..." -ForegroundColor Yellow
    gcloud sql users set-password $DB_USER --instance=$INSTANCE_NAME --password=$userPassword --project=$PROJECT_ID 2>&1 | Out-Null
    Write-Host "✅ Hasło zaktualizowane" -ForegroundColor Green
}

# Generuj NEXTAUTH_SECRET
Write-Host "`n🔐 Generuję NEXTAUTH_SECRET..." -ForegroundColor Yellow
$nextAuthSecret = [Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
Write-Host "✅ NEXTAUTH_SECRET wygenerowany" -ForegroundColor Green

# Utwórz sekrety w Cloud Secret Manager
Write-Host "`n🔒 Tworzę sekrety w Cloud Secret Manager..." -ForegroundColor Yellow

# DATABASE_URL
$databaseUrl = "postgresql://${DB_USER}:${userPassword}@/${DATABASE_NAME}?host=/cloudsql/${CONNECTION_NAME}"
echo $databaseUrl | gcloud secrets create database-url --data-file=- --project=$PROJECT_ID 2>&1 | Out-Null
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Secret 'database-url' utworzony" -ForegroundColor Green
} else {
    echo $databaseUrl | gcloud secrets versions add database-url --data-file=- --project=$PROJECT_ID 2>&1 | Out-Null
    Write-Host "✅ Secret 'database-url' zaktualizowany" -ForegroundColor Green
}

# FIREBASE_PROJECT_ID
echo "m-t-m-62972" | gcloud secrets create firebase-project-id --data-file=- --project=$PROJECT_ID 2>&1 | Out-Null
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Secret 'firebase-project-id' utworzony" -ForegroundColor Green
} else {
    echo "m-t-m-62972" | gcloud secrets versions add firebase-project-id --data-file=- --project=$PROJECT_ID 2>&1 | Out-Null
    Write-Host "✅ Secret 'firebase-project-id' zaktualizowany" -ForegroundColor Green
}

# FIREBASE_CLIENT_EMAIL
echo "firebase-adminsdk-fbsvc@m-t-m-62972.iam.gserviceaccount.com" | gcloud secrets create firebase-client-email --data-file=- --project=$PROJECT_ID 2>&1 | Out-Null
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Secret 'firebase-client-email' utworzony" -ForegroundColor Green
} else {
    echo "firebase-adminsdk-fbsvc@m-t-m-62972.iam.gserviceaccount.com" | gcloud secrets versions add firebase-client-email --data-file=- --project=$PROJECT_ID 2>&1 | Out-Null
    Write-Host "✅ Secret 'firebase-client-email' zaktualizowany" -ForegroundColor Green
}

# FIREBASE_PRIVATE_KEY
$privateKey = @"
-----BEGIN PRIVATE KEY-----
MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCcRe0BslSnISuR
FcisDVbgkNvz3jekt/z9KI6LsR4ddyBfyH2up0BcEvLuNXwUTsTKxmTSbn1HoG7m
nzDIJrzwL0xLBhzujhAbCfPg0nHYqifiVu0QY27nGh+2MltN9q99rDcdVQfVDSsj
XwiD1py2oX1l5o6PeKsifenacG5tATcexfjnPuxxLdTFyF1LhgMwVNyoPKOvpEsd
bGG8pWtAXW5xiyJTvHcYI5T0I8oLugNCKYazEWbD0Cz5ZCWUDFuo7jHitU+PYhvN
svEiDMySOhmjvdHqR+JvvcBxOnS9241KjTbeZ1adaFLg1E+FxQVfBOkJuJQY4ylX
vHSrXss9AgMBAAECggEAQfUtlJK9MhFI/yKPoTa8HWpmu6ZmG+rgJ8XPbFxkVpFq
I6NOkMHc4z/IMwx2A2g/nUphUYP68plfVY2JHGFlS4bbD6tT2MgzOgZYXeLU1Fr1
HI4N3uXo8DfRfKgCa4ScC1H9rS6vcJfvRi2dPW/+kwLUF4dZUmre6F72rhDYOr8o
hEQW3LAAgBdm40xWJo8gIRKKtGM7xl0o2CCrilt7XY0DqZrZVnYrNOrphCCt7e4g
hkhzhDnL5P5Q6B4Vc0kY2xg3/c9Hb5QnBHzMV/N7d6rl3zMrQ7t9B7R8s0BudKRH
5qtnBr3VjMzYolmpDAp626r55MjPqG2IWdBoSANRzQKBgQDSQCeKegcfM+g2UIOL
PDwae4PR3BRTOdyvGMcv+lxeXXXE/b2ostiaKKimTKHtRCizozFz7v3gR6MHCCtP
ZqPh3Hya5r0HpslSN2j028wKi2Zj144tWCzyHjArZOsUBXJrh3b/RLrVhobOggDs
MS4JJUDh+PAM5isX6B+V4Bf6HwKBgQC+Rv/Wi+F4XvhQG9rnOgZ7Cwdx0IRhb/Mi
IzpeOCC9D/3HeDQHfnwjGJugNZiXibdv4TmjDYxPXWIiK+hQTT1rrt+jm5F3Qgyg
J/tBaTEc/eSDFsx9oIIWPk6sQKeUbUXDjCyzPpj7oxIS1FLE1WnJBFH3BQ9hLT9i
24I72SdHIwKBgQDDA+apNw6sDoVw+7VHzJMjLTXTzgK8P4tGjgETq3FJxf6avZDR
jTIDq3ri5Wm8nd/y34fbNO4evdOljho+B8IymUSqmSL0metaazLbC5Ryo2JRcXra
7FKkMQQU/AJgC71Zp8jkdWem7qTTnxoj+mns6bUI5NIj5MpL3m6NodIbmQKBgQC4
ccp+BopBTI4X2WiQy8aMb1yAD0jDyuk8JjnmKzJRErdGLFcDDLD4tFnnKw0HmA+g
/AoK7I8eP79osHc5oCXxxEo1JhAUMopalWcROQ7Ks7JXADqpbHWtaiiJAQNw9Zuy
uqZ5+iwBgUl7xyWUd+tbWDy73sPRxzKyeWX87bsNUQKBgEuRLuP3I2yJP1GzDClB
3a0bc19XuXaGmxn0LBzHfqiqkq6lymWUIlFH5r+jibP9dDyvSHE9GWCkmVdfVhAf
ZUhXKc+ChCX0EWEb90+LhpIIY2pMZGg4gVn6NAW/xV3pyueGdDm1ciBPisrqWHMj
JkH3fKiQfGi52ouES8nVl/tL
-----END PRIVATE KEY-----
"@
echo $privateKey | gcloud secrets create firebase-private-key --data-file=- --project=$PROJECT_ID 2>&1 | Out-Null
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Secret 'firebase-private-key' utworzony" -ForegroundColor Green
} else {
    echo $privateKey | gcloud secrets versions add firebase-private-key --data-file=- --project=$PROJECT_ID 2>&1 | Out-Null
    Write-Host "✅ Secret 'firebase-private-key' zaktualizowany" -ForegroundColor Green
}

# NEXTAUTH_SECRET
echo $nextAuthSecret | gcloud secrets create nextauth-secret --data-file=- --project=$PROJECT_ID 2>&1 | Out-Null
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Secret 'nextauth-secret' utworzony" -ForegroundColor Green
} else {
    echo $nextAuthSecret | gcloud secrets versions add nextauth-secret --data-file=- --project=$PROJECT_ID 2>&1 | Out-Null
    Write-Host "✅ Secret 'nextauth-secret' zaktualizowany" -ForegroundColor Green
}

# Nadaj uprawnienia do App Hosting service account
Write-Host "`n🔑 Nadaję uprawnienia do sekretów..." -ForegroundColor Yellow
$BACKEND_ID = "palkamtm"

# Użyj Firebase CLI do przyznania dostępu (zalecane)
$secrets = @("database-url", "firebase-project-id", "firebase-client-email", "firebase-private-key", "nextauth-secret")
foreach ($secret in $secrets) {
    Write-Host "   Przyznaję dostęp do: $secret" -ForegroundColor Gray
    firebase apphosting:secrets:grantaccess `
        --backend=$BACKEND_ID `
        --secret=$secret `
        --project=$PROJECT_ID 2>&1 | Out-Null
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ $secret" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  $secret - może już mieć dostęp" -ForegroundColor Yellow
    }
}

Write-Host "✅ Uprawnienia nadane" -ForegroundColor Green

# Zaktualizuj apphosting.yaml
Write-Host "`n📝 Aktualizuję apphosting.yaml..." -ForegroundColor Yellow
$apphostingYaml = Get-Content "apphosting.yaml" -Raw
if ($apphostingYaml -notmatch "cloudSql:") {
    $cloudSqlConfig = @"

# Cloud SQL connection configuration
cloudSql:
  connections:
    - instance: $CONNECTION_NAME
"@
    $apphostingYaml = $apphostingYaml -replace "# Cloud SQL connection configuration", $cloudSqlConfig
    $apphostingYaml = $apphostingYaml -replace "# Uncomment and configure after creating Cloud SQL instance:", ""
    $apphostingYaml = $apphostingYaml -replace "# - instance: PROJECT_ID:REGION:INSTANCE_NAME", ""
    $apphostingYaml = $apphostingYaml -replace "#       # Example: m-t-m-62972:europe-central2:palka-mtm-db", ""
    Set-Content -Path "apphosting.yaml" -Value $apphostingYaml
    Write-Host "✅ apphosting.yaml zaktualizowany" -ForegroundColor Green
} else {
    Write-Host "⚠️  apphosting.yaml już ma konfigurację cloudSql" -ForegroundColor Yellow
}

Write-Host "`n✅ Konfiguracja zakończona!" -ForegroundColor Green
Write-Host "`n📋 Podsumowanie:" -ForegroundColor Cyan
Write-Host "   Instance: $INSTANCE_NAME" -ForegroundColor White
Write-Host "   Connection: $CONNECTION_NAME" -ForegroundColor White
Write-Host "   Database: $DATABASE_NAME" -ForegroundColor White
Write-Host "   User: $DB_USER" -ForegroundColor White
Write-Host "   User Password: $userPassword" -ForegroundColor Yellow
Write-Host "   Root Password: $dbPassword" -ForegroundColor Yellow
Write-Host "`n⚠️  ZAPISZ HASŁA!" -ForegroundColor Red
Write-Host "`n🚀 Następny krok: git add apphosting.yaml && git commit -m 'Configure Cloud SQL' && git push" -ForegroundColor Cyan
