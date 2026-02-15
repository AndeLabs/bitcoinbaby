#!/bin/bash
# Hook: Auto-format files after Claude edits them
# Runs Prettier on TypeScript/JavaScript files

INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

# Only format TS/JS files
if [[ "$FILE_PATH" != *.ts && "$FILE_PATH" != *.tsx && "$FILE_PATH" != *.js && "$FILE_PATH" != *.jsx ]]; then
  exit 0
fi

# Check if prettier exists
if ! command -v npx &> /dev/null; then
  exit 0
fi

# Format the file silently
npx prettier --write "$FILE_PATH" 2>/dev/null || true

exit 0
