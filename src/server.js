const express = require("express");
const https = require("https");

const app = express();

const port = 3000;
const fileExtensionsRegex =
  /\.(jpg|jpeg|png|gif|bmp|ico|svg|webp|mp4|webm|ogg|mp3|wav|flac|aac|pdf|doc|docx|xls|xlsx|ppt|pptx|zip|rar|tar|gz)$/i;
// Проверка на корректность доменного имени
function getDomainUrl(urlString) {
  try {
    const url = new URL(urlString.trim());

    return url;
  } catch (error) {
    return null;
  }
}

function getHashedURLs(url) {
  if (fileExtensionsRegex.exec(url) === null) {
    if (url.href.length - 1 === url.href.lastIndexOf("/")) {
      // console.log(url);
      return url.href;
    } else {
      return url.href + "/";
    }
  } else {
    return null;
  }
}

// remove local links
function getStringBeforeHash(str) {
  const hashIndex = str.indexOf("#");
  if (hashIndex !== -1) {
    return str.substring(0, hashIndex);
  }
  return str;
}

// function getURL(str) {
//   try {
//     const url = new URL(str);
//     return url;
//   } catch (error) {
//     return null;
//   }
// }

app.listen(port, async () => {
  https.get(
    "https://chiwassu.ru/naruto-shippuden-filler-episodes-list/",
    (res) => {
      let rawData = "";
      const regex = /<a\s+(?:[^>]*?\s+)?href=(["'])(.*?)\1[^>]*?>/gi;
      // console.log(res.socket._host)
      res.setEncoding("utf8");
      res.on("data", (c) => {
        rawData += c;
      });

      const parsedUrls = {};
      parsedUrls[res.socket._host] = new Set();

      res
        .on("end", () => {
          let match;
          while ((match = regex.exec(rawData)) !== null) {
            const href = match[2];
            const url = getDomainUrl(match[2]);
            if (href !== "" && url) {
              const hashedUrl = getHashedURLs(url);
              if (!parsedUrls[url.hostname]) {
                parsedUrls[url.hostname] = new Set();
              }
              if (hashedUrl) {
                parsedUrls[url.hostname].add(getStringBeforeHash(hashedUrl));
              }
              // links.add(getStringBeforeHash(href));
              // links.add(url.href);
            }
          }
          console.log(parsedUrls[res.socket._host]);
          // console.log(links);
          // console.log(parsedUrls);
        })
        .on("error", (error) => {
          console.log(error);
        });
    }
  );
  console.log("App is runnig");
});

// let obj = {
//   "orig": new Set(),
//   "m": new Map(),
// }
// console.log(obj);

// Получить оригин урл и использовать его в качестве уникадьного значения в объекте
// В качестве хначений выбрать сет

// Собрать все ссылки
// Проверить на ссылки на странциы
// Фильтрация по картинкам аудио видео музыка

// Все ссылки с сайта пробежать
