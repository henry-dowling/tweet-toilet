// Listen for installation
chrome.runtime.onInstalled.addListener(() => {
  console.log('Tweet Toilet extension installed');
});

// Listen for messages from popup or content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'AUTH_STATUS') {
    chrome.storage.local.get(['twitterAuth'], (result) => {
      sendResponse({ isAuthenticated: !!result.twitterAuth });
    });
    return true; // Required for async response
  }
}); 