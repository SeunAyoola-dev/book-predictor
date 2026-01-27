const contentEl = document.getElementById("content");

function setContent(text) {
    if (contentEl) contentEl.innerText = text;
}

function isSupportedUrl(url){
    try {
        const u = new URL(url);
        return u.protocol === 'https:' && u.hostname === 'www.amazon.com';
    } catch {
        return false
    }
}

async function sendMessageToActiveTab(message) {
    console.log("Sending message:")
    const [tab] = await chrome.tabs.query({active: true, lastFocusedWindow: true});
    if (!tab || !isSupportedUrl(tab.url)) {
        setContent("Not on Amazon");
        return  null
    }

    try {
        console.log("Sending message to tab:", tab.id)
        const response = await chrome.tabs.sendMessage(tab.id, message);
        if (response.parsedNumberOfPages >= 500) {
            setContent("20% Likelihood of Completion")
        } else {
            setContent(`60% Likelihood of Completion`)
        }
    } catch (e) {
        console.error("Failed to reach content script:", e)
        setContent("Couldn't reach the page. Reload tab and try again")
        return null;
    }

}

sendMessageToActiveTab({type: 'scrapeBookData'})


