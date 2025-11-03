# ============================================
# SKRYPT DIAGNOSTYCZNY FIREBASE ADMIN SDK
# ============================================

Write-Host ""
Write-Host "╔══════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   DIAGNOSTYKA FIREBASE ADMIN SDK                        ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

$logFile = "logs\firebase-diagnostic-$(Get-Date -Format 'yyyy-MM-dd_HH-mm-ss').log"

if (-not (Test-Path "logs")) {
    New-Item -ItemType Directory -Path "logs" -Force | Out-Null
}

function Write-Log {
    param([string]$Message, [string]$Color = "White")
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logMessage = "[$timestamp] $Message"
    Write-Host $Message -ForegroundColor $Color
    $logMessage | Out-File -FilePath $logFile -Append -Encoding UTF8
}

# ============================================
# KROK 1: SPRAWDZENIE ŚRODOWISKA
# ============================================

Write-Host "═══════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "KROK 1: SPRAWDZENIE ŚRODOWISKA" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

$nodeVersion = node --version 2>$null
if ($nodeVersion) {
    Write-Log "✓ Node.js $nodeVersion" "Green"
} else {
    Write-Log "✗ Node.js nie jest zainstalowany!" "Red"
    exit 1
}

$npmVersion = npm --version 2>$null
if ($npmVersion) {
    Write-Log "✓ npm v$npmVersion" "Green"
} else {
    Write-Log "✗ npm nie jest zainstalowany!" "Red"
    exit 1
}

Write-Host ""

# ============================================
# KROK 2: SPRAWDZENIE PLIKÓW .ENV
# ============================================

Write-Host "═══════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "KROK 2: SPRAWDZENIE PLIKÓW .ENV" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

$envFiles = @(".env", ".env.local")
foreach ($envFile in $envFiles) {
    if (Test-Path $envFile) {
        $fileInfo = Get-Item $envFile
        Write-Log "✓ $envFile istnieje (Rozmiar: $($fileInfo.Length) bajtów)" "Green"
        
        $content = Get-Content $envFile -Raw
        
        if ($content -match "FIREBASE_PROJECT_ID=") {
            Write-Log "  ✓ FIREBASE_PROJECT_ID znaleziony" "Green"
        } else {
            Write-Log "  ✗ FIREBASE_PROJECT_ID brak" "Red"
        }
        
        if ($content -match "FIREBASE_CLIENT_EMAIL=") {
            Write-Log "  ✓ FIREBASE_CLIENT_EMAIL znaleziony" "Green"
        } else {
            Write-Log "  ✗ FIREBASE_CLIENT_EMAIL brak" "Red"
        }
        
        if ($content -match 'FIREBASE_PRIVATE_KEY="([^"]+)"') {
            $keyLength = $matches[1].Length
            if ($keyLength -gt 1600) {
                Write-Log "  ✓ FIREBASE_PRIVATE_KEY znaleziony (długość: $keyLength znaków)" "Green"
            } else {
                Write-Log "  ⚠ FIREBASE_PRIVATE_KEY znaleziony ale OBCIĘTY (długość: $keyLength znaków, powinien mieć ~1700)" "Yellow"
            }
        } else {
            Write-Log "  ✗ FIREBASE_PRIVATE_KEY brak" "Red"
        }
        
        Write-Host ""
    } else {
        Write-Log "⚠ $envFile nie istnieje" "Yellow"
    }
}

Write-Host ""

# ============================================
# KROK 3: SPRAWDZENIE PORTÓW
# ============================================

Write-Host "═══════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "KROK 3: SPRAWDZENIE PORTÓW" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

function Test-Port {
    param([int]$Port)
    try {
        $connection = Test-NetConnection -ComputerName localhost -Port $Port -WarningAction SilentlyContinue -InformationLevel Quiet
        return $connection
    } catch {
        return $false
    }
}

if (Test-Port -Port 3000) {
    Write-Log "⚠ Port 3000 jest zajęty" "Yellow"
} else {
    Write-Log "✓ Port 3000 jest wolny" "Green"
}

Write-Host ""

# ============================================
# KROK 4: CZYSZCZENIE CACHE
# ============================================

Write-Host "═══════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "KROK 4: CZYSZCZENIE CACHE" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

if (Test-Path ".next") {
    Remove-Item -Path ".next" -Recurse -Force
    Write-Log "✓ Folder .next usunięty" "Green"
} else {
    Write-Log "ℹ Folder .next nie istnieje" "Cyan"
}

Write-Host ""

# ============================================
# KROK 5: URUCHOMIENIE SERWERA
# ============================================

Write-Host "═══════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "KROK 5: URUCHOMIENIE SERWERA" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

Write-Log "ℹ Uruchamianie serwera..." "Cyan"

$serverLogFile = "logs\server-diagnostic.log"
$serverErrorFile = "logs\server-diagnostic-error.log"

$serverProcess = Start-Process -FilePath "npm" -ArgumentList "run", "dev" -PassThru -NoNewWindow -RedirectStandardOutput $serverLogFile -RedirectStandardError $serverErrorFile

Write-Log "✓ Serwer uruchomiony (PID: $($serverProcess.Id))" "Green"
Write-Log "ℹ Czekam 45 sekund na inicjalizację..." "Cyan"

# Czekaj na start serwera
$waited = 0
$maxWait = 45
$serverReady = $false

while ($waited -lt $maxWait) {
    if (Test-Port -Port 3000) {
        $serverReady = $true
        Write-Log "✓ Serwer odpowiada na porcie 3000!" "Green"
        break
    }
    Start-Sleep -Seconds 1
    $waited++
    if ($waited % 5 -eq 0) {
        Write-Host "." -NoNewline
    }
}

