# Utworz sekrety w Cloud Secret Manager dla Firebase App Hosting
# Wartosci z env.production

$PROJECT_ID = "m-t-m-62972"
$CLOUD_SQL_INSTANCE = "m-t-m-62972:europe-west4:m-t-m-62972-instance"

Write-Host "Tworze sekrety w Cloud Secret Manager..." -ForegroundColor Cyan

# 1. DATABASE_URL - format dla Cloud SQL Unix socket
# Wymaga: nazwa bazy, uzytkownik, haslo
Write-Host "`n1. DATABASE_URL" -ForegroundColor Yellow
Write-Host "   Format: postgresql://USER:PASSWORD@/DBNAME?host=/cloudsql/INSTANCE" -ForegroundColor Gray
$dbUser = Read-Host "   Wprowadz uzytkownika bazy danych"
$dbPassword = Read-Host "   Wprowadz haslo bazy danych" -AsSecureString
$dbPasswordPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($dbPassword))
$dbName = Read-Host "   Wprowadz nazwe bazy danych (domyslnie: palkamtm_production)"
if ([string]::IsNullOrWhiteSpace($dbName)) {
    $dbName = "palkamtm_production"
}

$databaseUrl = "postgresql://${dbUser}:${dbPasswordPlain}@/${dbName}?host=/cloudsql/${CLOUD_SQL_INSTANCE}"
echo $databaseUrl | gcloud secrets create database-url --data-file=- --project=$PROJECT_ID 2>&1 | Out-Null
if ($LASTEXITCODE -eq 0) {
    Write-Host "   Utworzono secret 'database-url'" -ForegroundColor Green
} else {
    echo $databaseUrl | gcloud secrets versions add database-url --data-file=- --project=$PROJECT_ID 2>&1 | Out-Null
    Write-Host "   Zaktualizowano secret 'database-url'" -ForegroundColor Green
}

# 2. FIREBASE_PROJECT_ID
Write-Host "`n2. FIREBASE_PROJECT_ID" -ForegroundColor Yellow
echo "m-t-m-62972" | gcloud secrets create firebase-project-id --data-file=- --project=$PROJECT_ID 2>&1 | Out-Null
if ($LASTEXITCODE -eq 0) {
    Write-Host "   Utworzono secret 'firebase-project-id'" -ForegroundColor Green
} else {
    echo "m-t-m-62972" | gcloud secrets versions add firebase-project-id --data-file=- --project=$PROJECT_ID 2>&1 | Out-Null
    Write-Host "   Zaktualizowano secret 'firebase-project-id'" -ForegroundColor Green
}

# 3. FIREBASE_CLIENT_EMAIL
Write-Host "`n3. FIREBASE_CLIENT_EMAIL" -ForegroundColor Yellow
echo "firebase-adminsdk-fbsvc@m-t-m-62972.iam.gserviceaccount.com" | gcloud secrets create firebase-client-email --data-file=- --project=$PROJECT_ID 2>&1 | Out-Null
if ($LASTEXITCODE -eq 0) {
    Write-Host "   Utworzono secret 'firebase-client-email'" -ForegroundColor Green
} else {
    echo "firebase-adminsdk-fbsvc@m-t-m-62972.iam.gserviceaccount.com" | gcloud secrets versions add firebase-client-email --data-file=- --project=$PROJECT_ID 2>&1 | Out-Null
    Write-Host "   Zaktualizowano secret 'firebase-client-email'" -ForegroundColor Green
}

# 4. FIREBASE_PRIVATE_KEY
Write-Host "`n4. FIREBASE_PRIVATE_KEY" -ForegroundColor Yellow
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
    Write-Host "   Utworzono secret 'firebase-private-key'" -ForegroundColor Green
} else {
    echo $privateKey | gcloud secrets versions add firebase-private-key --data-file=- --project=$PROJECT_ID 2>&1 | Out-Null
    Write-Host "   Zaktualizowano secret 'firebase-private-key'" -ForegroundColor Green
}

# 5. NEXTAUTH_SECRET
Write-Host "`n5. NEXTAUTH_SECRET" -ForegroundColor Yellow
Write-Host "   Generuje losowy secret..." -ForegroundColor Gray
$nextAuthSecret = [Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
echo $nextAuthSecret | gcloud secrets create nextauth-secret --data-file=- --project=$PROJECT_ID 2>&1 | Out-Null
if ($LASTEXITCODE -eq 0) {
    Write-Host "   Utworzono secret 'nextauth-secret'" -ForegroundColor Green
    Write-Host "   Wygenerowany secret: $nextAuthSecret" -ForegroundColor Cyan
} else {
    echo $nextAuthSecret | gcloud secrets versions add nextauth-secret --data-file=- --project=$PROJECT_ID 2>&1 | Out-Null
    Write-Host "   Zaktualizowano secret 'nextauth-secret'" -ForegroundColor Green
}

Write-Host "`nZakonczono tworzenie secretow!" -ForegroundColor Green
Write-Host "`nNastepny krok: Uruchom .\scripts\grant-secrets-access.ps1 aby przyznac dostep" -ForegroundColor Cyan

