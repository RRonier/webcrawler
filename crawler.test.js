const { normalizeURL, getURLsFromHTML } = require('./crawler.js')
const { test, expect } = require('@jest/globals')

test('normalizeURL strip protocol', () => {
    const input = 'https://blog.boot.dev/path'
    const actual = normalizeURL(input)
    const expected = 'blog.boot.dev/path'
    expect(actual).toEqual(expected)
})

test('normalizeURL strip trailing slash', () => {
    const input = 'https://blog.boot.dev/path'
    const actual = normalizeURL(input)
    const expected = 'blog.boot.dev/path'
    expect(actual).toEqual(expected)
})

test('getURLsFromHTML absolute URLs', () => {
    const inputHTMLBody = `
        <html>
            <body>
                <a href="https://blog.boot.dev/">Boot.dev Blog</a>
            </body>
        </html>
    `
    const inputBaseURL = "https://blog.boot.dev"
    const actual = getURLsFromHTML(inputHTMLBody, inputBaseURL)
    const expected = ["https://blog.boot.dev/"]
    expect(actual).toEqual(expected)
})

test('getURLsFromHTML relative URLs', () => {
    const inputHTMLBody = `
        <html>
            <body>
                <a href="/path/">Boot.dev Blog</a>
            </body>
        </html>
    `
    const inputBaseURL = "https://blog.boot.dev"
    const actual = getURLsFromHTML(inputHTMLBody, inputBaseURL)
    const expected = ["https://blog.boot.dev/path/"]
    expect(actual).toEqual(expected)
})

test('getURLsFromHTML absolute and relative URLs', () => {
    const inputHTMLBody = `
        <html>
            <body>
                <a href="/path1/">Boot.dev Blog Path One</a>
                <a href="https://blog.boot.dev/path2/">Boot.dev BlogPath Two</a>
            </body>
        </html>
    `
    const inputBaseURL = "https://blog.boot.dev"
    const actual = getURLsFromHTML(inputHTMLBody, inputBaseURL)
    const expected = ["https://blog.boot.dev/path1/", "https://blog.boot.dev/path2/"]
    expect(actual).toEqual(expected)
})

test('getURLsFromHTML invalid URL', () => {
    const inputHTMLBody = `
        <html>
            <body>
                <a href="invalid/">Invalid URL</a>
            </body>
        </html>
    `
    const inputBaseURL = "https://blog.boot.dev"
    const actual = getURLsFromHTML(inputHTMLBody, inputBaseURL)
    const expected = []
    expect(actual).toEqual(expected)
})