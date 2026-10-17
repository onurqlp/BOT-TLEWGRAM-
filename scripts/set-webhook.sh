#!/usr/bin/env bash
set -euo pipefail
: "${TELEGRAM_BOT_TOKEN:?Missing bot token}"
: "${TELEGRAM_WEBHOOK_SECRET:?Missing webhook secret}"
: "${PUBLIC_BASE_URL:?Missing deployed Worker URL}"
curl --fail --silent --show-error --request POST \
  "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/setWebhook" \
  --data-urlencode "url=${PUBLIC_BASE_URL%/}/telegram/webhook" \
  --data-urlencode "secret_token=${TELEGRAM_WEBHOOK_SECRET}" \
  --data-urlencode 'allowed_updates=["message","my_chat_member","chat_member"]'
echo
