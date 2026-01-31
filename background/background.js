chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.type === 'bookDetected') {
        handleBookDetected(msg.payload).then(sendResponse);
        return true;
    }
    if (msg.type === 'addManualBook') {
        handleAddManualBook(msg.payload).then(sendResponse);
        return true;
    }
})

async function handleAddManualBook(book) {
    console.log('Adding manual book:', book)

    await new Promise((resolve) => {
        chrome.storage.local.get(['readingHistory'], (result) => {
            let books = result.readingHistory || [];
            books.push({
                ...book,
                timestamp: Date.now(),
                id: crypto.randomUUID()
            });
            chrome.storage.local.set({ readingHistory: books }, () => {
                console.log('Book added successfully');
                resolve();
            });
        });
    });

    const response = await sendBackendBookRequest(book);
    const { score, explanation } = response || {};
    return { score, explanation };
}

async function sendBackendBookRequest(book) {
    try {
        const { readingHistory = []} =
            await chrome.storage.local.get(['readingHistory'])
        const response = await fetch('http://localhost:8080/book', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                book,
                readingHistory
            })
        })
        return response.json()
    } catch (e) {
        console.error('Failed to reach backend:', e)
        return null
    }
}

async function handleBookDetected(book) {
    console.log('Book detected:', book)

    // store the latest detected book
    chrome.storage.local.set({ currentBook: book })
        .then(() => {
            console.log('Book data stored successfully');
        })
        .catch((error) => {
            console.error('Error storing book data:', error);
        });

    const response = await sendBackendBookRequest(book)

    const {score, explanation} = response || {};
    console.log('Backend response:', score)
    return {score, explanation};
}
