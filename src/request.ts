import got from "got";

const request = async (url) => {
  return await got(url, {
    timeout: 1000,
    retry: 2,
  });
};

export default request;
