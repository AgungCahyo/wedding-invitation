$ProjectPath = (Get-Location).Path
$ProjectName = Split-Path $ProjectPath -Leaf
$ParentPath = Split-Path $ProjectPath -Parent

$Output = Join-Path $ParentPath "$ProjectName-source.zip"
$TempDir = Join-Path $env:TEMP "$ProjectName-zip"

$ExcludeDirs = @(
    "node_modules",
    ".next",
    ".git",
    ".vercel",
    "coverage",
    "dist",
    "build",
    "out",
    ".turbo",
    ".cache",
    ".npm",
    ".pnpm-store"
)

$ExcludeFiles = @(
    ".env",
    ".env.local",
    ".env.development",
    ".env.production",
    ".env.test",
    "*.pem",
    "*.key",
    "*.p12",
    "*.pfx"
)

Write-Host "Project : $ProjectName"
Write-Host "Source  : $ProjectPath"
Write-Host "Output  : $Output"
Write-Host ""

# Bersihkan temporary directory
if (Test-Path $TempDir) {
    Remove-Item $TempDir -Recurse -Force
}

New-Item -ItemType Directory -Path $TempDir | Out-Null

# Copy project dengan pengecualian
Get-ChildItem -Path $ProjectPath -Force | ForEach-Object {

    # Exclude directory
    if ($_.PSIsContainer -and $ExcludeDirs -contains $_.Name) {
        Write-Host "SKIP DIR : $($_.Name)"
        return
    }

    # Exclude file
    if (-not $_.PSIsContainer) {
        foreach ($pattern in $ExcludeFiles) {
            if ($_.Name -like $pattern) {
                Write-Host "SKIP FILE: $($_.Name)"
                return
            }
        }
    }

    $destination = Join-Path $TempDir $_.Name

    Copy-Item `
        -Path $_.FullName `
        -Destination $destination `
        -Recurse `
        -Force
}

Write-Host ""
Write-Host "Membuat ZIP..."

# Hapus ZIP lama jika ada
if (Test-Path $Output) {
    Remove-Item $Output -Force
}

Compress-Archive `
    -Path "$TempDir\*" `
    -DestinationPath $Output `
    -CompressionLevel Optimal

# Bersihkan temporary directory
Remove-Item $TempDir -Recurse -Force

Write-Host ""
Write-Host "========================================"
Write-Host "ZIP BERHASIL DIBUAT"
Write-Host "========================================"
Write-Host $Output
Write-Host ""