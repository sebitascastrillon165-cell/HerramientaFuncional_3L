# Copia los recursos de iconos/notificaciones desde node_modules a electron/renderer/vendor
$src = "$PSScriptRoot\..\node_modules"
$dst = "$PSScriptRoot\..\electron\renderer\vendor"

New-Item -ItemType Directory -Force -Path "$dst\fontawesome\css", "$dst\fontawesome\webfonts", "$dst\sweetalert2" | Out-Null
Copy-Item -Force "$src\@fortawesome\fontawesome-free\css\all.min.css" "$dst\fontawesome\css\all.min.css"
Copy-Item -Recurse -Force "$src\@fortawesome\fontawesome-free\webfonts\*" "$dst\fontawesome\webfonts\"
Copy-Item -Force "$src\sweetalert2\dist\sweetalert2.min.css" "$dst\sweetalert2\sweetalert2.min.css"
Copy-Item -Force "$src\sweetalert2\dist\sweetalert2.min.js" "$dst\sweetalert2\sweetalert2.min.js"
Write-Host "Recursos actualizados en $dst"