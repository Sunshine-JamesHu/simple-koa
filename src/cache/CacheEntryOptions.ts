export interface ICacheEntryOptions {
  /**
   * 是否为滑动过期时间
   * 默认为false,是绝对过期
   */
  sliding?: boolean;
  /**
   * 过期时间
   */
  ttl: number;
}
