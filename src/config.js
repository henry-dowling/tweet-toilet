// Configuration for different environments
const config = {
  development: {
    BACKEND_URL: 'http://localhost:3001',
  },
  production: {
    BACKEND_URL: 'https://api.tweettoilet.com', // Replace with your production URL when ready
  },
};

// Use development config by default
window.APP_CONFIG = config.development; // We'll default to development for now 