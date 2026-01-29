import { describe, it, expect, beforeEach } from 'vitest';
import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';

// Helper to load the script into the test environment
const scriptContent = fs.readFileSync(path.resolve(__dirname, '../scripts/scrapeBookData.js'), 'utf8');

describe('scrapeBookData.js', () => {
    let dom;
    let window;
    let document;
    let getText, parseNumberOfPages, getAuthor, scrapeBookData;

    beforeEach(() => {
        dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
        window = dom.window;
        document = window.document;

        // Use Function constructor to evaluate the script content in a way that captures the functions
        // Since they are top-level functions in the script, evaluating it will define them in the global scope of the Function's context
        const context = {};
        const script = new window.Function('context', scriptContent + `
            context.getText = getText;
            context.parseNumberOfPages = parseNumberOfPages;
            context.getAuthor = getAuthor;
            context.scrapeBookData = scrapeBookData;
        `);
        script(context);
        getText = context.getText;
        parseNumberOfPages = context.parseNumberOfPages;
        getAuthor = context.getAuthor;
        scrapeBookData = context.scrapeBookData;
    });

    describe('getText', () => {
        it('should return trimmed text if element exists', () => {
            document.body.innerHTML = '<div id="test">  Hello World  </div>';
            expect(getText(document, '#test')).toBe('Hello World');
        });

        it('should return null if element does not exist', () => {
            expect(getText(document, '#nonexistent')).toBeNull();
        });
    });

    describe('parseNumberOfPages', () => {
        it('should return a number if valid text is provided', () => {
            expect(parseNumberOfPages('123')).toBe(123);
        });

        it('should return null if invalid text is provided', () => {
            expect(parseNumberOfPages('abc')).toBeNull();
        });

        it('should return null if null is provided', () => {
            expect(parseNumberOfPages(null)).toBeNull();
        });
    });

    describe('getAuthor', () => {
        it('should find author using various selectors', () => {
            document.body.innerHTML = '<div class="author"><a class="a-link-normal">Author Name</a></div>';
            expect(getAuthor(document)).toBe('Author Name');

            document.body.innerHTML = '<div id="bylineInfo"><a>Another Author</a></div>';
            expect(getAuthor(document)).toBe('Another Author');

            document.body.innerHTML = '<div class="contributorNameID">Third Author</div>';
            expect(getAuthor(document)).toBe('Third Author');
        });

        it('should return null if no author is found', () => {
            expect(getAuthor(document)).toBeNull();
        });
    });

    describe('scrapeBookData', () => {
        it('should scrape all book data correctly', () => {
            document.body.innerHTML = `
                <div id="dp">
                    <span id="productTitle">The Great Gatsby</span>
                    <div id="bylineInfo"><a>F. Scott Fitzgerald</a></div>
                    <span class="a-icon-alt">4.5 out of 5 stars</span>
                    <div class="rpi-attribute-value">
                        <span>180</span>
                    </div>
                </div>
            `;
            const article = document.querySelector('#dp');
            const data = scrapeBookData(article);

            expect(data).toEqual({
                title: 'The Great Gatsby',
                author: 'F. Scott Fitzgerald',
                rating: '4.5 out of 5 stars',
                parsedNumberOfPages: 180
            });
        });

        it('should handle missing data gracefully', () => {
            document.body.innerHTML = '<div id="dp"></div>';
            const article = document.querySelector('#dp');
            const data = scrapeBookData(article);

            expect(data).toEqual({
                title: null,
                author: null,
                rating: null,
                parsedNumberOfPages: null
            });
        });

        it('should return null if article is missing', () => {
            expect(scrapeBookData(null)).toBeNull();
        });
    });
});
