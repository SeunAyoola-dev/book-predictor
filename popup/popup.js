const contentEl = document.getElementById("content");
const form = document.getElementById("manual-form");

form?.addEventListener("submit", (e) => {
    e.preventDefault() // prevents the popup from reloading when submitting a form

    const book = {
        title: document.getElementById("title").value,
        author: document.getElementById("author").value,
        genre: document.getElementById("genre").value,
        rating: document.getElementById("rating").value,
        numberOfPages: document.getElementById("numberOfPages").value
    }

    chrome.runtime.sendMessage({type: 'addManualBook', payload: book})
})

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
    const [tab] = await chrome.tabs.query({active: true, lastFocusedWindow: true});
    if (!tab || !isSupportedUrl(tab.url)) {
        setContent("This plugin only works on Amazon books. (For now...)");
        return null
    }

    try {
        console.log("Sending message to tab:", tab.id)
        const response = await chrome.tabs.sendMessage(tab.id, message);
        console.log("Received response:", response)
        const chanceOfCompletion = response.parsedNumberOfPages >= 500 ? 20 : 60;
        setContent(`Likelihood of Completion: ${chanceOfCompletion}%`)
    } catch (e) {
        console.error("Failed to reach content script:", e)
        setContent("Couldn't reach the page. Reload tab and try again")
        return null;
    }
}

sendMessageToActiveTab({type: 'scrapeBookData'})


