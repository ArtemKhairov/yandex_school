const https = require("https");
const url = require("url");

const allLinks = new Set();

function getHtml(url) {
  return new Promise((resolve, reject) => {
    const request = https
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

function getLinks(html) {
  const regex = /<a[^>]*href=["']([^"']+)["'][^>]*>/gi;
  const links = [];
  let match;

  while ((match = regex.exec(html)) !== null) {
    const href = match[1].trim();
    if (href && href !== "#" && !href.startsWith("#")) {
      links.push(href);
    }
  }
  //   console.log(links)
  return links;
}

function getUrl(link, baseUrl) {
  const parsedBaseUrl = url.parse(baseUrl);
  const parsedLink = url.parse(link);

  if (!parsedLink.protocol) {
    parsedLink.protocol = parsedBaseUrl.protocol;
  }

  if (!parsedLink.host) {
    parsedLink.host = parsedBaseUrl.host;
  }

  return url.format(parsedLink);
}

async function crawl(str) {
  const queue = [str];
  const startTime = Date.now();
  const timer = 20 * 1000; // 20 sec

  while (queue.length > 0) {
    const url = queue.shift();
    if (allLinks.has(url)) {
      continue;
    }

    allLinks.add(url);
    console.log(allLinks);
    try {
      const html = await getHtml(url);
      if (Date.now() - startTime >= timer) {
        return allLinks;
      }

      const links = getLinks(html);
      for (const link of links) {
        const absoluteLink = getUrl(link, url);
        if (!allLinks.has(absoluteLink)) {
          queue.push(absoluteLink);
        }
      }
    } catch (err) {
      console.log(err, "err call crawl");
    }
  }
}
const initialUrl = "https://chiwassu.ru/naruto-shippuden-filler-episodes-list/";
crawl(initialUrl);
