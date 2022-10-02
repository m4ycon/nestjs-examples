import { Request, Response } from 'express'

export class CookieUtils {
  static setHeaderWithCookie(
    res: Response,
    payload: { [key: string]: any },
    maxAge: number,
  ): void {
    Object.entries(payload).forEach(([key, value]) => {
      res.cookie(key, value, {
        // secure: true, // only with https
        httpOnly: true, // will not allow client-side JavaScript to see the cookie
        maxAge: maxAge * 1000, // convert to milliseconds
        path: '/',
      })
    })
  }

  static getCookieValue(req: Request, key: string): string {
    return req.cookies[key]
  }
}
