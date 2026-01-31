chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.type === 'scrapeBookData') {
        const article = document.querySelector("#dp") || document.body;
        // send to popup
        const data = scrapeBookData(article);
        sendResponse(data);

        // send to background
        chrome.runtime.sendMessage({
            type: 'bookDetected',
            payload: data
        })
    }
});

