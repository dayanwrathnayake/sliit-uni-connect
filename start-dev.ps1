# ─────────────────────────────────────────────────────────────────────────────
# start-dev.ps1  —  SLIIT UNI Connect dev startup script
# Run from the project root:  .\start-dev.ps1
# ─────────────────────────────────────────────────────────────────────────────

Write-Host ""
Write-Host "  SLIIT UNI Connect — Dev Startup" -ForegroundColor Cyan
Write-Host "  ─────────────────────────────────" -ForegroundColor DarkGray

# ── 1. Kill anything on port 8080 (backend) ──────────────────────────────────
$pids8080 = Get-NetTCPConnection -LocalPort 8080 -State Listen -ErrorAction SilentlyContinue |
            Select-Object -ExpandProperty OwningProcess -Unique
if ($pids8080) {
    foreach ($pid in $pids8080) {
        Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
        Write-Host "  [backend] Killed old process PID $pid on :8080" -ForegroundColor Yellow
    }
    Start-Sleep -Milliseconds 800
} else {
    Write-Host "  [backend] Port 8080 is free" -ForegroundColor Green
}

# ── 2. Kill anything on ports 5173–5176 (Vite) ───────────────────────────────
5173..5176 | ForEach-Object {
    $vPids = Get-NetTCPConnection -LocalPort $_ -State Listen -ErrorAction SilentlyContinue |
             Select-Object -ExpandProperty OwningProcess -Unique
    if ($vPids) {
        foreach ($vpid in $vPids) {
            Stop-Process -Id $vpid -Force -ErrorAction SilentlyContinue
            Write-Host "  [frontend] Killed old process PID $vpid on :$_" -ForegroundColor Yellow
        }
    }
}
Write-Host "  [frontend] Vite ports cleared" -ForegroundColor Green

# ── 3. Start Backend in a new window ─────────────────────────────────────────
Write-Host ""
Write-Host "  Starting backend  (http://localhost:8080)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "cd '$PSScriptRoot\backend'; Write-Host '  [BACKEND] Starting Spring Boot...' -ForegroundColor Cyan; .\mvnw.cmd spring-boot:run"
) -WindowStyle Normal

# ── 4. Start Frontend in a new window ────────────────────────────────────────
Write-Host "  Starting frontend (http://localhost:5173)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "cd '$PSScriptRoot\frontend'; Write-Host '  [FRONTEND] Starting Vite...' -ForegroundColor Cyan; npm run dev"
) -WindowStyle Normal

Write-Host ""
Write-Host "  Both servers starting in new windows." -ForegroundColor Green
Write-Host "  Backend:  http://localhost:8080" -ForegroundColor White
Write-Host "  Frontend: http://localhost:5173" -ForegroundColor White
Write-Host ""
