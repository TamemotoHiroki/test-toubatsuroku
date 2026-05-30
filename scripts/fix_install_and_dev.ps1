Param()

$projectRoot = Split-Path $PSScriptRoot -Parent
Set-Location $projectRoot
Write-Output "--- Running fix_install_and_dev.ps1 in $projectRoot ---"

function Remove-NodeModules {
    param([string]$Root)
    $target = Join-Path $Root 'node_modules'
    if (-not (Test-Path $target)) { return }

    # Windows では深いパスが Remove-Item に失敗することがあるため robocopy で空ミラー後に削除
    $empty = Join-Path $Root '__empty_dir'
    New-Item -ItemType Directory -Path $empty -Force | Out-Null
    cmd /c "robocopy `"$empty`" `"$target`" /MIR /NJH /NJS /NDL /nc /ns /np" | Out-Null
    Remove-Item -LiteralPath $empty -Recurse -Force -ErrorAction SilentlyContinue

    try {
        Remove-Item -LiteralPath $target -Recurse -Force -ErrorAction Stop
    } catch {
        Write-Warning "Remove-Item failed: $($_.Exception.Message). Falling back to rd /s /q"
        cmd /c "rd /s /q `"$target`""
    }

    if (Test-Path $target) {
        Write-Error 'node_modules could not be removed. Close any processes holding locks or run as Administrator.'
        exit 1
    }
    Write-Output 'node_modules removed.'
}

Remove-NodeModules $projectRoot

$lock = Join-Path $projectRoot 'package-lock.json'
if (Test-Path $lock) {
    Remove-Item -LiteralPath $lock -Force
    Write-Output 'package-lock.json removed.'
}

Write-Output 'Cleaning npm cache...'
npm cache clean --force

Write-Output 'Installing dependencies...'
npm install --no-optional --loglevel=info
if ($LASTEXITCODE -ne 0) {
    Write-Error "npm install failed with exit code $LASTEXITCODE"
    exit $LASTEXITCODE
}

Write-Output 'Starting Next.js dev server (Turbopack disabled)...'
$env:NEXT_DISABLE_TURBOPACK = '1'
npm run dev
