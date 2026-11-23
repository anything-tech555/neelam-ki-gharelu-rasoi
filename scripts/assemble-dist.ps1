$dist = 'c:\Users\ak\Documents\neelam food app\customer-app\dist'
$adminDist = 'c:\Users\ak\Documents\neelam food app\admin-app\dist'
$scripts404 = 'c:\Users\ak\Documents\neelam food app\scripts\404.html'
$apkSrc = 'c:\Users\ak\Documents\neelam food app\android\Neelam-Ki-Gharelu-Rasoi.apk'

# 1. Admin app inside dist/admin
New-Item -ItemType Directory -Path (Join-Path $dist 'admin') -Force | Out-Null
Copy-Item -Path (Join-Path $adminDist '*') -Destination (Join-Path $dist 'admin') -Recurse -Force

# 2. Smart 404 handler
Copy-Item -Path $scripts404 -Destination (Join-Path $dist '404.html') -Force
Copy-Item -Path (Join-Path $dist 'admin\index.html') -Destination (Join-Path $dist 'admin\404.html') -Force

# 3. .nojekyll
New-Item -ItemType File -Path (Join-Path $dist '.nojekyll') -Force | Out-Null

# 4. Copy APK for direct website download
if (Test-Path $apkSrc) {
  Copy-Item -Path $apkSrc -Destination (Join-Path $dist 'Neelam-Ki-Gharelu-Rasoi.apk') -Force
}

# 5. Sync to Capacitor Android public folder
$capAssets = 'c:\Users\ak\Documents\neelam food app\customer-app\android\app\src\main\assets\public'
Copy-Item -Path (Join-Path $dist '*') -Destination $capAssets -Recurse -Force

Write-Host "SUCCESS: Distribution assembled and synced to Android assets!"
