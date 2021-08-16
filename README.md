# @arn4v/feed-finder

> Stubborn feed auto discovery tool.

There wasn't any satisfyingly determined feed discover tool in npm, so here it is. Highly inspired by [damog](https://github.com/damog)'s [feedbag](https://github.com/damog/feedbag).

**Note:** This is a fork of [cakuki](https://github.com/cakuki)'s feed-finder library/cli tool that has been refactored to use the latest ECMAScript features.

## Installation

```sh
npm install --save @arn4v/feed-finder
```

## Usage

```js
const feedFinder = require("feed-finder"),

feedFinder("vox.com").then(results => {
  // 
  console.log(results)

})feedFinder("mashable.com", function (err, feedUrls) {
  if (err) return console.error(err);

  feedUrls.forEach(function (feedUrl) {
    feedRead(feedUrl, function (err, articles) {
      if (err) throw err;
      // Each article has the following properties:
      //
      //   * "title"     - The article title (String).
      //   * "author"    - The author's name (String).
      //   * "link"      - The original article link (String).
      //   * "content"   - The HTML content of the article (String).
      //
    });
  });
});
```

feed-read module is given just for sake of this example. There are numerous feed readers parsers in the wild.

## License

[ISC](LICENSE.md) (c) Can Kutlu Kınay
