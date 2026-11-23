$token = (gh auth token).Trim()
git push "https://anything-tech555:${token}@github.com/anything-tech555/neelam-ki-gharelu-rasoi.git" main
Write-Host "Pushed main branch successfully!"
