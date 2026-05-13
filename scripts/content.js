chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.type === 'scrapeBookData') {
        const article = document.querySelector("#dp") || document.body;

        // send to background
        const data = scrapeBookData(article);
        chrome.runtime.sendMessage({
            type: 'bookDetected',
            payload: data
        }).then(response => {
            sendResponse(response);
        });
        return true;
    }
});

