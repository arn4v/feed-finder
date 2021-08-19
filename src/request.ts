import got from "got";
import { Options } from "./types";

const request = async (url: string, options?: Options) => {
  return await got(url, {
    timeout: options.timeout ?? 1000,
    retry: options.retryCount ?? 2,
  });
};

export default request;
