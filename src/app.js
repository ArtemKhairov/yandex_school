const https = require("https");
const urlModule = require("url");

const visitedUrls = new Set();
const allLinks = [];

function crawl(url) {
  const queue = [url];

  while (queue.length > 0) {
    const currentUrl = queue.shift();

    if (visitedUrls.has(currentUrl)) {
      continue;
    }

    visitedUrls.add(currentUrl);

    https
      .get(currentUrl, (response) => {
        let html = "";

        response.on("data", (chunk) => {
          html += chunk;
        });

        response.on("end", () => {
          const links = extractLinksFromHtml(html);
          allLinks.push(...links);

          for (const link of links) {
            const absoluteLink = getAbsoluteUrl(link, currentUrl);
            if (!visitedUrls.has(absoluteLink)) {
              queue.push(absoluteLink);
            }
          }
        });
      })
      .on("error", (error) => {
        console.error(`Error crawling ${currentUrl}:`, error);
      });
  }
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
crawl(initialUrl);

// Дождитесь окончания процесса краулинга
setTimeout(() => {
  console.log("Все ссылки на другие страницы:");
  console.log(allLinks);
}, 5000); // Примерно через 5 секунд (вы можете настроить время в соответствии с вашими потребностями)
