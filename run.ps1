$ErrorActionPreference = "Stop"

$root = $PSScriptRoot
$backend = Join-Path $root "backend"
$frontend = Join-Path $root "frontend"
$venvActivate = Join-Path $backend "venv\Scripts\Activate.ps1"

Write-Host "Starting MAYA AI frontend and backend..." -ForegroundColor Cyan

Set-Location $backend
if (-Not (Test-Path (Join-Path $backend "venv"))) {
    Write-Host "Creating backend virtual environment..." -ForegroundColor Yellow
    python -m venv venv
}

Write-Host "Installing backend requirements..." -ForegroundColor Yellow
& $venvActivate
pip install -r requirements.txt

if (Test-Path (Join-Path $backend "alembic.ini")) {
    Write-Host "Running database migrations..." -ForegroundColor Yellow
    alembic upgrade head
}

Write-Host "Starting backend in a new window..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit -ExecutionPolicy Bypass -Command `"cd '$backend'; & '$venvActivate'; uvicorn main:app --host 0.0.0.0 --port 8000 --reload`""

Set-Location $frontend
if (-Not (Test-Path (Join-Path $frontend "node_modules"))) {
    Write-Host "Installing frontend dependencies..." -ForegroundColor Yellow
    npm install
}

Write-Host "Starting frontend in a new window..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit -ExecutionPolicy Bypass -Command `"cd '$frontend'; npm run dev`""

Write-Host ""
Write-Host "Done." -ForegroundColor Green
Write-Host "Frontend: http://localhost:5173"
Write-Host "Backend:  http://localhost:8000"
Write-Host "Docs:     http://localhost:8000/docs"
