export type Options = {
  /**
   * @description Request timeout in seconds
   * @default 1000
   */
  timeout?: number;

  /**
   * @description Retry count. 0 means no retry.
   * @default 2
   */
  retryCount?: number;
};
