#!/bin/bash
# ============================================================
# Шаг 3: Деплой Supabase на OCI
# Запускайте из папки /opt/visa-center/infra/
# ============================================================
set -e

INFRA_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$INFRA_DIR"

echo "🚀 Деплой Supabase Self-Hosted..."

# Проверяем .env
if [ ! -f ".env" ]; then
    echo "❌ Файл .env не найден!"
    echo "   cp .env.example .env"
    echo "   Заполните все переменные и запустите снова."
    exit 1
fi

source .env

# Проверяем обязательные переменные
for var in POSTGRES_PASSWORD JWT_SECRET ANON_KEY SERVICE_ROLE_KEY DOMAIN; do
    if [ -z "${!var}" ]; then
        echo "❌ Переменная $var не установлена в .env"
        exit 1
    fi
done

# ── Kong конфиг ────────────────────────────────────────
mkdir -p volumes/api
cat > volumes/api/kong.yml << KONG_EOF
_format_version: "2.1"

consumers:
  - username: anon
    keyauth_credentials:
      - key: ${ANON_KEY}
  - username: service_role
    keyauth_credentials:
      - key: ${SERVICE_ROLE_KEY}

acls:
  - consumer: anon
    group: anon
  - consumer: service_role
    group: admin

services:
  - name: auth-v1-open
    url: http://auth:9999/verify
    routes:
      - name: auth-v1-open
        strip_path: true
        paths:
          - /auth/v1/verify
    plugins:
      - name: cors

  - name: auth-v1
    url: http://auth:9999/
    routes:
      - name: auth-v1-all
        strip_path: true
        paths:
          - /auth/v1/
    plugins:
      - name: cors
      - name: key-auth
        config:
          hide_credentials: false
      - name: acl
        config:
          hide_groups_header: true
          allow:
            - admin
            - anon

  - name: rest-v1
    url: http://rest:3000/
    routes:
      - name: rest-v1-all
        strip_path: true
        paths:
          - /rest/v1/
    plugins:
      - name: cors
      - name: key-auth
        config:
          hide_credentials: true
      - name: acl
        config:
          hide_groups_header: true
          allow:
            - admin
            - anon

  - name: realtime-v1
    url: http://realtime:4000/socket/
    routes:
      - name: realtime-v1-all
        strip_path: true
        paths:
          - /realtime/v1/
    plugins:
      - name: cors
      - name: key-auth
        config:
          hide_credentials: false
      - name: acl
        config:
          hide_groups_header: true
          allow:
            - admin
            - anon

  - name: storage-v1
    url: http://storage:5000/
    routes:
      - name: storage-v1-all
        strip_path: true
        paths:
          - /storage/v1/
    plugins:
      - name: cors
      - name: key-auth
        config:
          hide_credentials: true
      - name: acl
        config:
          hide_groups_header: true
          allow:
            - admin
            - anon

  - name: meta
    url: http://meta:8080/
    routes:
      - name: meta-all
        strip_path: true
        paths:
          - /pg/
    plugins:
      - name: key-auth
        config:
          hide_credentials: false
      - name: acl
        config:
          hide_groups_header: true
          allow:
            - admin
KONG_EOF

echo "✅ Kong config создан"

# ── Запуск контейнеров ─────────────────────────────────
docker compose --env-file .env pull
docker compose --env-file .env up -d

echo "⏳ Ждём запуска БД..."
sleep 15

# ── Применяем миграции ─────────────────────────────────
echo "📦 Применяем миграции..."
MIGRATION_DIR="${INFRA_DIR}/../supabase/migrations"

if [ -d "$MIGRATION_DIR" ]; then
    for sql_file in "$MIGRATION_DIR"/*.sql; do
        echo "  → $(basename $sql_file)"
        docker exec -i "$(docker compose ps -q db)" \
            psql -U postgres -d postgres < "$sql_file"
    done
    echo "✅ Миграции применены"
else
    echo "⚠️  Папка migrations не найдена: $MIGRATION_DIR"
fi

# ── Настройка Nginx + SSL ──────────────────────────────
echo ""
echo "📋 Настройка Nginx..."
cp nginx/supabase.conf /etc/nginx/sites-available/supabase
# Заменяем yourdomain.kz на реальный домен
sed -i "s/yourdomain.kz/$DOMAIN/g" /etc/nginx/sites-available/supabase
ln -sf /etc/nginx/sites-available/supabase /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx

echo ""
echo "🔒 Получаем SSL сертификат..."
certbot --nginx -d "$DOMAIN" --non-interactive --agree-tos -m "admin@${DOMAIN#*.}" || \
    echo "⚠️  Сертификат не получен. Убедитесь что DNS уже указывает на этот сервер."

echo ""
echo "✅ Supabase запущен!"
echo ""
echo "   API:    https://${DOMAIN}"
echo "   Studio: http://$(curl -s ifconfig.me):3001"
echo ""
echo "NEXT_PUBLIC_SUPABASE_URL=https://${DOMAIN}"
echo "NEXT_PUBLIC_SUPABASE_ANON_KEY=${ANON_KEY}"
echo "SUPABASE_SERVICE_ROLE_KEY=${SERVICE_ROLE_KEY}"
