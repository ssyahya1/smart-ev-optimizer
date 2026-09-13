export default async function handler(req, res) {
  const path = req.query.path;

  const pathString = Array.isArray(path)
    ? path.join("/")
    : path;

  const targetUrl = `https://smart-ev-optimizer-production.up.railway.app/api/${pathString}`;

  const headers = {
    ...req.headers,
    host: "smart-ev-optimizer-production.up.railway.app",
  };

  delete headers["content-length"];

  try {
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

    res.status(response.status);

    const contentType = response.headers.get("content-type");

    if (contentType) {
      res.setHeader("Content-Type", contentType);
    }

    const data = await response.text();

    res.send(data);
  } catch (error) {
    console.error("API proxy error:", error);

    res.status(500).json({
      message: "API proxy error",
    });
  }
}