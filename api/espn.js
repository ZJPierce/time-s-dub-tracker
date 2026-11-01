// Tiny proxy so the browser never depends on ESPN's CORS headers.
// GET /api/espn?path=scoreboard&dates=20261101   or   /api/espn?path=summary&event=401...
export default async function handler(req, res) {
  const { path = "scoreboard", ...q } = req.query;
  if (!/^(scoreboard|summary)$/.test(path)) {
    res.status(400).json({ error: "path must be scoreboard or summary" });
    return;
  }
  const qs = new URLSearchParams(q).toString();
  try {
    const r = await fetch(`https://site.api.espn.com/apis/site/v2/sports/football/nfl/${path}?${qs}`);
    const body = await r.text();
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Cache-Control", "s-maxage=10, stale-while-revalidate=20");
    res.status(r.status).send(body);
  } catch (e) {
    res.status(502).json({ error: "ESPN unreachable" });
  }
}
