# start-db-and-migrate.ps1
# This script starts PostgreSQL, waits for it, and applies Prisma migrations

# --- Configurable variables ---
$containerName = "personal_blog"
$postgresImage = "postgres:18"
$postgresPassword = "secret"
$postgresDb = "blogdb"
$postgresPort = 5432
$volumeName = "personal-blog-pgdata"

# --- Remove existing container ---
if (docker ps -a --format "{{.Names}}" | Select-String -Pattern "^$containerName$") {
    Write-Host "Stopping and removing existing container '$containerName'..."
    docker stop $containerName | Out-Null
    docker rm $containerName | Out-Null
}

# --- Remove existing volume (optional, only if you want fresh DB) ---
if (docker volume ls --format "{{.Name}}" | Select-String -Pattern "^$volumeName$") {
    Write-Host "Removing existing volume '$volumeName'..."
    docker volume rm $volumeName | Out-Null
}

# --- Start PostgreSQL container ---
Write-Host "Starting PostgreSQL container '$containerName'..."
docker run `
    --name $containerName `
    -e POSTGRES_PASSWORD=$postgresPassword `
    -e POSTGRES_DB=$postgresDb `
    -p ${postgresPort}:5432 `
    -v ${volumeName}:/var/lib/postgresql `
    -d $postgresImage | Out-Null

# --- Wait for DB to be ready ---
Write-Host "Waiting for PostgreSQL to accept connections..."
$maxRetries = 20
$retryCount = 0
do {
    Start-Sleep -Seconds 2
    $result = docker exec $containerName pg_isready -U postgres -d $postgresDb 2>&1
    $retryCount++
} until ($result -match "accepting connections" -or $retryCount -ge $maxRetries)

if ($retryCount -ge $maxRetries) {
    Write-Host "❌ PostgreSQL did not start in time!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ PostgreSQL is ready."

# --- Run Prisma migrations ---
Write-Host "Running Prisma migrations..."
npx prisma migrate dev --name init --skip-seed

# --- Generate Prisma client ---
Write-Host "Generating Prisma client..."
npx prisma generate

Write-Host "✅ Database ready and Prisma client generated. You can now run your app."
