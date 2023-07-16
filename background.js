// Background script for the extension
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === 'captureScreenshot') {
      chrome.tabs.captureVisibleTab(null, { format: 'png' }, function(dataUrl) {
        sendResponse({ screenshot: dataUrl });
      });
      return true; // Enable asynchronous response
    }
  });
  
  chrome.runtime.onInstalled.addListener(function() {
    console.log('Extension installed!');
  });
  