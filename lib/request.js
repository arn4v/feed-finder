const fetch = require("fetch-retry")(require("node-fetch"));

module.exports = async function request(url) {
  return await fetch(url, {
    retryDelay: 1000,
    retries: 2,
  });
};
