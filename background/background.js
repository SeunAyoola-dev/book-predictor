chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.type === 'bookDetected') {
        handleBookDetected(msg.payload)
    }
})

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.type === 'addManualBook') {
        addManualBook(msg.payload)
    }
})

function handleBookDetected(book) {
    console.log('Book detected:', book)

    // store the latest detected book
    chrome.storage.local.set({ currentBook: book })
        .then(() => {
            console.log('Book data stored successfully');
        })
        .catch((error) => {
            console.error('Error storing book data:', error);
        });
    // TODO: send to backend
}

function addManualBook(book) {
    console.log('Adding manual book:', book)

    chrome.storage.local.get(['readingHistory'], (result) => {
        let books = result.readingHistory || [];
        books.push({
            ...book,
            timestamp: Date.now(),
            id: crypto.randomUUID()
            }
        );
        chrome.storage.local.set({ readingHistory: books }, () => {
            console.log('Book added successfully');
        });
    });
}