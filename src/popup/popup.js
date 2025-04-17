document.addEventListener('DOMContentLoaded', () => {
  const loginBtn = document.getElementById('loginBtn');
  const sendTweetBtn = document.getElementById('sendTweetBtn');
  const tweetInput = document.getElementById('tweetInput');
  const statusDiv = document.getElementById('status');

  tweetInput.focus()

  // Check if user is already logged in
  chrome.storage.local.get(['twitterAuth'], (result) => {
    if (result.twitterAuth) {
      loginBtn.style.display = 'none';
      tweetInput.disabled = false;
      sendTweetBtn.disabled = false;
    }
  });

  // Handle Enter and Shift+Enter key presses
  tweetInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      if (e.shiftKey) {
        // Allow default behavior (newline) when Shift+Enter is pressed
        return;
      }
      // Prevent default behavior and submit tweet when Enter is pressed
      e.preventDefault();
      sendTweetBtn.click();
    }
  });

  loginBtn.addEventListener('click', async () => {
    try {
      statusDiv.textContent = 'Logging in...';
      
      // Open Twitter auth in a new window
      const authWindow = window.open('http://localhost:3000/auth/start', 'Twitter Login', 'width=600,height=600');
      
      // Listen for messages from the auth window
      window.addEventListener('message', function(event) {
        if (event.origin !== 'http://localhost:3000') return;
        
        if (event.data === 'twitter-auth-success') {
          authWindow.close();
          chrome.storage.local.set({ twitterAuth: true }, () => {
            loginBtn.style.display = 'none';
            tweetInput.disabled = false;
            sendTweetBtn.disabled = false;
            statusDiv.textContent = 'Logged in successfully!';
          });
        }
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
      sendTweetBtn.disabled = true;

      const response = await fetch('http://localhost:3000/tweet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: tweetText }),
        credentials: 'include', // Important: This ensures cookies are sent with the request
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      statusDiv.textContent = 'Tweet sent successfully!';
      tweetInput.value = ''; // Clear the input
    } catch (error) {
      console.error('Failed to send tweet:', error);
      statusDiv.textContent = 'Failed to send tweet. Please try again.';
    } finally {
      sendTweetBtn.disabled = false;
    }
  });
}); 