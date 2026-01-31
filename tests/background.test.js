import { describe, it, expect, beforeEach, vi } from 'vitest';
import fs from 'fs';
import path from 'path';

// Load script content
const scriptContent = fs.readFileSync(path.resolve(__dirname, '../background/background.js'), 'utf8');

describe('background.js', () => {
    let chromeMock;
    let handleBookDetected, addManualBook;
    let messageListeners = [];

    beforeEach(() => {
        messageListeners = [];
        
        // Mocking Chrome API
        chromeMock = {
            runtime: {
                onMessage: {
                    addListener: vi.fn((listener) => {
                        messageListeners.push(listener);
                    })
                }
            },
            storage: {
                local: {
                    set: vi.fn().mockReturnValue(Promise.resolve()),
                    get: vi.fn((keys, callback) => {
                        if (callback) {
                            callback({});
                        }
                        return Promise.resolve({});
                    })
                }
            }
        };

        // Mock crypto.randomUUID
        if (!global.crypto) {
            global.crypto = {};
        }
        vi.spyOn(global.crypto, 'randomUUID').mockReturnValue('mocked-uuid');

        // Mock console.log/error to avoid cluttering test output
        vi.spyOn(console, 'log').mockImplementation(() => {});
        vi.spyOn(console, 'error').mockImplementation(() => {});

        // Use Function constructor to evaluate script and extract functions
        // We need to pass chrome and other globals
        const context = {};
        const script = new Function('chrome', 'console', 'crypto', 'context', 
            scriptContent + 
            '\n context.handleBookDetected = handleBookDetected;' +
            '\n context.addManualBook = addManualBook;'
        );
        script(chromeMock, console, global.crypto, context);
        
        handleBookDetected = context.handleBookDetected;
        addManualBook = context.addManualBook;
    });

    describe('Message Listeners', () => {
        it('should register message listeners', () => {
            expect(chromeMock.runtime.onMessage.addListener).toHaveBeenCalledTimes(2);
        });

        it('should call handleBookDetected when bookDetected message is received', async () => {
            const payload = { title: 'Test Book' };
            const msg = { type: 'bookDetected', payload };
            
            // In background.js, there are two separate listeners. 
            // The first one handles bookDetected.
            messageListeners[0](msg);

            await new Promise(process.nextTick);
            
            expect(chromeMock.storage.local.set).toHaveBeenCalledWith({ currentBook: payload });
        });

        it('should call addManualBook when addManualBook message is received', () => {
            const payload = { title: 'Manual Book' };
            const msg = { type: 'addManualBook', payload };
            
            // The second one handles addManualBook.
            messageListeners[1](msg);
            
            expect(chromeMock.storage.local.get).toHaveBeenCalledWith(['readingHistory'], expect.any(Function));
        });
    });

    describe('handleBookDetected', () => {
        it('should store the book in currentBook', async () => {
            const book = { title: 'Detected Book' };
            handleBookDetected(book);
            
            // Wait for promise to resolve
            await new Promise(process.nextTick);

            expect(chromeMock.storage.local.set).toHaveBeenCalledWith({ currentBook: book });
            expect(console.log).toHaveBeenCalledWith('Book data stored successfully');
        });

        it('should log error if storage.set fails', async () => {
            const error = new Error('Storage error');
            chromeMock.storage.local.set.mockReturnValue(Promise.reject(error));
            
            const book = { title: 'Detected Book' };
            handleBookDetected(book);
            
            // Wait for promise to resolve
            await new Promise(process.nextTick);

            expect(console.error).toHaveBeenCalledWith('Error storing book data:', error);
        });
    });

    describe('addManualBook', () => {
        it('should add a book to readingHistory', () => {
            const book = { title: 'New Book' };
            const existingHistory = [{ title: 'Old Book', id: 'old-uuid', timestamp: 123 }];
            
            chromeMock.storage.local.get.mockImplementation((keys, callback) => {
                callback({ readingHistory: [...existingHistory] });
            });

            vi.useFakeTimers();
            vi.setSystemTime(new Date('2024-01-01'));
            const now = Date.now();

            addManualBook(book);

            expect(chromeMock.storage.local.set).toHaveBeenCalledWith({
                readingHistory: [
                    ...existingHistory,
                    {
                        ...book,
                        timestamp: now,
                        id: 'mocked-uuid'
                    }
                ]
            }, expect.any(Function));

            vi.useRealTimers();
        });

        it('should initialize readingHistory if it does not exist', () => {
            const book = { title: 'First Book' };
            
            chromeMock.storage.local.get.mockImplementation((keys, callback) => {
                callback({}); // Empty storage
            });

            vi.useFakeTimers();
            vi.setSystemTime(new Date('2024-01-01'));
            const now = Date.now();

            addManualBook(book);

            expect(chromeMock.storage.local.set).toHaveBeenCalledWith({
                readingHistory: [
                    {
                        ...book,
                        timestamp: now,
                        id: 'mocked-uuid'
                    }
                ]
            }, expect.any(Function));

            vi.useRealTimers();
        });
    });
});
