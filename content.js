document.addEventListener('DOMContentLoaded', function() {
    var screenshotButton = document.getElementById('screenshotButton');
  
    screenshotButton.addEventListener('click', function() {
      chrome.tabs.captureVisibleTab(null, { format: 'png' }, function(dataUrl) {
        if (dataUrl) {
          sendScreenshotEmail(dataUrl);
          console.log(dataUrl)
        } else {
          console.log('Failed to capture the screenshot.');
        }
      });
    });
  
    function sendScreenshotEmail(dataUrl) {
        fetch('http://localhost:3000/api/screenshot', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ screenshot: dataUrl }),
          
        })
          .then((response) => {
            if (response.ok) {
              console.log('Screenshot sent successfully.');
            } else {
              console.log('Failed to send the screenshot.');
            }
          })
          .catch((error) => {
            console.error('Error sending screenshot:', error);
          });
      }
    });