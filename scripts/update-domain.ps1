# Update domain references: clubforge.com -> clubforgehq.com
$srcFiles = Get-ChildItem -Path "src" -Recurse -Include "*.tsx","*.ts","*.css"

foreach ($file in $srcFiles) {
    $content = Get-Content $file.FullName -Raw
    if ($content -match 'clubforge\.com') {
        $content = $content -replace 'support@clubforge\.com', 'support@clubforgehq.com'
        $content = $content -replace 'noreply@clubforge\.com', 'noreply@clubforgehq.com'
        $content = $content -replace 'https://clubforge\.com', 'https://clubforgehq.com'
        $content = $content -replace 'clubforge\.com', 'clubforgehq.com'
        Set-Content $file.FullName $content -NoNewline
        Write-Host "Updated: $($file.FullName)"
    }
}

# Also update .env.example
$envExample = Get-Content ".env.example" -Raw
if ($envExample -match 'clubforge\.com') {
    $envExample = $envExample -replace 'clubforge\.com', 'clubforgehq.com'
    Set-Content ".env.example" $envExample -NoNewline
    Write-Host "Updated: .env.example"
}

Write-Host "Domain update complete!"
