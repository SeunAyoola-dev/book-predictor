chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.type === 'scrapeBookData') {
        const article = document.querySelector("#dp") || document.body;
        sendResponse(scrapeBookData(article));
    }
});