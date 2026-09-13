export default async function handler(req, res) {
  try {
    const requestUrl = new URL(
      req.url,
      `https://${req.headers.host}`
    );

    let path = requestUrl.pathname;

    // Remove the /api prefix
    if (path.startsWith("/api")) {
      path = path.slice(4);
    }

    const targetUrl =
      `https://smart-ev-optimizer-production.up.railway.app/api${path}${requestUrl.search}`;

    console.log("Proxy target:", targetUrl);

    const headers = {
      "Content-Type": "application/json",
    };

    if (req.headers.cookie) {
      headers.Cookie = req.headers.cookie;
    }

    const response = await fetch(targetUrl, {
      method: req.method,
      headers,
      body:
        req.method === "GET" || req.method === "HEAD"
          ? undefined
          : JSON.stringify(req.body),
    });

    const setCookie = response.headers.get("set-cookie");

    if (setCookie) {
      res.setHeader("Set-Cookie", setCookie);
    }

    const contentType = response.headers.get("content-type");

    if (contentType) {
      res.setHeader("Content-Type", contentType);
    }

    const data = await response.text();

    return res.status(response.status).send(data);
  } catch (error) {
    console.error("API proxy error:", error);

    return res.status(500).json({
      success: false,
      message: "API proxy error",
    });
  }
}