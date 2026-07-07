#!/usr/bin/env bash
set -euo pipefail

# ──────────────────────────────────────────────────────────────────────────────
# Grays Park Masjid — EAS build launcher
# Builds iOS and Android in parallel on EAS Cloud.
#
# Usage:
#   ./build.sh                  # production (default)
#   ./build.sh production       # App Store + Play Store (aab)
#   ./build.sh preview          # Internal distribution (ipa + apk)
#   ./build.sh development      # Dev client (iOS simulator + Android)
# ──────────────────────────────────────────────────────────────────────────────

PROFILE="${1:-production}"

GREEN='\033[0;32m'
GOLD='\033[0;33m'
RESET='\033[0m'
BOLD='\033[1m'

echo ""
echo -e "${GREEN}${BOLD}┌─────────────────────────────────────────┐${RESET}"
echo -e "${GREEN}${BOLD}│       Grays Park Masjid — EAS Build      │${RESET}"
echo -e "${GREEN}${BOLD}└─────────────────────────────────────────┘${RESET}"
echo ""
echo -e "  Profile : ${GOLD}${BOLD}${PROFILE}${RESET}"
echo -e "  Platform: ${GOLD}${BOLD}iOS + Android${RESET}"
echo ""

case "$PROFILE" in
  production)
    echo -e "  iOS     → App Store (IPA, Xcode 16.2, autoIncrement)"
    echo -e "  Android → Play Store (AAB, autoIncrement)"
    ;;
  preview)
    echo -e "  iOS     → Internal distribution (IPA)"
    echo -e "  Android → Internal distribution (APK)"
    ;;
  development)
    echo -e "  iOS     → Simulator build (dev client)"
    echo -e "  Android → Dev client"
    ;;
  *)
    echo -e "  ⚠️  Unknown profile '${PROFILE}'. Check eas.json for valid profiles."
    exit 1
    ;;
esac

echo ""
echo -e "  Starting build… (EAS will queue both platforms)"
echo ""

cd "$(dirname "$0")"

pnpm exec eas build \
  --platform all \
  --profile "$PROFILE" \
  --non-interactive
