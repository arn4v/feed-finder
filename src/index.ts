import parser from "./parser";
import url, { URL } from "url";

const dedupe = <T = unknown>(arr: Array<T>) => {
  return Array.from(new Set(arr));
};

const flatten = <T = unknown>(arrays: Array<T>) => {
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

function populateWithKnownFeedEndpoints(inputUrl: string): string[] {
  return knownFeedEndpoints.map(function (endpoint) {
    return new URL(endpoint, inputUrl).toString();
  });
}

function spider(inputUrl: string | string[]) {
  // If inputUrl is an array, flatten it
  if (Array.isArray(inputUrl)) {
    return dedupe(
      flatten(
        inputUrl.map((url) => {
          return spider(url);
        })
      )
    );
  }

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

  let _inputUrl = inputUrl as string;

  let alternativeUrl: string;
  if (/\bwww\./.test(_inputUrl)) {
    alternativeUrl = _inputUrl.replace(/\bwww\./, "");
  } else {
    alternativeUrl = _inputUrl.replace(/:\/\//, "://www.");
  }

  const urls = [inputUrl, alternativeUrl];

  urls.push(
    populateWithKnownFeedEndpoints(_inputUrl),
    populateWithKnownFeedEndpoints(alternativeUrl)
  );

  return dedupe(flatten(urls).filter((url) => !!url));
}

// Popuate a URL with likely TLDs
function populateDomains(key: string) {
  return ["com", "net", "org", "co.uk", "co", "io"].map((ext) => {
    return key + "." + ext;
  });
}

async function finder(inputUrl: string) {
  const urls = spider(inputUrl);
  return dedupe(flatten(await Promise.all(urls.map((url) => parser(url)))));
}

export default finder;
