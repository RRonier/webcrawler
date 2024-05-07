const { JSDOM } = require('jsdom')
const fs = require('fs')

async function crawlPage(baseURL, currentURL, pages) {
    const baseUrlObj = new URL(baseURL)
    const currentURLObj = new URL(currentURL)
    if (baseUrlObj.hostname !== currentURLObj.hostname) {
        return pages
    }

    const normalizedCurrentURL = normalizeURL(currentURL)
    if (pages[normalizedCurrentURL] > 0) {
        pages[normalizedCurrentURL]++

        return pages
    }

    pages[normalizedCurrentURL] = 1
    console.log(`actively crawling: ${currentURL}`)

    try {
        const resp = await fetch(currentURL)

        if (resp.status > 399) {
            console.log(`error in fetch with status code: ${resp.status} on page: ${currentURL}`)
            return pages
        }

        const contentType = resp.headers.get("content-type")
        if (!contentType.includes("text/html")) {
            console.log(`non html response, content type: ${contentType} on page: ${currentURL}`)
            return pages
        }

        const htmlBody = await resp.text()
        const nextURLs = getURLsFromHTML(htmlBody, baseURL)

        const dom = new JSDOM(htmlBody)
        const title = dom.window.document.querySelector('h1')
        const bodyList = dom.window.document.querySelectorAll('p')
        const secondaryBody = dom.window.document.getElementsByClassName('text-secondary')[0]

        const dataFolder = './data';
        try {
            if (!fs.existsSync(dataFolder)) {
                fs.mkdirSync(dataFolder);
            }
        } catch (err) {
            console.error('Error creating data folder:', err);
        }
        let titleString = title.textContent.trim();
        let bodyString = bodyList[0]?.textContent?.trim() || secondaryBody?.textContent.trim();
        const filePath = `${dataFolder}/${titleString}.txt`;

        fs.writeFileSync(filePath, `title: ${titleString}${'\n'}body: ${bodyString}`
        );

        // for(const nextURL of nextURLs) {
        for (let i = 0; i < process.argv[3]; i++) {
            pages = await crawlPage(baseURL, nextURLs[i], pages)
        }
    } catch (err) {
        console.log(`error in fetch: ${err.message}, on page: ${currentURL}`)
    }

    return pages
}
function getURLsFromHTML(htmlBody, baseURL) {
    const urls = []
    const dom = new JSDOM(htmlBody)
    const linkElements = dom.window.document.querySelectorAll('a')

    for (const linkElement of linkElements) {
        if (linkElement.href.slice(0, 1) === '/') { //relative
            try {
                const urlObj = new URL(`${baseURL}${linkElement.href}`)
                urls.push(urlObj.href)
            } catch (err) {
                console.log(`error with relative url: ${err.message}`)
            }
        } else { //absolute
            try {
                const urlObject = new URL(linkElement.href)
                urls.push(urlObject.href)
            } catch (err) {
                console.log(`error with absolute url: ${err.message}`)
            }
        }
    }

    return urls
}

function normalizeURL(urlString) {
    const urlObj = new URL(urlString)
    const hostPath = `${urlObj.hostname}${urlObj.pathname}`
    if (hostPath.length > 0 && hostPath.slice(-1) === '/') {
        return hostPath.slice(0, -1)
    }

    return hostPath
}

module.exports = {
    normalizeURL,
    getURLsFromHTML,
    crawlPage
}