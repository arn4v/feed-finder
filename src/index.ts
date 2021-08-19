import { URL } from "url";
import parser from "./parser";
import { Options } from "./types";

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

function spider(inputUrl: string | string[], options: Options) {
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

  // If inputUrl has no scheme, assume http
  if (inputUrl.indexOf("http") === -1) {
    inputUrl = "http://" + inputUrl;
  }

  let _inputUrl = inputUrl as string;

  let alternativeUrl: string;
  if (/\bwww\./.test(_inputUrl)) {
    alternativeUrl = _inputUrl.replace(/\bwww\./, "");
  } else {
    alternativeUrl = _inputUrl.replace(/:\/\//, "://www.");
  }

  // If URL has no TLD, add likely options
  if (inputUrl.indexOf(".") == -1) {
    inputUrl = populateDomains(_inputUrl);
  }

  const urls = [
    ...(Array.isArray(inputUrl) ? inputUrl : [inputUrl]),
    ...populateWithKnownFeedEndpoints(_inputUrl),
    ...populateWithKnownFeedEndpoints(alternativeUrl),
  ];

  return dedupe(flatten(urls).filter((url) => !!url));
}

// Popuate a URL with likely TLDs
function populateDomains(key: string) {
  return ["com", "net", "org", "co.uk", "co", "io"].map((ext) => {
    return key + "." + ext;
  });
}

async function finder(
  inputUrl: string,
  options: Options = {}
): Promise<string[]> {
  const urls = spider(inputUrl, options);
  console.log(urls);
  return dedupe(
    flatten(await Promise.all(urls.map((url) => parser(url, options))))
  );
}

export default finder;
