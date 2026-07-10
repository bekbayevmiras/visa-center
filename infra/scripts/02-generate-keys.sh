#!/bin/bash
# ============================================================
# Шаг 2: Генерация JWT ключей для Supabase
# Запустите ОДИН РАЗ и сохраните результат в .env
# ============================================================
set -e

echo "🔑 Генерация ключей Supabase..."

# Проверяем наличие node и npx
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

# JWT Secret (минимум 32 символа)
JWT_SECRET=$(openssl rand -base64 48 | tr -d '\n/+=')
echo "JWT_SECRET=${JWT_SECRET}"

# Генерация ANON и SERVICE_ROLE ключей
# Суть: это JWT токены подписанные нашим JWT_SECRET
node -e "
const crypto = require('crypto');

function base64url(str) {
  return Buffer.from(str).toString('base64')
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

function sign(payload, secret) {
  const header = base64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = base64url(JSON.stringify(payload));
  const data = header + '.' + body;
  const sig = crypto.createHmac('sha256', secret).update(data).digest('base64')
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  return data + '.' + sig;
}

const secret = process.env.JWT_SECRET || '${JWT_SECRET}';
const exp = Math.floor(Date.now() / 1000) + (100 * 365 * 24 * 3600); // 100 лет

const anonKey = sign({
  role: 'anon',
  iss: 'supabase',
  iat: Math.floor(Date.now() / 1000),
  exp,
}, secret);

const serviceKey = sign({
  role: 'service_role',
  iss: 'supabase',
  iat: Math.floor(Date.now() / 1000),
  exp,
}, secret);

console.log('ANON_KEY=' + anonKey);
console.log('SERVICE_ROLE_KEY=' + serviceKey);
" JWT_SECRET="${JWT_SECRET}"

echo ""
echo "SECRET_KEY_BASE=$(openssl rand -base64 64 | tr -d '\n/+=')"
echo "REALTIMEX_SECRET=$(openssl rand -hex 32)"
echo "LOGFLARE_API_KEY=$(openssl rand -hex 20)"
echo ""
echo "📋 Скопируйте всё выше в ваш файл infra/.env"