Write-Host ""

if (-not $serverReady) {
    Write-Log "✗ Serwer nie odpowiada po $maxWait sekundach!" "Red"
    Stop-Process -Id $serverProcess.Id -Force -ErrorAction SilentlyContinue
    exit 1
}

# Czekaj dodatkowe 5 sekund na inicjalizację Firebase
Write-Log "ℹ Czekam dodatkowe 5 sekund na inicjalizację Firebase..." "Cyan"
Start-Sleep -Seconds 5

Write-Host ""

# ============================================
# KROK 6: SPRAWDZENIE LOGÓW FIREBASE
# ============================================

Write-Host "═══════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "KROK 6: SPRAWDZENIE LOGÓW FIREBASE" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

if (Test-Path $serverLogFile) {
    $serverLogs = Get-Content $serverLogFile -Raw
    
    Write-Log "ℹ Analiza logów serwera..." "Cyan"
    Write-Host ""
    
    if ($serverLogs -match "Firebase Admin SDK initialized successfully") {
        Write-Log "✓✓✓ FIREBASE ADMIN SDK ZAINICJALIZOWANY POPRAWNIE! ✓✓✓" "Green"
    } elseif ($serverLogs -match "Firebase Admin SDK not initialized") {
        Write-Log "✗✗✗ FIREBASE ADMIN SDK NIE ZOSTAŁ ZAINICJALIZOWANY! ✗✗✗" "Red"
    } else {
        Write-Log "⚠ Nie znaleziono informacji o inicjalizacji Firebase w logach" "Yellow"
    }
    
    Write-Host ""
    
    if ($serverLogs -match "FIREBASE_PROJECT_ID:\s*(\w+)") {
        $status = $matches[1]
        if ($status -eq "SET") {
            Write-Log "✓ FIREBASE_PROJECT_ID jest ustawiony" "Green"
        } else {
            Write-Log "✗ FIREBASE_PROJECT_ID NIE jest ustawiony" "Red"
        }
    }
    
    if ($serverLogs -match "FIREBASE_CLIENT_EMAIL:\s*(\w+)") {
        $status = $matches[1]
        if ($status -eq "SET") {
            Write-Log "✓ FIREBASE_CLIENT_EMAIL jest ustawiony" "Green"
        } else {
            Write-Log "✗ FIREBASE_CLIENT_EMAIL NIE jest ustawiony" "Red"
        }
    }
    
    if ($serverLogs -match "FIREBASE_PRIVATE_KEY:\s*(\w+)") {
        $status = $matches[1]
        if ($status -eq "SET") {
            Write-Log "✓ FIREBASE_PRIVATE_KEY jest ustawiony" "Green"
        } else {
            Write-Log "✗ FIREBASE_PRIVATE_KEY NIE jest ustawiony" "Red"
        }
    }
    
    Write-Host ""
    Write-Host "═══════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host "OSTATNIE 30 LINII LOGÓW SERWERA:" -ForegroundColor Yellow
    Write-Host "═══════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host ""
    
    $logLines = $serverLogs -split "`n" | Select-Object -Last 30
    foreach ($line in $logLines) {
        Write-Host $line
    }
} else {
    Write-Log "✗ Nie znaleziono pliku logów serwera!" "Red"
}

Write-Host ""

# ============================================
# KROK 7: TEST ENDPOINTÓW
# ============================================

Write-Host "═══════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "KROK 7: TEST ENDPOINTÓW" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

function Test-Endpoint {
    param([string]$Url, [string]$Name)
    
    try {
        $response = Invoke-WebRequest -Uri $Url -Method GET -TimeoutSec 5 -UseBasicParsing
        Write-Log "✓ $Name - Status: $($response.StatusCode)" "Green"
        return $true
    } catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        if ($statusCode) {
            Write-Log "⚠ $Name - Status: $statusCode" "Yellow"
        } else {
            Write-Log "✗ $Name - Błąd: $($_.Exception.Message)" "Red"
        }
        return $false
    }
}

Test-Endpoint -Url "http://localhost:3000/" -Name "Strona główna"
Test-Endpoint -Url "http://localhost:3000/api/metrics" -Name "API Metrics"
Test-Endpoint -Url "http://localhost:3000/auth/register" -Name "Strona rejestracji"

Write-Host ""

# ============================================
# PODSUMOWANIE
# ============================================

Write-Host "═══════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "PODSUMOWANIE" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

Write-Log "ℹ Log zapisany w: $logFile" "Cyan"
Write-Log "ℹ Logi serwera w: $serverLogFile" "Cyan"
Write-Host ""

Write-Host "Serwer nadal działa (PID: $($serverProcess.Id))" -ForegroundColor Yellow
Write-Host ""
$answer = Read-Host "Czy zamknąć serwer? (T/N)"

if ($answer -eq "T" -or $answer -eq "t" -or $answer -eq "Y" -or $answer -eq "y") {
    Write-Log "ℹ Zamykanie serwera..." "Cyan"
    Stop-Process -Id $serverProcess.Id -Force -ErrorAction SilentlyContinue
    Write-Log "✓ Serwer zamknięty" "Green"
} else {
    Write-Log "ℹ Serwer pozostaje uruchomiony" "Cyan"
    Write-Host "Aby zamknąć serwer później, użyj: Stop-Process -Id $($serverProcess.Id)" -ForegroundColor Yellow
}

Write-Host ""
Write-Log "✓ Diagnostyka zakończona!" "Green"
Write-Host ""

