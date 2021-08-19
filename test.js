const feedFinder = require("./dist");

console.time("feedFinder");
feedFinder("paulgraham.com", { timeout: 200 }).then((item) => {
  console.log(item);
  console.timeEnd("feedFinder");
});
