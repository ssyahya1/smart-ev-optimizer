export default async function handler(req, res) {
  const { path } = req.query;

  const pathString = Array.isArray(path)
    ? path.join("/")
    : path || "";

  const targetUrl =
    `https://smart-ev-optimizer-production.up.railway.app/api/${pathString}`;

  try {
    const response = await fetch(targetUrl, {
      method: req.method,
      headers: {
        "Content-Type": "application/json",
        ...(req.headers.cookie
          ? { Cookie: req.headers.cookie }
          : {}),
      },
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

    res.status(response.status).send(data);
  } catch (error) {
    console.error("API proxy error:", error);

    res.status(500).json({
      success: false,
      message: "API proxy error",
    });
  }
}