import { describe, it, expect, beforeEach, vi } from 'vitest';
import fs from 'fs';
import path from 'path';

// Load script content
const scriptContent = fs.readFileSync(path.resolve(__dirname, '../popup/popup.js'), 'utf8');

describe('popup.js', () => {
    let isSupportedUrl;

    beforeEach(() => {
        // Mocking DOM and Chrome API
        const chromeMock = {
            tabs: {
                query: vi.fn().mockResolvedValue([{ id: 1, url: 'https://www.amazon.com' }]),
                sendMessage: vi.fn().mockResolvedValue({ title: 'Test Book' })
            }
        };
        const documentMock = {
            getElementById: vi.fn().mockReturnValue({ innerText: '' })
        };

        const context = {};
        const script = new Function('document', 'chrome', 'context', scriptContent + '\n context.isSupportedUrl = isSupportedUrl;');
        script(documentMock, chromeMock, context);
        isSupportedUrl = context.isSupportedUrl;
    });

    describe('isSupportedUrl', () => {
        it('should return true for valid Amazon URL', () => {
            expect(isSupportedUrl('https://www.amazon.com/some-book')).toBe(true);
        });

        it('should return false for non-Amazon URL', () => {
            expect(isSupportedUrl('https://www.google.com')).toBe(false);
        });

        it('should return false for non-https Amazon URL', () => {
            expect(isSupportedUrl('http://www.amazon.com')).toBe(false);
        });

        it('should return false for invalid URL strings', () => {
            expect(isSupportedUrl('not-a-url')).toBe(false);
        });
    });
});
