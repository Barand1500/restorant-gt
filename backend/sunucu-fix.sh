#!/usr/bin/env bash
# Windows'tan yuklenen node_modules bozuksa bu scripti calistirin
set -euo pipefail
cd "$(dirname "$0")"

if [ ! -f .env ]; then
  echo "HATA: .env yok. Once .env olusturun."
  exit 1
fi

echo "==> Eski node_modules siliniyor (Windows binary kalintisi)"
rm -rf node_modules

echo "==> Bagimliliklar Linux icin yeniden yukleniyor"
npm ci

echo "==> Prisma client (Linux engine)"
npx prisma generate

echo "==> Veritabani tablolari"
npx prisma db push --force-reset

echo "==> Tohum verisi"
node prisma/seed.mjs

echo "==> Derleme"
npm run build

echo "==> PM2 yeniden baslat"
npx pm2 restart restorant-api --update-env || npx pm2 start ecosystem.config.cjs

echo ""
echo "Test: curl http://127.0.0.1:3006/api/health"
