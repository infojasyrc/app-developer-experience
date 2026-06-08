#!/bin/bash
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
else
  echo ".env file not found"
  exit 1
fi

EMAIL=${1:-"admin@example.com"}
PASSWORD=${2:-"adminPassword"}

URL="https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_API_KEY}"

RESPONSE=$(curl -s -X POST "$URL" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\", \"password\":\"$PASSWORD\", \"returnSecureToken\":true}")

TOKEN=$(echo "$RESPONSE" | jq -r '.idToken')

if [ "$TOKEN" != "null" ]; then
  echo "Successfully retrieved token for $EMAIL:"
  echo ""
  echo "$TOKEN"
else
  echo "Error retrieving token:"
  echo "$RESPONSE" | jq .
fi
