#!/usr/bin/env bash
set -euo pipefail

webhook='https://baolvision.app.n8n.cloud/webhook/demandoo-voice'

if (( $# != 1 )); then
  echo "Usage: $0 AUDIO_FILE" >&2
  exit 2
fi

audio_file=$1
if [[ ! -f "$audio_file" ]]; then
  echo "Audio file not found: $audio_file" >&2
  exit 2
fi

extension=${audio_file##*.}
case "$extension" in
  ogg|opus) mime='audio/ogg' ;;
  mp3) mime='audio/mpeg' ;;
  mp4|m4a) mime='audio/mp4' ;;
  wav) mime='audio/wav' ;;
  webm) mime='audio/webm' ;;
  *) echo "Unsupported audio extension: $extension" >&2; exit 2 ;;
esac

headers=$(mktemp)
response=$(mktemp)
trap 'rm -f "$headers" "$response"' EXIT

status=$(curl --show-error --silent \
  --dump-header "$headers" \
  --output "$response" \
  --write-out '%{http_code}' \
  --form "audio=@${audio_file};type=${mime}" \
  "$webhook")

content_type=$(awk 'tolower($1) == "content-type:" { print $2 }' "$headers" | tr -d '\r' | tail -n 1)
echo "HTTP $status; Content-Type: ${content_type:-unknown}"

if [[ "$status" != 2* || "$content_type" != audio/* ]]; then
  echo 'The webhook did not return audio. Inspect the n8n execution for the failing node.' >&2
  exit 1
fi

cp "$response" demandoo-response.mp3

echo "Response saved to demandoo-response.mp3"
