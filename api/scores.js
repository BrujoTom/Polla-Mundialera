export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  // Sin caché — siempre datos frescos
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');

  const TOKEN = process.env.FBD_TOKEN || 'dc3d5ee6bd31409989b550363926cfaa';

  try {
    const upstream = await fetch(
      'https://api.football-data.org/v4/competitions/WC/matches',
      {
        headers: { 'X-Auth-Token': TOKEN },
        // Sin caché en el fetch del servidor también
        cache: 'no-store',
      }
    );

    if (!upstream.ok) {
      const errText = await upstream.text();
      console.error('[scores proxy] upstream error', upstream.status, errText);
      return res.status(upstream.status).json({ error: `football-data ${upstream.status}`, matches: [] });
    }

    const data = await upstream.json();

    // Log para debug en Vercel Functions
    const finished = (data.matches || []).filter(m => m.status === 'FINISHED' || m.status === 'IN_PLAY');
    finished.forEach(m => {
      console.log('[scores proxy]', m.status,
        m.homeTeam?.name, 'vs', m.awayTeam?.name,
        '| ft:', JSON.stringify(m.score?.fullTime),
        '| rt:', JSON.stringify(m.score?.regularTime)
      );
    });

    return res.status(200).json(data);

  } catch (err) {
    console.error('[scores proxy] exception:', err.message);
    return res.status(500).json({ error: err.message, matches: [] });
  }
}
