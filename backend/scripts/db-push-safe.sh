#!/usr/bin/env bash
# prisma db push — bildirim FK cakismasinda otomatik onarim dener
set -euo pipefail

cd "$(dirname "$0")/.."
PRISMA="npx prisma"
LOG="$(mktemp)"

cleanup() { rm -f "$LOG"; }
trap cleanup EXIT

if [ "${DB_RESET:-0}" = "1" ]; then
  $PRISMA db push --force-reset
  npm run db:seed
  exit 0
fi

set +e
$PRISMA db push >"$LOG" 2>&1
PUSH_EXIT=$?
set -e
cat "$LOG"

if [ "$PUSH_EXIT" -eq 0 ]; then
  exit 0
fi

if grep -q "bildirim_sube_id_fkey" "$LOG"; then
  echo ""
  echo "  bildirim FK onarimi deneniyor..."
  $PRISMA db execute --file prisma/fix-bildirim-fk.sql 2>/dev/null || true
  $PRISMA db push
  exit $?
fi

echo ""
echo "HATA: prisma db push basarisiz."
exit 1
