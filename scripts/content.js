function scrapeBookData(article) {
    console.log("Scraping book data")
    if (!article) return null;

    const getText = (selector) => {
        const el = article.querySelector(selector);
        return el ? el.innerText.trim() : null;
    }
    // Book details
    const title = getText('#productTitle') //id
    let author = null;
    const authorSelectors = [
        ".author a.a-link-normal",
        "#bylineInfo a",
        ".contributorNameID"
    ]
    for (const selector of authorSelectors) {
        author = getText(selector)
        if (author) break;
    }
    const rating = getText('.a-icon-alt') || getText("span[data-hook='rating-out-of-text']")
    const numberOfPages = getText('.rpi-attribute-value span')
    const parsedNumberOfPages = parseInt(numberOfPages, 10) ? parseInt(numberOfPages, 10) : null

    return {title, author, rating, parsedNumberOfPages}
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.type === 'scrapeBookData') {
        const article = document.querySelector("#dp") || document.body;
        sendResponse(scrapeBookData(article));
    }
});