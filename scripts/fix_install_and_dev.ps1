Param()

$projectRoot = "C:\Users\htame\codefile_mine\portfolio_TamemotoHiroki\test-toubatsuroku"
Set-Location $projectRoot
Write-Output "--- Running fix_install_and_dev.ps1 in $projectRoot ---"

$empty = Join-Path $projectRoot '__empty_dir'
if (-not (Test-Path $empty)) { New-Item -ItemType Directory -Path $empty | Out-Null }

Write-Output 'Mirroring empty dir over node_modules via robocopy (force delete)'
cmd /c "robocopy "$empty" "$(Join-Path $projectRoot 'node_modules')" /MIR /NJH /NJS /NDL /nc /ns /np" | Out-Null

Write-Output 'Removing node_modules folder (Remove-Item)'
try {
    Remove-Item -LiteralPath (Join-Path $projectRoot 'node_modules') -Recurse -Force -ErrorAction Stop
} catch {
    Write-Warning "Remove-Item failed: $_. Exception"
}

if (Test-Path (Join-Path $projectRoot 'node_modules')) {
    Write-Warning 'node_modules still exists after attempt. Attempting cmd rd /s /q'
    cmd /c "rd /s /q \"$projectRoot\\node_modules\"" | Out-Null
}

if (Test-Path (Join-Path $projectRoot 'node_modules')) {
    Write-Error 'Failed to remove node_modules. Please close processes locking files or run as Administrator.'
    exit 1
} else {
    Write-Output 'node_modules removed'
}

Write-Output 'Removing temporary empty dir'
try { Remove-Item -LiteralPath $empty -Recurse -Force -ErrorAction SilentlyContinue } catch {}

Write-Output 'Cleaning npm cache'
npm cache clean --force

Write-Output 'Renaming package-lock.json if present to avoid encoding issues'
$lock = Join-Path $projectRoot 'package-lock.json'
if (Test-Path $lock) {
    Rename-Item -LiteralPath $lock -NewName 'package-lock.json.bak' -Force
    Write-Output 'package-lock.json renamed to package-lock.json.bak'
}

Write-Output 'Installing dependencies (no optional)'
$env:NPM_CONFIG_LOGLEVEL = 'info'
$installCmd = 'npm install --no-optional --loglevel=info'
Write-Output "Running: $installCmd"
& npm install --no-optional --loglevel=info
if ($LASTEXITCODE -ne 0) {
    Write-Error "npm install failed with exit code $LASTEXITCODE"
    exit $LASTEXITCODE
}

Write-Output 'Starting Next dev with Turbopack disabled'
$devCmd = 'npx --yes -p cross-env -p next@16.2.6 cross-env NEXT_DISABLE_TURBOPACK=1 next dev -p 3000'
Write-Output "Running: $devCmd"
Invoke-Expression $devCmd

Write-Output 'Script completed.'
