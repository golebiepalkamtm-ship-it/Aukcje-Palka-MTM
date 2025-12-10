
# Zabij wszystkie procesy Node.js
Write-Host "Zamykam wszystkie procesy Node.js..."
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force

# Znajdź i zabij procesy na porcie 3000
Write-Host "Zwalniam port 3000..."
$port3000 = netstat -ano | findstr ":3000"
if ($port3000) {
    $port3000 | ForEach-Object {
        if ($_ -match '\s+(\d+)) {
            $pid = $matches[1]
            Write-Host "Zamykam PID: $pid"
            taskkill /F /PID $pid 2>$null
        }
    }
}

Write-Host "Gotowe!"
taskkill /F /IM node.exe