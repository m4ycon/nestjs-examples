import { Request, Response } from 'express'

/**
 * Cookie utils
 * @description Useful methods for cookie management
 */
export const CookieUtils = {
  /**
   * Set cookies with payload data
   * @param res Response from express
   * @param payload Payload to be stored in the cookie
   * @param maxAge Max age of the cookie in milliseconds
   * @example setCookie(res, { userId: 1 }, 1000 * 60 * 60 * 24 * 7)
   */
  setHeaderWithCookie(
    res: Response,
    payload: { [key: string]: string },
    maxAge: number,
  ): void {
    Object.entries(payload).map(([key, value]) => {
      res.cookie(key, value, {
        // secure: true, // only with https
        httpOnly: true, // will not allow client-side JavaScript to see the cookie
        maxAge: maxAge * 1000, // convert to milliseconds
        path: '/',
      })
    })
  },

  /**
   * Gets a cookie from the request
   * @param req Request from express
   * @param key Key of the cookie
   * @returns Value of the cookie
   */
  getCookieValue(req: Request, key: string): string {
    return req.cookies[key]
  },

  /**
   * Clears a cookie from the response
   * @param res Response from express
   * @param key Key of the cookie
   */
  clearCookie(res: Response, key: string): void {
    res.clearCookie(key)
  },
}
