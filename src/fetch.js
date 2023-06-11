const https = require("https");
const urlModule = require("url");

const allLinks = new Set();

async function crawl(initialUrl) {
  const queue = [initialUrl];

  while (queue.length > 0) {
    const currentUrl = queue.shift();

    if (allLinks.has(currentUrl)) {
      continue;
    }

    allLinks.add(currentUrl);

    try {
      const html = await fetchHtml(currentUrl);
      const links = extractLinksFromHtml(html);

      for (const link of links) {
        const absoluteLink = getAbsoluteUrl(link, currentUrl);
        if (!allLinks.has(absoluteLink)) {
          queue.push(absoluteLink);
        }
      }
    } catch (error) {
      console.error(`Error crawling ${currentUrl}:`, error);
    }
  }
}

function fetchHtml(url) {
console.log(url);
  return new Promise((resolve, reject) => {
    https
      .get(url, (response) => {
        let html = "";

        response.on("data", (chunk) => {
          html += chunk;
        });

        response.on("end", () => {
          resolve(html);
        });
      })
      .on("error", (error) => {
        reject(error);
      });
  });
}

function extractLinksFromHtml(html) {
  const regex = /<a[^>]*href=["']([^"']+)["'][^>]*>/gi;
  const links = [];
  let match;

  while ((match = regex.exec(html)) !== null) {
    const href = match[1].trim();
    if (href && href !== "#" && !href.startsWith("#")) {
      links.push(href);
    }
  }

  return links;
}

function getAbsoluteUrl(link, baseUrl) {
  const parsedBaseUrl = urlModule.parse(baseUrl);
  const parsedLink = urlModule.parse(link);

  if (!parsedLink.protocol) {
    parsedLink.protocol = parsedBaseUrl.protocol;
  }

  if (!parsedLink.host) {
    parsedLink.host = parsedBaseUrl.host;
  }

  return urlModule.format(parsedLink);
}

const initialUrl = "https://chiwassu.ru/naruto-shippuden-filler-episodes-list/";
crawl(initialUrl)
  .then(() => {
    console.log("Все ссылки на другие страницы:");
    console.log(Array.from(allLinks));
  })
  .catch((error) => {
    console.error("Error crawling:", error);
  });
