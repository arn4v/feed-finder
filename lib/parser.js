const HTMLParser = require("htmlparser2");
const path = require("path");
const request = require("./request");
const url = require("url");

const contentTypes = [
  "application/x.atom+xml",
  "application/atom+xml",
  "application/xml",
  "text/xml",
  "application/rss+xml",
  "application/rdf+xml",
];

async function parser(url) {
  let rv = [];
  try {
    const response = await request(url);
    if (response.status === 200) {
      const data = await response.text();
      let base = null;

      if (response.url) {
        url = response.url;
      }

      // strip content-type extra info like 'text/xml; charset=utf-8'
      const header = (response.headers["content-type"] || "").split(";")[0];

      if (contentTypes.includes(header)) {
        return [url];
      }

      rv = await new Promise((resolve, reject) => {
        const _rv = [];
        const _htmlParser = new HTMLParser.Parser({
          onopentag(name, attrs) {
            let feed;

            if (name.toLowerCase() === "base" && (attrs.href || attrs.HREF)) {
              base = attrs.href || attrs.HREF;
            }

            if ((feed = isFeedLink(url, base, name, attrs))) {
              _rv.push(feed);
            }

            if ((feed = isPossiblyFeed(url, base, name, attrs))) {
              _rv.push(feed);
            }
          },
          onerror(err) {
            reject(err);
          },
          onend() {
            resolve(_rv);
          },
        });

        _htmlParser.parseComplete(data);
      });
    }
  } finally {
    return rv;
  }
}

function isFeedLink(originUrl, base, tagName, attrs) {
  tagName = tagName.toLowerCase();
  let href = attrs.href || attrs.HREF;
  let type = attrs.type || attrs.TYPE;

  if (href && tagName == "link" && contentTypes.includes(type)) {
    if (href.indexOf("http") === 0 || href.indexOf("//") === 0) {
      return url.resolve(originUrl, href);
    }
    return url.resolve(originUrl, base ? path.join(base, href) : href);
  }
}

function isPossiblyFeed(originUrl, base, tagName, attrs) {
  tagName = tagName.toLowerCase();
  let feedLike = /(\.(rdf|xml|rss)$|feed=(rss|atom)|(atom|feed|rss)\/?$)/i;
  let blacklist = /(add\.my\.yahoo|\.wp\.com\/|\?redir(ect)?=)/i;

  let href = attrs.href || attrs.HREF;

  if (
    ["a", "link"].includes(tagName) &&
    feedLike.test(href) &&
    !blacklist.test(href)
  ) {
    if (href.indexOf("http") === 0 || href.indexOf("//") === 0) {
      return url.resolve(originUrl, href);
    }
    return url.resolve(originUrl, base ? path.join(base, href) : href);
  }
}

module.exports = exports = parser;
