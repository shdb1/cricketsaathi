// api/subscribe.js — Save user push subscription + player preferences to Vercel KV

import { createClient } from '@vercel/kv';
const kv = createClient({
  url: process.env.KS_KV_REST_API_URL,
  token: process.env.KS_KV_REST_API_TOKEN,
});

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'POST') {
    const { subscription, userId, players } = req.body;

    if (!subscription || !userId) {
      return res.status(400).json({ error: 'Missing subscription or userId' });
    }

    // Store subscription with player preferences
    await kv.set(`sub:${userId}`, {
      subscription,
      players: players || [], // e.g. ["Virat Kohli", "Rohit Sharma"]
      createdAt: Date.now(),
    });

    // Also maintain a list of all subscriber IDs for broadcasting
    await kv.sadd('subscribers', userId);

    return res.status(200).json({ success: true, message: 'Subscription saved!' });
  }

  if (req.method === 'DELETE') {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: 'Missing userId' });

    await kv.del(`sub:${userId}`);
    await kv.srem('subscribers', userId);

    return res.status(200).json({ success: true, message: 'Unsubscribed!' });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
