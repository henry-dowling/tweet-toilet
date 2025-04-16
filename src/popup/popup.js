import { createClient } from '@supabase/supabase-js';
import { TwitterApi } from 'twitter-api-v2';

// Initialize Supabase client
const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseKey = 'YOUR_SUPABASE_ANON_KEY';
const supabase = createClient(supabaseUrl, supabaseKey);

// Initialize Twitter client
const twitterClient = new TwitterApi({
  appKey: 'YOUR_TWITTER_API_KEY',
  appSecret: 'YOUR_TWITTER_API_SECRET',
  accessToken: 'YOUR_TWITTER_ACCESS_TOKEN',
  accessSecret: 'YOUR_TWITTER_ACCESS_SECRET',
});

document.addEventListener('DOMContentLoaded', () => {
  const loginBtn = document.getElementById('loginBtn');
  const sendTweetBtn = document.getElementById('sendTweetBtn');
  const tweetInput = document.getElementById('tweetInput');
  const statusDiv = document.getElementById('status');

  // Check if user is already logged in
  chrome.storage.local.get(['twitterAuth'], (result) => {
    if (result.twitterAuth) {
      loginBtn.style.display = 'none';
      tweetInput.disabled = false;
      sendTweetBtn.disabled = false;
    }
  });

  loginBtn.addEventListener('click', async () => {
    try {
      // Implement Twitter OAuth flow here
      statusDiv.textContent = 'Logging in...';
      // After successful login, store auth token
      chrome.storage.local.set({ twitterAuth: true }, () => {
        loginBtn.style.display = 'none';
        tweetInput.disabled = false;
        sendTweetBtn.disabled = false;
        statusDiv.textContent = 'Logged in successfully!';
      });
    } catch (error) {
      statusDiv.textContent = 'Login failed. Please try again.';
      console.error('Login error:', error);
    }
  });

  sendTweetBtn.addEventListener('click', async () => {
    const tweetText = tweetInput.value.trim();
    if (!tweetText) {
      statusDiv.textContent = 'Please enter a tweet.';
      return;
    }

    try {
      statusDiv.textContent = 'Sending tweet...';
      // Send tweet using Twitter API
      const tweet = await twitterClient.v2.tweet(tweetText);
      
      // Store tweet in Supabase
      const { data, error } = await supabase
        .from('tweets')
        .insert([
          { 
            tweet_id: tweet.data.id,
            text: tweetText,
            created_at: new Date().toISOString()
          }
        ]);

      if (error) throw error;

      statusDiv.textContent = 'Tweet sent successfully!';
      tweetInput.value = '';
    } catch (error) {
      statusDiv.textContent = 'Failed to send tweet. Please try again.';
      console.error('Tweet error:', error);
    }
  });
}); 