document.addEventListener('DOMContentLoaded', function() {
  // Ping the background script to ensure connection
  chrome.runtime.sendMessage({ action: "ping" }, (response) => {
    if (chrome.runtime.lastError) {
      console.error("Background connection error:", chrome.runtime.lastError.message);
    } else {
      console.log("Background connection established:", response);
    }
  });

  document.getElementById("clickme1").addEventListener("click", async () => {
    try {
      // Get the active tab
      let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

      if (!tab || !tab.id) {
        console.error("No active tab found");
        alert("Error: No active tab found");
        return;
      }

      // Check if we can access the tab
      if (tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://') || tab.url.startsWith('edge://')) {
        alert("Cannot inject scripts into browser pages");
        return;
      }

      // Inject code into the tab
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: injectedFunction
      }, (results) => {
        if (chrome.runtime.lastError) {
          console.error("Script injection error:", chrome.runtime.lastError.message);
          alert("Error injecting script: " + chrome.runtime.lastError.message);
        } else {
          console.log("Script injected successfully");
        }
      });
    } catch (error) {
      console.error("Error in popup script:", error);
      alert("Error: " + error.message);
    }
  });
});

// The function must be defined OUTSIDE the call
function injectedFunction() {
  // Create a better visual alert
  const existingAlert = document.getElementById('extension-alert');
  if (existingAlert) {
    existingAlert.remove();
  }

  const alertDiv = document.createElement('div');
  alertDiv.id = 'extension-alert';
  alertDiv.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #4CAF50;
    color: white;
    padding: 15px 20px;
    border-radius: 5px;
    z-index: 10000;
    font-family: Arial, sans-serif;
    font-size: 14px;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  `;
  alertDiv.textContent = 'Hello from the popup script!';
  
  document.body.appendChild(alertDiv);
  
  // Remove after 3 seconds
  setTimeout(() => {
    if (document.getElementById('extension-alert')) {
      document.getElementById('extension-alert').remove();
    }
  }, 3000);
}
