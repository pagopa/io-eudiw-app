#!/bin/bash

SCRIPT_DIR=$(cd "$(dirname "$0")" && pwd)
FASTLANE_DIR="$SCRIPT_DIR/../fastlane"

touch "$FASTLANE_DIR/AuthKey_$APP_STORE_API_KEY_ID.p8"
echo -e "$APP_STORE_API_PRIVATE_KEY" > "$FASTLANE_DIR/AuthKey_$APP_STORE_API_KEY_ID.p8"
