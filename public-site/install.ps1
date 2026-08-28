$ErrorActionPreference = "Stop"
$manifestUrl = "https://github.com/B-Divyesh/sf-score-aligned-choir-cleanup/releases/latest/download/latest.json"
$manifest = Invoke-RestMethod -Uri $manifestUrl
$asset = $manifest.platforms.windows
if (-not $asset) { throw "No Windows build is published in the latest release." }
$target = Join-Path $env:TEMP $asset.file
Invoke-WebRequest -Uri $asset.url -OutFile $target
$actual = (Get-FileHash -Algorithm SHA256 $target).Hash.ToLowerInvariant()
if ($actual -ne $asset.sha256.ToLowerInvariant()) { Remove-Item $target -Force; throw "Checksum verification failed; nothing was installed." }
Write-Host "SHA256 verified. Starting the unsigned Choir Cleanup installer; confirm the Windows publisher warning."
Start-Process -FilePath $target -Wait
Remove-Item $target -Force
Write-Host "Choir Cleanup installer finished."
