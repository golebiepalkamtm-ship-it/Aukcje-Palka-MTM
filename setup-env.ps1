# ================================
# Pałka MTM - Complete Environment Setup
# ================================
# PowerShell script to configure all environment variables and services

param(
    [Parameter(Position=0)]
    [ValidateSet('setup', 'verify', 'start-services', 'stop-services', 'status')]
    [string]$Command = 'setup'
)

# Colors for output
$Colors = @{
    Green  = "`e[32m"
    Red    = "`e[31m"
    Yellow = "`e[33m"
    Blue   = "`e[34m"
    Cyan   = "`e[36m"
    Reset  = "`e[0m"
}

function Print-Header {
    param([string]$Text)
    Write-Host "$($Colors.Blue)━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━$($Colors.Reset)"
    Write-Host "$($Colors.Blue)$Text$($Colors.Reset)"
    Write-Host "$($Colors.Blue)━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━$($Colors.Reset)"
}

function Print-Success {
    param([string]$Text)
    Write-Host "$($Colors.Green)✓ $Text$($Colors.Reset)"
}

function Print-Error {
    param([string]$Text)
    Write-Host "$($Colors.Red)✗ $Text$($Colors.Reset)"
}

function Print-Info {
    param([string]$Text)
    Write-Host "$($Colors.Yellow)ℹ $Text$($Colors.Reset)"
}

function Print-Step {
    param([string]$Text)
    Write-Host "$($Colors.Cyan)➤ $Text$($Colors.Reset)"
}

# Function to check if environment variable exists
function Test-EnvironmentVariable {
    param([string]$Name)
    return [Environment]::GetEnvironmentVariable($Name, "User") -or [Environment]::GetEnvironmentVariable($Name, "Machine")
}

# Function to set user environment variable
function Set-UserEnvironmentVariable {
    param([string]$Name, [string]$Value)
    [Environment]::SetEnvironmentVariable($Name, $Value, "User")
    Print-Success "Set environment variable: $Name"
}

function Setup-EnvironmentVariables {
    Print-Header "Environment Variables Configuration"

    Print-Step "Checking existing environment variables..."

    # List of required environment variables
    $requiredVars = @(
        @{Name="POSTGRES_USER"; Value="MTM"; Description="PostgreSQL User"},
        @{Name="POSTGRES_PASSWORD"; Value="Milosz1205"; Description="PostgreSQL Password"},
        @{Name="POSTGRES_DB"; Value="palka_core_prod"; Description="Database Name"},
        @{Name="REDIS_PASSWORD"; Value="ChangeMeRedis123!"; Description="Redis Password"},
        @{Name="GRAFANA_ADMIN_USER"; Value="admin"; Description="Grafana Admin User"},
        @{Name="GRAFANA_ADMIN_PASSWORD"; Value="admin123"; Description="Grafana Admin Password"},
        @{Name="NEXT_PUBLIC_APP_URL"; Value="https://mtm--m-t-m-62972.europe-west4.hosted.app"; Description="Next.js App URL"}
    )

    $missingVars = @()
    foreach ($var in $requiredVars) {
        if (-not (Test-EnvironmentVariable $var.Name)) {
            $missingVars += $var
        } else {
            Print-Success "$($var.Description): $($var.Name) = already set"
        }
    }

    if ($missingVars.Count -gt 0) {
        Print-Info "Found $($missingVars.Count) variables to set"
        foreach ($var in $missingVars) {
            Print-Step "Setting $($var.Description)..."
            Set-UserEnvironmentVariable $var.Name $var.Value
        }
    } else {
        Print-Success "All required environment variables are already set"
    }

    # Additional Firebase variables
    Print-Step "Configuring Firebase variables..."
    $firebaseVars = @(
        @{Name="FIREBASE_PROJECT_ID"; Value="m-t-m-62972"},
        @{Name="FIREBASE_CLIENT_EMAIL"; Value="firebase-adminsdk-fbsvc@m-t-m-62972.iam.gserviceaccount.com"},
        @{Name="NEXT_PUBLIC_FIREBASE_PROJECT_ID"; Value="m-t-m-62972"}
    )

    foreach ($var in $firebaseVars) {
        if (-not (Test-EnvironmentVariable $var.Name)) {
            Set-UserEnvironmentVariable $var.Name $var.Value
        }
    }
}

function Setup-FirebaseServices {
    Print-Header "Firebase Services Configuration"

    Print-Step "Checking Firebase configuration..."
    try {
        $firebaseConfig = Get-Content "firebase.json" -ErrorAction Stop | ConvertFrom-Json
        Print-Success "Firebase configuration is valid"
    } catch {
        Print-Error "Error in Firebase configuration: $($_.Exception.Message)"
        return
    }

    Print-Step "Checking available Firebase backends..."
    try {
        $backends = & npx firebase-tools apphosting:backends:list --project m-t-m-62972 2>$null
        if ($LASTEXITCODE -eq 0) {
            Print-Success "Firebase App Hosting is configured"
        } else {
            Print-Error "Issue with Firebase App Hosting"
        }
    } catch {
        Print-Error "Cannot check Firebase backends: $($_.Exception.Message)"
    }
}

