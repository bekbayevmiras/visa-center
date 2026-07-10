#!/bin/bash
# ============================================================
# Автоматический бэкап PostgreSQL
# Добавьте в cron: 0 3 * * * /opt/visa-center/infra/scripts/04-backup.sh
# ============================================================
set -e

INFRA_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
source "$INFRA_DIR/.env"

BACKUP_DIR="/opt/backups/visa-center"
DATE=$(date +%Y-%m-%d_%H-%M)
FILE="$BACKUP_DIR/db_$DATE.sql.gz"

mkdir -p "$BACKUP_DIR"

echo "📦 Бэкап базы данных: $FILE"

docker exec "$(cd "$INFRA_DIR" && docker compose ps -q db)" \
    pg_dumpall -U postgres | gzip > "$FILE"

# Удаляем бэкапы старше 30 дней
find "$BACKUP_DIR" -name "*.sql.gz" -mtime +30 -delete

echo "✅ Бэкап готов: $FILE ($(du -h "$FILE" | cut -f1))"

# Опционально: загрузить в OCI Object Storage
# oci os object put --bucket-name visa-center-backups --file "$FILE" --name "$(basename $FILE)"
