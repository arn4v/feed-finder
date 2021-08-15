"use strict";
const parser = require("./parser");
const url = require("url");

/**
 * @param {Array<unknown>} arr
 */
const dedupe = (arr) => {
  return [...new Set(arr)];
};

/**
 * @param {Array<Array<unknown>>} arrays
 */
const flatten = (arrays) => {
  return Array.prototype.concat.apply([], arrays);
};

const knownFeedEndpoints = [
  "/?feed=rss",
  "/?feed=rss2",
  "/?feed=rdf",
  "/?feed=atom",
  "/feed/",
  "/feed/rss/",
  "/feed/rss2/",
  "/feed/rdf/",
  "/feed/atom/",
  "/services/rss/",
];

function populateWithKnownFeedEndpoints(inputUrl) {
  if (!inputUrl) return;
  inputUrl = url.parse(inputUrl);
  return knownFeedEndpoints.map(function (endpoint) {
    return inputUrl.resolve(endpoint);
  });
}

function spider(inputUrl, options) {
  // If inputUrl starts with "feed:", we should not spider it.
  if (inputUrl.indexOf("feed:") === 0) {
    return [inputUrl.replace("feed:", "")];
  }

  // If inputUrl has no scheme, assume http
  if (inputUrl.indexOf("http") !== 0) {
    inputUrl = "http://" + inputUrl;
  }

  // If URL has no TLD, add likely options
  if (inputUrl.indexOf(".") == -1) {
    inputUrl = populateDomains(inputUrl);
  }

  // If inputUrl is an array, flatten it
  if (Array.isArray(inputUrl)) {
    return dedupe(
      flatten(
        inputUrl.map((url) => {
          return spider(url, options);
        })
      )
    );
  }

  let alternativeUrl;
  if (/\bwww\./.test(inputUrl)) {
    alternativeUrl = inputUrl.replace(/\bwww\./, "");
  } else {
    alternativeUrl = inputUrl.replace(/:\/\//, "://www.");
  }

  const urls = [inputUrl, alternativeUrl];

  urls.push(
    populateWithKnownFeedEndpoints(inputUrl),
    populateWithKnownFeedEndpoints(alternativeUrl)
  );

  return dedupe(flatten(urls).filter((url) => !!url));
}

// Popuate a URL with likely TLDs
function populateDomains(key) {
  return ["com", "net", "org", "co.uk", "co", "io"].map((ext) => {
    return key + "." + ext;
  });
}

async function finder(inputUrl, options) {
  const urls = spider(inputUrl, options);
  return dedupe(flatten(await Promise.all(urls.map((url) => parser(url)))));
}

finder("arnavgosain").then((res) => {
  console.log(res);
});

module.exports = finder;