function Setup-DockerServices {
    Print-Header "Docker Services Configuration"

    Print-Step "Checking Docker availability..."
    try {
        $dockerVersion = docker --version
        Print-Success "Docker is available: $dockerVersion"
    } catch {
        Print-Error "Docker is not installed or not available"
        return
    }

    Print-Step "Checking docker-compose..."
    try {
        $composeVersion = docker-compose --version
        Print-Success "Docker Compose is available: $composeVersion"
    } catch {
        Print-Error "Docker Compose is not available"
        return
    }

    Print-Step "Checking docker-compose.prod.yml file..."
    if (Test-Path "docker-compose.prod.yml") {
        Print-Success "docker-compose.prod.yml file exists"
    } else {
        Print-Error "Missing docker-compose.prod.yml file"
        return
    }
}

function Start-Services {
    Print-Header "Starting Services"

    Print-Step "Starting Docker services (PostgreSQL, Redis, Prometheus, Grafana)..."
    try {
        docker-compose -f docker-compose.prod.yml up -d postgres redis prometheus grafana
        if ($LASTEXITCODE -eq 0) {
            Print-Success "Docker services have been started"
        } else {
            Print-Error "Error starting Docker services"
        }
    } catch {
        Print-Error "Cannot start Docker services: $($_.Exception.Message)"
    }

    Print-Step "Waiting for services to start..."
    Start-Sleep -Seconds 10

    Print-Step "Checking services status..."
    try {
        $status = docker-compose -f docker-compose.prod.yml ps
        Print-Info "Docker services status:"
        Write-Host $status
    } catch {
        Print-Error "Cannot check services status"
    }
}

function Stop-Services {
    Print-Header "Stopping Services"

    Print-Step "Stopping Docker services..."
    try {
        docker-compose -f docker-compose.prod.yml down
        if ($LASTEXITCODE -eq 0) {
            Print-Success "Docker services have been stopped"
        } else {
            Print-Error "Error stopping Docker services"
        }
    } catch {
        Print-Error "Cannot stop Docker services: $($_.Exception.Message)"
    }
}

function Get-ServiceStatus {
    Print-Header "Services Status"

    Print-Step "Checking environment variables..."
    $envVars = @("POSTGRES_USER", "POSTGRES_PASSWORD", "POSTGRES_DB", "REDIS_PASSWORD", "GRAFANA_ADMIN_USER", "NEXT_PUBLIC_APP_URL")
    foreach ($var in $envVars) {
        $value = [Environment]::GetEnvironmentVariable($var, "User")
        if ($value) {
            Print-Success "$var = $value"
        } else {
            Print-Error "$var = NOT SET"
        }
    }

    Print-Step "Checking Docker services..."
    try {
        $status = docker-compose -f docker-compose.prod.yml ps
        Write-Host $status
    } catch {
        Print-Error "Cannot check Docker services status"
    }

    Print-Step "Checking Firebase..."
    try {
        $backends = & npx firebase-tools apphosting:backends:list --project m-t-m-62972 2>$null
        if ($LASTEXITCODE -eq 0) {
            Print-Success "Firebase App Hosting is available"
        } else {
            Print-Error "Issue with Firebase App Hosting"
        }
    } catch {
        Print-Error "Firebase is not available"
    }
}

function Verify-Setup {
    Print-Header "Complete Configuration Verification"

    $allGood = $true

    # Check environment variables
    Print-Step "Verifying environment variables..."
    $requiredVars = @("POSTGRES_USER", "POSTGRES_PASSWORD", "POSTGRES_DB", "REDIS_PASSWORD", "GRAFANA_ADMIN_USER", "NEXT_PUBLIC_APP_URL")
    foreach ($var in $requiredVars) {
        if (-not (Test-EnvironmentVariable $var)) {
            Print-Error "Missing environment variable: $var"
            $allGood = $false
        }
    }

    # Check configuration files
    Print-Step "Verifying configuration files..."
    $configFiles = @(".env", ".env.local", ".env.prod", "firebase.json", "docker-compose.prod.yml")
    foreach ($file in $configFiles) {
        if (Test-Path $file) {
            Print-Success "File $file exists"
        } else {
            Print-Error "Missing file: $file"
            $allGood = $false
        }
    }

    # Check Docker
    Print-Step "Verifying Docker..."
    try {
        $null = docker --version
        Print-Success "Docker is available"
    } catch {
        Print-Error "Docker is not available"
        $allGood = $false
    }

    # Check Firebase
    Print-Step "Verifying Firebase..."
    try {
        $backends = & npx firebase-tools apphosting:backends:list --project m-t-m-62972 2>$null
        if ($LASTEXITCODE -eq 0) {
            Print-Success "Firebase is configured"
        } else {
            Print-Error "Issue with Firebase"
            $allGood = $false
        }
    } catch {
        Print-Error "Firebase is not available"
        $allGood = $false
    }

    if ($allGood) {
        Print-Success "Configuration is complete and ready to use!"
        Print-Info "You can now run the application:"
        Print-Info "  - Start services: .\setup-env.ps1 start-services"
        Print-Info "  - Build application: npm run build"
        Print-Info "  - Deploy Firebase: npm run deploy:firebase"
    } else {
        Print-Error "Configuration needs fixes"
    }
}

# Main script logic
switch ($Command) {
    "setup" {
        Setup-EnvironmentVariables
        Setup-FirebaseServices
        Setup-DockerServices
        Print-Info "Setup completed. Run '.\setup-env.ps1 verify' to check correctness."
    }
    "verify" {
        Verify-Setup
    }
    "start-services" {
        Start-Services
    }
    "stop-services" {
        Stop-Services
    }
    "status" {
        Get-ServiceStatus
    }
    default {
        Print-Error "Unknown command: $Command"
        Print-Info "Available commands: setup, verify, start-services, stop-services, status"
    }
}