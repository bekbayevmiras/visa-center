#!/bin/bash
# ============================================================
# Шаг 1: Первоначальная настройка Ubuntu 22.04 на OCI ARM
# Запускайте от root: sudo bash 01-setup-server.sh
# ============================================================
set -e

echo "🚀 Настройка сервера OCI для VisaKZ..."

# Обновление системы
apt-get update -y && apt-get upgrade -y

# Базовые утилиты
apt-get install -y \
    curl wget git unzip \
    htop ncdu tmux \
    ufw fail2ban \
    nginx certbot python3-certbot-nginx \
    jq

# ── Docker ─────────────────────────────────────────────
curl -fsSL https://get.docker.com | sh
systemctl enable docker
systemctl start docker

# Docker Compose plugin
apt-get install -y docker-compose-plugin
docker compose version

# ── Firewall ───────────────────────────────────────────
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh         # 22
ufw allow http        # 80
ufw allow https       # 443
ufw --force enable

echo "✅ Firewall настроен (22, 80, 443)"

# ВАЖНО для OCI: правила iptables нужно сбросить
# OCI использует свой фаерволл (Security Lists) + iptables
iptables -F INPUT
iptables -F FORWARD
iptables -P INPUT ACCEPT
iptables -P FORWARD ACCEPT
apt-get install -y iptables-persistent
netfilter-persistent save

# ── Swap (рекомендуется для стабильности) ──────────────
if [ ! -f /swapfile ]; then
    fallocate -l 4G /swapfile
    chmod 600 /swapfile
    mkswap /swapfile
    swapon /swapfile
    echo '/swapfile none swap sw 0 0' >> /etc/fstab
    echo "vm.swappiness=10" >> /etc/sysctl.conf
    sysctl -p
    echo "✅ Swap 4GB добавлен"
fi

# ── Fail2Ban ───────────────────────────────────────────
cat > /etc/fail2ban/jail.local << 'EOF'
[DEFAULT]
bantime  = 3600
findtime = 600
maxretry = 5

[sshd]
enabled = true
port    = ssh
EOF
systemctl enable fail2ban
systemctl start fail2ban

# ── Nginx ──────────────────────────────────────────────
systemctl enable nginx
systemctl start nginx

echo ""
echo "✅ Сервер готов!"
echo ""
echo "Следующие шаги:"
echo "1. Настройте DNS: supabase.yourdomain.kz → $(curl -s ifconfig.me)"
echo "2. Запустите: bash 02-generate-keys.sh"
echo "3. Запустите: bash 03-deploy-supabase.sh"
