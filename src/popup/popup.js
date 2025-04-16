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

      window.open(
        "http://localhost:3000/auth/start",
        "_blank",
        "width=600,height=700"
      );

      const delays = [1000, 2000, 5000]; // 1s, 2s, 5s

      for (let delay of delays) {
        await new Promise(resolve => setTimeout(resolve, delay));
        const res = await fetch("http://localhost:3000/get-user", {
          method: "GET",
          credentials: "include", // include cookies
        });

        if (res.ok) {
          const user = await res.json();
          statusDiv.textContent = `Logged in as @${user.username} (ID: ${user.id})`;
          return;
        }
      }

      statusDiv.textContent = 'Login timeout. Please try again.';

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

      const response = await fetch("http://localhost:3000/tweet", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ text: tweetText }),
        credentials: "include",
      });

      if (!response.ok) throw new Error(await response.text());

      const result = await response.text(); // or use .json() if you return JSON
      console.log("Tweet result:", result);
      statusDiv.textContent = 'Tweet sent successfully!';
      tweetInput.value = '';
    } catch (error) {
      statusDiv.textContent = 'Failed to send tweet. Please try again.';
      console.error('Tweet error:', error);
    }
  });
});
