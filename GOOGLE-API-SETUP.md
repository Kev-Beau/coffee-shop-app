# How to Get Your Free Google Places API Key

## Step 1: Go to Google Cloud Console

1. Go to: https://console.cloud.google.com/
2. Sign in with your Google account (or create one - it's free)

## Step 2: Create a New Project

1. Click the project dropdown at the top
2. Click "NEW PROJECT"
3. Name it: "CoffeeConnect"
4. Click "CREATE"

## Step 3: Enable the APIs You Need

1. Go to: https://console.cloud.google.com/apis/library
2. Search for and enable these APIs (one at a time):
   - **"Places API"** - Click it, then click "ENABLE"
   - **"Maps JavaScript API"** - Click it, then click "ENABLE"

## Step 4: Create Your API Key

1. Go to: https://console.cloud.google.com/apis/credentials
2. Click "+ CREATE CREDENTIALS" at the top
3. Select "API key"
4. Google will show you a popup with your API key (looks like: `AIzaSy...`)
5. **Copy this key!**

## Step 5: Configure Your API Key (Important!)

1. In the API key popup, click "EDIT API KEY"
2. Under "Application restrictions", select:
   - **None** (for now, while testing)
3. Under "API restrictions", select:
   - **Restrict key** → Select "Places API" and "Maps JavaScript API"
4. Click "SAVE"

## Step 6: Add Your Key to the App

1. Open the file: `~/coffee-shop-app/.env.local`
2. Replace `your_api_key_here` with your actual key
3. Save the file

Example:
```
NEXT_PUBLIC_GOOGLE_MAPS_KEY=AIzaSyAbCd1234567890yourkeygoeshere
```

## Step 7: Restart Your App

1. Stop the server (press Ctrl+C in the terminal running it)
2. Start it again: `npm run dev`
3. Go to http://localhost:3000/shops

## What You Get For Free

- ✅ $200 credit per month
- ✅ ~6,000 searches per month
- ✅ Each search shows 20 coffee shops
- ✅ Real shop data, ratings, reviews, photos

## You Won't Pay Until...

You have more than ~300 active users who search 20+ times per month!

## Need Help?

If you see errors, check:
1. ✅ API key is correct (no extra spaces)
2. ✅ Both APIs are enabled (Places API + Maps JavaScript API)
3. ✅ You saved the `.env.local` file
4. ✅ You restarted the server

## Still Stuck?

Just tell me what error you see and I'll help fix it! ☕
