// Add startup listener to handle extension initialization
chrome.runtime.onStartup.addListener(() => {
  console.log("Extension started");
});

// Handle installation and updates
chrome.runtime.onInstalled.addListener((details) => {
  console.log("Extension installed/updated:", details.reason);
  
  // Remove any existing context menus first
  chrome.contextMenus.removeAll(() => {
    if (chrome.runtime.lastError) {
      console.error("Error removing context menus:", chrome.runtime.lastError.message);
    }
    
    // Create new context menu
    chrome.contextMenus.create({
      id: "getMeaning",
      title: "Get Meaning with Gemini",
      contexts: ["selection"]
    }, () => {
      if (chrome.runtime.lastError) {
        console.error("Context menu creation error:", chrome.runtime.lastError.message);
      } else {
        console.log("Context menu created successfully");
      }
    });
  });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === "getMeaning") {
    const selectedText = info.selectionText?.trim();

    if (selectedText) {
      console.log("Selected text:", selectedText);

      // Validate tab before proceeding
      if (!tab || !tab.id) {
        console.error("Invalid tab information");
        return;
      }

      try {
        const meaning = await getMeaningFromGemini(selectedText);

        // console.log("Gemini explanation:", meaning);

        // Truncate message if too long for notification
        const maxLength = 300;
        const displayMessage = meaning.length > maxLength 
          ? meaning.substring(0, maxLength) + "..." 
          : meaning;
        
        // Inject alert into the current page
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          function: showCustomAlert,  // Use custom alert for better UX
          args: [displayMessage]
        }, () => {
          if (chrome.runtime.lastError) {
            console.error("Custom alert injection error:", chrome.runtime.lastError.message);
            // Fallback to simple alert
            chrome.scripting.executeScript({
              target: { tabId: tab.id },
              function: showAlert,
              args: [displayMessage]
            });
          }
        });
      } catch (error) {
        console.error("Error getting meaning:", error);
        
        // Show error alert
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          function: showAlert,
          args: ["Error: Failed to get explanation. Please try again."]
        });
        
        // chrome.notifications.create({
        //   type: "basic",
        //   iconUrl: "icon.png",
        //   title: "Error",
        //   message: "Failed to get explanation. Please try again."
        // }, (notificationId) => {
        //   if (chrome.runtime.lastError) {
        //     console.error("Error notification failed:", chrome.runtime.lastError.message);
        //   }
        // });
      }
    } else {
      // console.log("No text selected.");
    }
  }
});

// Add message handler to prevent message port issues
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // console.log("Message received:", request);
  
  // Always send a response to prevent message port issues
  if (request.action === "ping") {
    sendResponse({ status: "pong" });
  } else {
    sendResponse({ status: "unknown_action" });
  }
  
  // Return true to indicate we will send an asynchronous response
  return true;
});

// Handle suspension/wake-up events
chrome.runtime.onSuspend.addListener(() => {
  console.log("Service worker suspending");
});

chrome.runtime.onSuspendCanceled.addListener(() => {
  console.log("Service worker suspension canceled");
});

// Function to be injected into pages for showing alerts
function showAlert(message) {
  alert("Gemini Explanation:\n\n" + message);
}

// Function for custom visual alert (better UX)
function showCustomAlert(message) {
  // Remove any existing custom alerts
  const existingAlert = document.getElementById('gemini-custom-alert');
  if (existingAlert) {
    existingAlert.remove();
  }

  // Create custom alert div
  const alertDiv = document.createElement('div');
  alertDiv.id = 'gemini-custom-alert';
  alertDiv.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 20px;
    border-radius: 10px;
    z-index: 10000;
    font-family: Arial, sans-serif;
    font-size: 14px;
    max-width: 400px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.3);
    border: 2px solid rgba(255,255,255,0.2);
  `;
  
  alertDiv.innerHTML = `
    <div style="font-weight: bold; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center;">
      <span>🤖 Gemini Explanation</span>
      <button onclick="this.parentElement.parentElement.remove()" style="background: none; border: none; color: white; font-size: 18px; cursor: pointer;">×</button>
    </div>
    <div style="line-height: 1.4;">${message}</div>
    <div style="margin-top: 10px; text-align: right;">
      <button onclick="this.parentElement.parentElement.remove()" style="background: rgba(255,255,255,0.2); border: none; color: white; padding: 5px 15px; border-radius: 5px; cursor: pointer;">Close</button>
    </div>
  `;
  
  document.body.appendChild(alertDiv);
  
  // Auto-remove after 10 seconds
  setTimeout(() => {
    if (document.getElementById('gemini-custom-alert')) {
      document.getElementById('gemini-custom-alert').remove();
    }
  }, 10000);
}

async function getMeaningFromGemini(selectedText) {
  // Store API key securely or load from storage
  let apiKey;
  try {
    const result = await chrome.storage.sync.get(['geminiApiKey']);
    apiKey = result.geminiApiKey;
    
    if (!apiKey) {
      // Fallback to hardcoded key (not recommended for production)
      apiKey = "AIzaSyAiCuAkSCsMQXWg1kZFhFnoSjaOfI5EqTk";
      console.warn("Using hardcoded API key. Consider storing it securely.");
    }
  } catch (error) {
    console.error("Error getting API key:", error);
    return "Error: Could not retrieve API key.";
  }

  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `Explain this in simple terms with examples and analogies: ${selectedText}. Don't make the sentence with "*" keep it plain text!!! Keep it small and concise not more than 200 characters!!!!!!`
              }
            ]
          }
        ]
      })
    });

    clearTimeout(timeoutId);

    const data = await response.json();
    // console.log("Full Gemini response:", data);

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const meaning =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "No explanation found.";

    return meaning;
  } catch (error) {
    if (error.name === 'AbortError') {
      // console.error("Request timeout:", error);
      return "Error: Request timed out. Please try again.";
    }
    // console.error("Error fetching from Gemini:", error);
    return "Error: Failed to get explanation.";
  }
}
