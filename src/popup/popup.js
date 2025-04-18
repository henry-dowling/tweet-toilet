const BACKEND_URL = 'http://localhost:3000';



document.addEventListener('DOMContentLoaded', () => {
  console.log('popup.js loaded');

  const loginBtn = document.getElementById('loginBtn');
  const logoutBtn = document.getElementById('logoutBtn');
  const sendTweetBtn = document.getElementById('sendTweetBtn');
  const tweetInput = document.getElementById('tweetInput');
  const statusDiv = document.getElementById('status');
  const signedOutView = document.querySelector('.signed-out-view');
  const signedInView = document.querySelector('.signed-in-view');
  const userInfo = document.querySelector('.user-info');
  const tweetSection = document.querySelector('.tweet-section');

  tweetInput.focus();

  // Show signed-in view (for testing)
  signedOutView.style.display = 'none';
  signedInView.style.display = 'block';

  function playFlushAnimation() {
    // Create water swirl effect
    const waterEffect = document.createElement('div');
    waterEffect.className = 'water-effect';
    document.body.appendChild(waterEffect);

    // Add flush animation to tweet input
    tweetInput.classList.add('flush-animation');

    // Clean up after animation
    setTimeout(() => {
      waterEffect.remove();
      tweetInput.classList.remove('flush-animation');
    }, 1000);
  }

  function disableLogInButton(name) {
    loginBtn.style.display = 'none';
    tweetInput.disabled = false;
    sendTweetBtn.disabled = false;
    logoutBtn.style.display = 'inline-block';
    statusDiv.textContent = `Logged in as @${name}`;
    signedOutView.style.display = 'none';
    signedInView.style.display = 'block';
  }

  function enableLogInButton() {
    loginBtn.style.display = 'inline-block';
    logoutBtn.style.display = 'none';
    tweetInput.disabled = true;
    sendTweetBtn.disabled = true;
    signedOutView.style.display = 'block';
    signedInView.style.display = 'none';
  }

  chrome.storage.local.get(['twitterAuth', 'userName'], async (r) => {
    if (r.twitterAuth && r.userName) return disableLogInButton(r.userName);

    try {
      const resp = await fetch(`${BACKEND_URL}/is-user-logged-in`, {
        credentials: 'include',
      });
      if (!resp.ok) throw new Error('not logged');

      const { userName } = await resp.json();
      chrome.storage.local.set({ twitterAuth: true, userName }, () => {
        disableLogInButton(userName);
      });
    } catch {
      statusDiv.textContent = 'Not logged in';
      loginBtn.style.display = 'inline-block';
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

      // // Open Twitter auth in a new window
      const authWindow = window.open(`${BACKEND_URL}/auth/start`, 'Twitter Login', 'width=600,height=600');

    } catch (error) {
      statusDiv.textContent = 'Login failed. Please try again.';
      console.error('Login error:', error);
    }
  });

  logoutBtn.addEventListener('click', async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/logout`, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      enableLogInButton();
      chrome.storage.local.set({ twitterAuth: false, userName: null }, () => {
        statusDiv.textContent = 'Logged out successfully.';
        setTimeout(() => {
          statusDiv.textContent = '';
        }, 2000);
      });
    } catch (error) {
      console.error('Failed to log out:', error);
      statusDiv.textContent = 'Failed to log out. Please try again.';
    }

  })

  sendTweetBtn.addEventListener('click', async () => {
    const tweetText = tweetInput.value.trim();
    if (!tweetText) {
      statusDiv.textContent = 'Please enter a tweet.';
      return;
    }

    try {
      statusDiv.textContent = 'Sending tweet...';
      sendTweetBtn.disabled = true;

      const response = await fetch(`${BACKEND_URL}/tweet`, {
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

      playFlushAnimation();
      const result = await response.json();

      if (result.data && result.data.id) {
        statusDiv.innerHTML = `Tweet <a href="https://x.com/i/web/status/${result.data.id}" target="_blank">posted</a> successfully!`;
      } else {
        throw new Error('Tweet ID not available in response. Tweet not posted.');
      }

      tweetInput.value = ''; // Clear the input
    } catch (error) {
      console.error('Failed to send tweet:', error);
      statusDiv.textContent = 'Failed to send tweet. Please try again.';
    } finally {
      sendTweetBtn.disabled = false;
    }
  });
});
