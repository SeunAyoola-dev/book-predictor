function getText(root, selector) {
    const el = root.querySelector(selector);
    return el ? el.textContent.trim() : null;
}

function parseNumberOfPages(text) {
    if (!text) return null;
    const parsed = parseInt(text, 10);
    return Number.isNaN(parsed) ? null: parsed;
}

function getAuthor(root) {
    const authorSelectors = [
        ".author a.a-link-normal",
        "#bylineInfo a",
        ".contributorNameID"
    ]
    for (const selector of authorSelectors) {
        const author = getText(root, selector)
        if (author) return author;
    }
    return null;
}

function scrapeBookData(article) {
    console.log("Scraping book data")
    if (!article) return null;

    // Book details
    const title = getText(article, '#productTitle')
    const author = getAuthor(article)
    const rating = getText(article, '.a-icon-alt') || getText(article, "span[data-hook='rating-out-of-text']")
    const numberOfPages = getText(article, '.rpi-attribute-value span')
    const parsedNumberOfPages = parseNumberOfPages(numberOfPages)
    const description = getText(article, "#bookDescription_feature_div .a-expander-content").replace(/\W/g, '')

    return {
        id: crypto.randomUUID(),
        title,
        author,
        rating,
        totalPages: parsedNumberOfPages,
        currentPage: 0,
        status: "reading",
        startTime: Date.now(),
        userRating: null,
        description
    }
}
