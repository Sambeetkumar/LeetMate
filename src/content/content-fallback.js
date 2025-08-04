chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    sendResponse({ text: "" });
    return true;
});