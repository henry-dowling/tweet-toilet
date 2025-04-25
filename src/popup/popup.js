// const BACKEND_URL = 'http://localhost:3000';
const BACKEND_URL = 'https://api.tweettoilet.com';



document.addEventListener('DOMContentLoaded', () => {
  console.log('popup.js loaded');

  const loginBtn = document.getElementById('loginBtn');
  const logoutBtn = document.getElementById('logoutBtn');
  const sendTweetBtn = document.getElementById('sendTweetBtn');
  const addToThreadBtn = document.getElementById('addToThreadBtn');
  const threadContainer = document.getElementById('thread-container');
  const tweetInput = document.getElementById('tweetInput');
  const statusDiv = document.getElementById('status');
  const signedOutView = document.querySelector('.signed-out-view');
  const signedInView = document.querySelector('.signed-in-view');

  let isThread = false;

  function createTweetInput() {
    const container = document.createElement('div');
    container.className = 'thread-tweet-container';

    const textarea = document.createElement('textarea');
    textarea.className = 'thread-tweet';
    textarea.placeholder = 'Continue your thread...';
    addThreadTweetKeyboardHandler(textarea);

    const removeBtn = document.createElement('button');
    removeBtn.className = 'remove-tweet-btn';
    removeBtn.title = 'Remove from thread';
    removeBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>`;
    removeBtn.onclick = () => {
      container.remove();
      if (threadContainer.querySelectorAll('.thread-tweet').length === 1) {
        isThread = false;
      }
    };

    container.appendChild(textarea);
    container.appendChild(removeBtn);
    return container;
  }

  addToThreadBtn.addEventListener('click', () => {
    isThread = true;
    const newContainer = createTweetInput();
    threadContainer.appendChild(newContainer);
    // Focus the new textarea
    const newTextarea = newContainer.querySelector('textarea');
    newTextarea.focus();
  });

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

  function showMainPage(name) {
    document.getElementById('username').textContent = `@${name}`;
    signedOutView.style.display = 'none';
    signedInView.style.display = 'block';
    fetchAndUpdateProfilePicture();
    tweetInput.focus();
  }

  function showSignInPage() {
    signedOutView.style.display = 'flex';
    signedInView.style.display = 'none';
  }

  async function fetchAndUpdateProfilePicture() {
    try {
      // First check if we have a cached profile picture URL
      const { profilePictureUrl } = await new Promise(resolve => {
        chrome.storage.local.get(['profilePictureUrl'], resolve);
      });

      if (profilePictureUrl) {
        document.getElementById('profilePicture').src = profilePictureUrl;
        return;
      }

      const response = await fetch(`${BACKEND_URL}/user-profile`, {
        credentials: 'include',
      });
      
      if (!response.ok) throw new Error('Failed to fetch profile');
      
      const userData = await response.json();
      if (userData.profile_image_url) {
        const profilePicUrl = userData.profile_image_url;
        document.getElementById('profilePicture').src = profilePicUrl;
        // Cache the profile picture URL
        chrome.storage.local.set({ profilePictureUrl: profilePicUrl });
      }
    } catch (error) {
      console.error('Error fetching profile picture:', error);
    }
  }

  chrome.storage.local.get(['twitterAuth', 'userName'], async (r) => {
    if (r.twitterAuth && r.userName) {
      return showMainPage(r.userName)
    };

    try {
      console.log('checking if the error is logged in.');
      const resp = await fetch(`${BACKEND_URL}/is-user-logged-in`, {
        credentials: 'include',
      });
      if (!resp.ok) throw new Error('not logged');

      const { userName } = await resp.json();
      chrome.storage.local.set({ twitterAuth: true, userName }, () => {
        showMainPage(userName);
      });
    } catch (error) {
      console.log('error while signing the user: ', error);
      showSignInPage();
    }
  });

  // Handle Enter and Shift+Enter key presses
  tweetInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      // Command/Control + Enter to add to thread
      if ((e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        addToThreadBtn.click();
        return;
      }
      // Shift+Enter for newline
      if (e.shiftKey) {
        return;
      }
      // Enter to send
      e.preventDefault();
      sendTweetBtn.click();
    }
  });

  // Add keyboard event handler for thread tweets
  function addThreadTweetKeyboardHandler(textarea) {
    textarea.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        // Command/Control + Enter to add to thread
        if ((e.metaKey || e.ctrlKey)) {
          e.preventDefault();
          const currentPosition = Array.from(threadContainer.querySelectorAll('textarea')).indexOf(textarea);
          addToThreadBtn.click();
          // Focus will be handled by the addToThreadBtn click handler
          return;
        }
        // Shift+Enter for newline
        if (e.shiftKey) {
          return;
        }
        // Enter to send
        e.preventDefault();
        sendTweetBtn.click();
      }
    });
  }

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

      showSignInPage();
      chrome.storage.local.set({ 
        twitterAuth: false, 
        userName: null,
        profilePictureUrl: null 
      }, () => {
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
    const tweetInputs = threadContainer.querySelectorAll('.thread-tweet');
    const tweets = Array.from(tweetInputs)
      .map(input => input.value.trim())
      .filter(text => text.length > 0);

    if (tweets.length === 0) {
      statusDiv.textContent = 'Please enter a tweet.';
      return;
    }

    try {
      statusDiv.textContent = isThread ? 'Sending thread...' : 'Sending tweet...';
      sendTweetBtn.disabled = true;
      addToThreadBtn.disabled = true;

      const endpoint = isThread ? '/thread' : '/tweet';
      const body = isThread ? { tweets } : { text: tweets[0] };

      const response = await fetch(`${BACKEND_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      playFlushAnimation();
      const result = await response.json();

      if (isThread && result.thread) {
        const lastTweetId = result.thread[result.thread.length - 1].id_str;
        statusDiv.innerHTML = `Thread <a href="https://x.com/i/web/status/${lastTweetId}" target="_blank">posted</a> successfully!`;
      } else if (result.data && result.data.id) {
        statusDiv.innerHTML = `Tweet <a href="https://x.com/i/web/status/${result.data.id}" target="_blank">posted</a> successfully!`;
      } else {
        throw new Error('Tweet ID not available in response. Tweet not posted.');
      }

      // Clear all tweet inputs
      while (threadContainer.children.length > 1) {
        threadContainer.removeChild(threadContainer.lastChild);
      }
      tweetInput.value = '';
      isThread = false;

    } catch (error) {
      console.error('Failed to send tweet:', error);
      statusDiv.textContent = isThread ? 'Failed to send thread. Please try again.' : 'Failed to send tweet. Please try again.';
    } finally {
      sendTweetBtn.disabled = false;
      addToThreadBtn.disabled = false;
    }
  });
});
