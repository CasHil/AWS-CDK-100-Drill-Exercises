param(
    [Parameter(Mandatory=$true, Position=0)]
    [string]$Name
)

$ErrorActionPreference = "Stop"

# Helper to convert kebab-case to PascalCase
function ConvertTo-PascalCase {
    param([string]$InputString)
    $textInfo = (Get-Culture).TextInfo
    # Replace hyphens with spaces, title case, then remove spaces
    $textInfo.ToTitleCase($InputString.Replace('-', ' ')).Replace(' ', '')
}

# Helper to convert kebab-case to Title-Kebab-Case (e.g. app-template -> App-Template)
function ConvertTo-TitleKebabCase {
    param([string]$InputString)
    $textInfo = (Get-Culture).TextInfo
    $textInfo.ToTitleCase($InputString.Replace('-', ' ')).Replace(' ', '-')
}

$PascalName = ConvertTo-PascalCase -InputString $Name
Write-Host "Scaffolding project '$Name' (PascalCase: $PascalName)..." -ForegroundColor Cyan

# 1. Determine Source and Destination
$sourceDir = "0. app-template"

if (-not (Test-Path $sourceDir)) {
    Write-Error "Template directory '$sourceDir' not found."
    exit 1
}

# Find the highest number prefix
$maxNum = 0
Get-ChildItem -Directory | Where-Object { $_.Name -match "^(\d+)\." } | ForEach-Object {
    $currentNum = [int]$matches[1]
    if ($currentNum -gt $maxNum) {
        $maxNum = $currentNum
    }
}

$nextNum = $maxNum + 1
$destDir = "$nextNum. $Name"

if (Test-Path $destDir) {
    Write-Error "Destination directory '$destDir' already exists."
    exit 1
}

# 2. Copy Directory
Write-Host "Copying '$sourceDir' to '$destDir'..."
Copy-Item -Path $sourceDir -Destination $destDir -Recurse

# 3. Replace Content
Write-Host "Replacing content in files..."
$files = Get-ChildItem -Path $destDir -File -Recurse

foreach ($file in $files) {
    # Skip node_modules and .git to save time and avoid errors
    if ($file.FullName -match "node_modules|\\.git") { continue }

    $content = Get-Content -Path $file.FullName -Raw
    
    # Replace AppTemplate -> PascalName
    # Replace app-template -> Name
    $newContent = $content -replace "AppTemplate", $PascalName `
                           -creplace "App-Template", (ConvertTo-TitleKebabCase -InputString $Name) `
                           -replace "app-template", $Name

    if ($content -ne $newContent) {
        Set-Content -Path $file.FullName -Value $newContent -Encoding UTF8 -NoNewline
    }
}

# 4. Rename Files and Directories
Write-Host "Renaming files and directories..."
# Sort by path length descending to rename children before parents
$itemsToRename = Get-ChildItem -Path $destDir -Recurse | 
                 Where-Object { $_.Name -like "*app-template*" } | 
                 Sort-Object -Property @{Expression={$_.FullName.Length}; Descending=$true}

foreach ($item in $itemsToRename) {
    $newName = $item.Name -replace "app-template", $Name
    Rename-Item -Path $item.FullName -NewName $newName
}

Write-Host "Successfully created project in '$destDir'" -ForegroundColor Green
