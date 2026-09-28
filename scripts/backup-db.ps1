# Dumps the bridal_shop MySQL database to a timestamped .sql file.
# Run manually, or via the "BridalShopDbBackup" scheduled task (daily).

$ErrorActionPreference = "Stop"

$mysqldump = "C:\Program Files\MySQL\MySQL Server 8.4\bin\mysqldump.exe"
$backupDir = "C:\Users\tadac\mysql-backups"
$dbName = "bridal_shop"
$dbUser = "bridal_app"
$retentionDays = 30

if (-not (Test-Path $backupDir)) {
    New-Item -ItemType Directory -Path $backupDir | Out-Null
}

$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$outFile = Join-Path $backupDir "bridal_shop_$timestamp.sql"

$env:MYSQL_PWD = "bridal_app_pw"
try {
    & $mysqldump --host=localhost --port=3306 --user=$dbUser --single-transaction --routines --events $dbName | Out-File -FilePath $outFile -Encoding utf8
} finally {
    Remove-Item Env:\MYSQL_PWD
}

if ((Get-Item $outFile).Length -eq 0) {
    Remove-Item $outFile
    throw "Backup produced an empty file - is MySQL running?"
}

Write-Host "Backup written to $outFile"

# Delete backups older than $retentionDays
Get-ChildItem -Path $backupDir -Filter "bridal_shop_*.sql" |
    Where-Object { $_.LastWriteTime -lt (Get-Date).AddDays(-$retentionDays) } |
    Remove-Item -Force
