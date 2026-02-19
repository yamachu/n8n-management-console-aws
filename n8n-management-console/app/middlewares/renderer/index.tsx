import type { Env } from "hono";
import { createMiddleware } from "hono/factory";

export const htmlRenderer = () =>
  createMiddleware<Env>(async (c, next) => {
    c.setRenderer((content) => {
      return c.html(
        <html lang="ja">
          <head>
            <meta charset="utf-8" />
            <meta
              name="viewport"
              content="width=device-width, initial-scale=1.0"
            />
            <link rel="icon" href="/favicon.ico" />
            <link href="/app/style.css" rel="stylesheet" />
          </head>
          <body>{content}</body>
        </html>,
      );
    });
    await next();
  });
