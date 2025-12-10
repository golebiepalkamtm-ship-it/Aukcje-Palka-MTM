
Write-Host "=== SZUKANIE CZARNYCH ELEMENTÓW ===" -ForegroundColor Cyan
Write-Host ""

$patterns = @(
    "bg-black",
    "bg-gray-900", 
    "bg-slate-900",
    "bg-zinc-900",
    "border-black",
    "shadow-black",
    "backdrop-blur.*bg-black"
)

$files = Get-ChildItem -Path "app","components" -Recurse -Include "*.tsx","*.ts","*.css" -File

$found = @()

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    
    foreach ($pattern in $patterns) {
        if ($content -match $pattern) {
            $found += [PSCustomObject]@{
                File = $file.FullName.Replace($PWD.Path, ".")
                Pattern = $pattern
            }
            break
        }
    }
}

if ($found.Count -gt 0) {
    Write-Host "Znaleziono $($found.Count) plików z czarnymi elementami:" -ForegroundColor Yellow
    $found | Format-Table -AutoSize
} else {
    Write-Host "Nie znaleziono czarnych elementów" -ForegroundColor Green
}
