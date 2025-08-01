# Gemini Explainer Chrome Extension

A Chrome extension that provides instant explanations of selected text using Google's Gemini AI.

## Setting Up Your API Key

To use the Gemini Explainer extension, you need to enter your API key directly in the `background.js` file. Follow these steps:

1. Open the `background.js` file in your code editor.

2. Locate the following line in the `getMeaningFromGemini` function (around line 185):

   ```javascript
   apiKey = "YOUR_API_KEY_HERE";
   ```

3. Replace `"YOUR_API_KEY_HERE"` with your actual Gemini API key. Make sure to keep the quotes around your API key. For example:

   ```javascript
   apiKey = "AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxx";
   ```

4. Save the changes to the `background.js` file.

## Installing the Extension in Chrome

1. Open Google Chrome browser.

2. Navigate to `chrome://extensions/` in your address bar.

3. Enable "Developer mode" by toggling the switch in the top-right corner.

4. Click the "Load unpacked" button.

5. Browse and select the `GeminiExplainer` folder (the folder containing `background.js`, `manifest.json`, etc.).

6. The extension should now appear in your extensions list and be ready to use.

## How to Use

1. Select any text on a webpage.
2. Right-click on the selected text.
3. Choose "Get Meaning with Gemini" from the context menu.
4. A popup will appear with the AI explanation of the selected text.

## Getting Your Gemini API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Create a new API key
4. Copy the generated key and paste it in the `background.js` file as described above

Now your extension is ready to use!