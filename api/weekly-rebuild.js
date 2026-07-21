// Vercel Cron から週1回呼ばれ、Deploy Hook を叩いて再ビルドする
// （MEDIA セクションの YouTube 視聴回数をビルド時取得しているため、その更新用）
export default async function handler(req, res) {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && req.headers.authorization !== `Bearer ${cronSecret}`) {
    return res.status(401).json({ ok: false, error: 'unauthorized' });
  }
  const hookUrl = process.env.DEPLOY_HOOK_URL;
  if (!hookUrl) {
    return res.status(500).json({ ok: false, error: 'DEPLOY_HOOK_URL is not set' });
  }
  const r = await fetch(hookUrl, { method: 'POST' });
  return res.status(r.ok ? 200 : 502).json({ ok: r.ok, status: r.status });
}
