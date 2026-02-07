# ClubForge Rebranding Script
# Replaces all DojoHub references with ClubForge

$srcFiles = Get-ChildItem -Path "src" -Recurse -Include "*.tsx","*.ts","*.css"

foreach ($file in $srcFiles) {
    $content = Get-Content $file.FullName -Raw
    if ($content -match 'dojohub|DojoHub|JazakAllahu') {
        $content = $content -replace 'support@dojohub\.com', 'support@clubforge.com'
        $content = $content -replace 'noreply@dojohub\.com', 'noreply@clubforge.com'
        $content = $content -replace '@child\.dojohub\.local', '@child.clubforge.local'
        $content = $content -replace 'https://dojohub\.com', 'https://clubforge.com'
        $content = $content -replace 'dojohub\.com', 'clubforge.com'
        $content = $content -replace 'DojoHub', 'ClubForge'
        $content = $content -replace 'dojohub', 'clubforge'
        $content = $content -replace 'JazakAllahu Khayran', 'Best regards'
        Set-Content $file.FullName $content -NoNewline
        Write-Host "Updated: $($file.FullName)"
    }
}

# Also update docs
$docFiles = Get-ChildItem -Path "docs" -Recurse -Include "*.md"
foreach ($file in $docFiles) {
    $content = Get-Content $file.FullName -Raw
    if ($content -match 'dojohub|DojoHub') {
        $content = $content -replace 'support@dojohub\.com', 'support@clubforge.com'
        $content = $content -replace 'noreply@dojohub\.com', 'noreply@clubforge.com'
        $content = $content -replace 'https://dojohub\.com', 'https://clubforge.com'
        $content = $content -replace 'dojohub\.com', 'clubforge.com'
        $content = $content -replace 'DojoHub', 'ClubForge'
        $content = $content -replace 'dojohub-saas', 'clubforge-saas'
        $content = $content -replace 'dojohub', 'clubforge'
        $content = $content -replace 'DOJOHUB', 'CLUBFORGE'
        Set-Content $file.FullName $content -NoNewline
        Write-Host "Updated: $($file.FullName)"
    }
}

# Update package.json
$pkg = Get-Content "package.json" -Raw
if ($pkg -match 'dojohub') {
    $pkg = $pkg -replace 'dojohub', 'clubforge'
    Set-Content "package.json" $pkg -NoNewline
    Write-Host "Updated: package.json"
}

# Update README.md
$readme = Get-Content "README.md" -Raw
if ($readme -match 'dojohub|DojoHub') {
    $readme = $readme -replace 'DojoHub', 'ClubForge'
    $readme = $readme -replace 'dojohub', 'clubforge'
    Set-Content "README.md" $readme -NoNewline
    Write-Host "Updated: README.md"
}

# Update .env.example
if (Test-Path ".env.example") {
    $env_example = Get-Content ".env.example" -Raw
    if ($env_example -match 'dojohub|DojoHub') {
        $env_example = $env_example -replace 'DojoHub', 'ClubForge'
        $env_example = $env_example -replace 'dojohub', 'clubforge'
        Set-Content ".env.example" $env_example -NoNewline
        Write-Host "Updated: .env.example"
    }
}

Write-Host "`nRebranding complete!"
