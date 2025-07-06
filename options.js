// Load saved options
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const result = await chrome.storage.sync.get(['geminiApiKey']);
        if (result.geminiApiKey) {
            document.getElementById('apiKey').value = result.geminiApiKey;
        }
    } catch (error) {
        console.error('Error loading options:', error);
    }
});

// Save options
document.getElementById('save').addEventListener('click', async () => {
    const apiKey = document.getElementById('apiKey').value.trim();
    const statusDiv = document.getElementById('status');
    
    if (!apiKey) {
        showStatus('Please enter an API key', 'error');
        return;
    }
    
    try {
        await chrome.storage.sync.set({ geminiApiKey: apiKey });
        showStatus('API key saved successfully!', 'success');
    } catch (error) {
        console.error('Error saving options:', error);
        showStatus('Error saving API key', 'error');
    }
});

function showStatus(message, type) {
    const statusDiv = document.getElementById('status');
    statusDiv.textContent = message;
    statusDiv.className = `status ${type}`;
    statusDiv.style.display = 'block';
    
    // Hide status after 3 seconds
    setTimeout(() => {
        statusDiv.style.display = 'none';
    }, 3000);
}
