#!/bin/bash
# Save work script - Claude runs this for you

echo ""
echo "☕ Saving your CoffeeConnect work..."
echo ""

cd ~/coffee-shop-app

# Check for changes
if git diff --quiet && git diff --cached --quiet; then
    echo "✓ No changes to save"
else
    echo "📝 Committing your changes..."
    echo ""
    git add .
    git commit -m "$1"
    echo ""
    echo "✓ Work saved successfully!"
fi

echo ""
echo "Server still running at http://localhost:3000"
echo "Type 'finished' when you're completely done"
