# Tweet Toilet Chrome Extension

A Chrome extension that allows users to send tweets in bulk.

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root directory with the following variables:
   ```
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   TWITTER_API_KEY=your_twitter_api_key
   TWITTER_API_SECRET=your_twitter_api_secret
   TWITTER_ACCESS_TOKEN=your_twitter_access_token
   TWITTER_ACCESS_SECRET=your_twitter_access_secret
   ```
4. Build the extension:
   ```bash
   npm run build
   ```

## Loading the Extension

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" in the top right
3. Click "Load unpacked" and select the `dist` directory

## Features

- Twitter authentication
- Send tweets
- Store tweets in Supabase
- View recent tweets

## Development

To start development with hot reloading:
```bash
npm run dev
```

## Project Structure

```
tweet-toilet/
├── src/
│   ├── background/
│   │   └── background.js       # Service worker for background tasks
│   ├── popup/
│   │   ├── popup.html         # Extension popup UI
│   │   ├── popup.js           # Popup logic
│   │   └── popup.css          # Popup styles
│   └── lib/
│       └── twitter.js         # Twitter API handling
├── public/
│   ├── icons/                 # Extension icons
│   └── manifest.json          # Chrome extension manifest
├── package.json
└── README.md
```

## Security Notes

- Never commit your API keys or secrets
- Keep your `.env` file in `.gitignore`
- Use appropriate permissions in the manifest.json 