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

    const response = await sendBackendBookRequest(book);
    if(response){
        console.log("response", response);
        if(response.added) {
            console.log("Book added successfully")
            return true
        }
        else {
            console.log("Failed to add book")
            return false
        }
    } else{
        return false
    }
}



async function sendBackendPredictionRequest(book) {
    try {
        const response = await fetch('http://localhost:8080/prediction', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                book,
            })
        })
        return response.json()
    } catch (e) {
        console.error('Failed to reach backend:', e)
        return null
    }
}

async function sendBackendBookRequest(book) {
    try{
        const response = await fetch('http://localhost:8080/book', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                book,
            })
        })
        return response.json()
    } catch (e){
        console.error('Failed to reach backend:', e)
        return null
    }
}

async function handleBookDetected(book) {
    console.log('Book detected:', book)
    const response = await sendBackendPredictionRequest(book)

    const {score, explanation} = response || {};
    console.log('Backend response:', score)
    return {score, explanation};
}