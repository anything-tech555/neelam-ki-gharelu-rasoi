$token = (gh auth token).Trim()
$dist = "c:\Users\ak\Documents\neelam food app\customer-app\dist"
Set-Location $dist

if (Test-Path ".git") {
    Remove-Item -Path ".git" -Recurse -Force
}
git init
git config user.name "anything-tech555"
git config user.email "anythingtech555@gmail.com"
git checkout -b gh-pages
git add -A
git commit -m "deploy: update customer app, admin dashboard, SPA routing, and APK"
git push "https://anything-tech555:${token}@github.com/anything-tech555/neelam-ki-gharelu-rasoi.git" gh-pages --force

Set-Location "c:\Users\ak\Documents\neelam food app"
Write-Host "Deployed gh-pages successfully!"
