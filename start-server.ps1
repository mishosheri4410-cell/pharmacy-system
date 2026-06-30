$host.UI.RawUI.WindowTitle = "Pharmacy Management Server"
$base = "C:\Users\admin\OneDrive\Documents\OneDrive\Desktop\opencode\server"
Set-Location $base
Write-Host "Starting Pharmacy Management Server..." -ForegroundColor Cyan
Write-Host ""
node server.js
Read-Host "`nPress Enter to exit"
