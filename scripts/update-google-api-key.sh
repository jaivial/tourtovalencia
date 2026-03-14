#!/bin/bash
# Script to update Google AI API Key on the server
# Run from /var/www/tourtovalencia directory

ENV_FILE=".env"

if [ ! -f "$ENV_FILE" ]; then
    echo "Creating new .env file..."
    touch "$ENV_FILE"
fi

# Check if GOOGLE_AI_API_KEY already exists
if grep -q "GOOGLE_AI_API_KEY=" "$ENV_FILE"; then
    # Update existing value
    sed -i 's/GOOGLE_AI_API_KEY=.*/GOOGLE_AI_API_KEY=AIzaSyAGG1is5K43n-M5zK_pSTC8DLeKtsQncUQ/' "$ENV_FILE"
    echo "Updated GOOGLE_AI_API_KEY in .env"
else
    # Add new line
    echo "GOOGLE_AI_API_KEY=AIzaSyAGG1is5K43n-M5zK_pSTC8DLeKtsQncUQ" >> "$ENV_FILE"
    echo "Added GOOGLE_AI_API_KEY to .env"
fi

echo "Done! Verify with: grep GOOGLE_AI_API_KEY .env"
