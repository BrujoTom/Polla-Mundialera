export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Cache-Control', 's-maxage=25, stale-while-revalidate=60');

  const TOKEN = process.env.FBD_TOKEN || 'dc3d5ee6bd31409989b550363926cfaa';

  try {
    const upstream = await fetch(
      'https://api.football-data.org/v4/competitions/WC/matches',
      { headers: { 'X-Auth-Token': TOKEN } }
    );

    if (!upstream.ok) {
      return res.status(upstream.status).json({
        error: `football-data ${upstream.status}`,
        matches: []
      });
    }

    const data = await upstream.json();
    return res.status(200).json(data);

  } catch (err) {
    return res.status(500).json({ error: err.message, matches: [] });
  }
}
