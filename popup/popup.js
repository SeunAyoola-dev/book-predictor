const contentEl = document.getElementById("content");
const form = document.getElementById("manual-form");

const submitBtn = document.getElementById("m-submit");

submitBtn?.addEventListener("click", async () => {
    const book = {
        title: document.getElementById("m-title").value,
        author: document.getElementById("m-author").value,
        genre: document.getElementById("m-genre").value,
        rating: document.getElementById("m-rating").value,
        numberOfPages: document.getElementById("m-pages").value
    }

    setContent("Calculating score...");
    const response = await chrome.runtime.sendMessage({type: 'addManualBook', payload: book})
    if (response && response.score !== undefined) {
        setContent(`Likelihood of Completion: ${response.score}%`)
    } else {
        setContent("Book added successfully.");
    }
})

function setContent(text) {
    if (contentEl) contentEl.innerText = text;
}

function isSupportedUrl(url){
    try {
        const u = new URL(url);
        return u.protocol === 'https:' && u.hostname.startsWith('www.amazon.');
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
        if (response && response.score !== undefined) {
            const {score} = response;
            setContent(`Likelihood of Completion: ${score}%`)
        } else {
            setContent("Could not retrieve score.")
        }
    } catch (e) {
        console.error("Failed to reach content script:", e)
        setContent("Couldn't reach the page. Reload tab and try again")
        return null;
    }
}

sendMessageToActiveTab({type: 'scrapeBookData'})


