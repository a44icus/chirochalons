# =====================================================================
#  Cabinet Chiropratique Condette - téléchargement des ressources
#  Télécharge polices, librairies JS et photos temporaires dans assets\
#  pour ne plus dépendre de Google Fonts, des CDN ni de Pexels.
#
#  Utilisation : clic droit sur ce fichier > « Exécuter avec PowerShell »
#  (ou dans un terminal : powershell -ExecutionPolicy Bypass -File .\telecharger-ressources.ps1)
# =====================================================================

$ErrorActionPreference = "Stop"
$racine = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $racine

New-Item -ItemType Directory -Force -Path "assets\fonts", "assets\js", "assets\img" | Out-Null

function Telecharger($url, $destination) {
  Write-Host "  -> $destination"
  Invoke-WebRequest -Uri $url -OutFile $destination -UseBasicParsing
}

Write-Host "Polices (sous-ensemble latin, accents français compris)..."
$polices = @{
  "anton-400.woff2"           = "https://cdn.jsdelivr.net/fontsource/fonts/anton@latest/latin-400-normal.woff2"
  "la-belle-aurore-400.woff2" = "https://cdn.jsdelivr.net/fontsource/fonts/la-belle-aurore@latest/latin-400-normal.woff2"
  "inter-400.woff2"           = "https://cdn.jsdelivr.net/fontsource/fonts/inter@latest/latin-400-normal.woff2"
  "inter-500.woff2"           = "https://cdn.jsdelivr.net/fontsource/fonts/inter@latest/latin-500-normal.woff2"
  "inter-600.woff2"           = "https://cdn.jsdelivr.net/fontsource/fonts/inter@latest/latin-600-normal.woff2"
  "instrument-sans-500.woff2" = "https://cdn.jsdelivr.net/fontsource/fonts/instrument-sans@latest/latin-500-normal.woff2"
  "instrument-sans-600.woff2" = "https://cdn.jsdelivr.net/fontsource/fonts/instrument-sans@latest/latin-600-normal.woff2"
}
foreach ($p in $polices.GetEnumerator()) { Telecharger $p.Value "assets\fonts\$($p.Key)" }

Write-Host "Librairies JavaScript..."
Telecharger "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"          "assets\js\gsap.min.js"
Telecharger "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js" "assets\js\ScrollTrigger.min.js"
Telecharger "https://cdn.jsdelivr.net/npm/lenis@1.1.13/dist/lenis.min.js"             "assets\js\lenis.min.js"

Write-Host "Photos temporaires Pexels (à remplacer par les vraies photos du cabinet)..."
$photos = 20669197, 4506113, 5794033, 4506161, 5888132, 5793901, 8638040, 4506110, 6513297, 5793688, 4506169, 5793895, 5794021, 5794024, 20860599, 20860615
foreach ($id in $photos) {
  Telecharger "https://images.pexels.com/photos/$id/pexels-photo-$id.jpeg?auto=compress&cs=tinysrgb&w=2000" "assets\img\pexels-$id.jpg"
}

Write-Host ""
Write-Host "Terminé. Prévenez Claude : il basculera les pages sur ces fichiers locaux."
Read-Host "Appuyez sur Entrée pour fermer"
