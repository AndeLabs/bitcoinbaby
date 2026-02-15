#!/bin/bash
# Hook: Block edits to sensitive files
# Prevents Claude from modifying .env files or secrets

INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

# Protected patterns
PROTECTED_PATTERNS=(".env" ".env.local" ".env.production" "secrets" "credentials" ".git/")

for pattern in "${PROTECTED_PATTERNS[@]}"; do
  if [[ "$FILE_PATH" == *"$pattern"* ]]; then
    echo "Blocked: Cannot modify sensitive file '$FILE_PATH'" >&2
    exit 2  # Exit code 2 = block the action
  fi
done

exit 0
