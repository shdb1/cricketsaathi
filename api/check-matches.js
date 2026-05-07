// api/check-matches.js — Cron job: diff match state, fire push notifications

import { createClient } from '@vercel/kv';
const kv = createClient({
  url: process.env.KS_KV_REST_API_URL,
  token: process.env.KS_KV_REST_API_TOKEN,
});
import webpush from 'web-push';

webpush.setVapidDetails(
  'mailto:admin@cricketsaathi.in',
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

const CRICAPI_KEY = process.env.VITE_CRICAPI_KEY;

async function fetchCurrentMatches() {
  const res = await fetch(`https://api.cricapi.com/v1/currentMatches?apikey=${CRICAPI_KEY}&offset=0`);
  const data = await res.json();
  const rawData = Array.isArray(data) ? data : data.data;
  return rawData?.filter(m => m.name?.toLowerCase().includes('indian premier league')) || [];
}

async function fetchMatchScorecard(matchId) {
  const res = await fetch(`https://api.cricapi.com/v1/match_scorecard?apikey=${CRICAPI_KEY}&id=${matchId}`);
  const data = await res.json();
  return Array.isArray(data) ? data[0] : data.data;
}

function extractBattingPlayers(scorecard) {
  // Extract currently batting players from scorecard
  const batting = [];
  if (!scorecard) return batting;
  try {
    const innings = scorecard.scorecard || [];
    for (const inning of innings) {
      for (const batter of inning?.batting || []) {
        if (batter?.dismissal === '' || batter?.dismissal === undefined) {
          // Currently batting (not dismissed)
          batting.push(batter.batsman?.name || batter.name);
        }
      }
    }
  } catch { /* ignore parse errors */ }
  return batting;
}

function extractBowlingPlayers(scorecard) {
  const bowling = [];
  if (!scorecard) return bowling;
  try {
    const innings = scorecard.scorecard || [];
    for (const inning of innings) {
      const bowlers = inning?.bowling || [];
      // Last bowler in list is usually currently bowling
      if (bowlers.length > 0) {
        const current = bowlers[bowlers.length - 1];
        bowling.push(current?.bowler?.name || current?.name);
      }
    }
  } catch { /* ignore parse errors */ }
  return bowling;
}

async function sendNotification(subscription, payload) {
  try {
    await webpush.sendNotification(subscription, JSON.stringify(payload));
    return true;
  } catch (err) {
    if (err.statusCode === 410) {
      // Subscription expired — will be cleaned up
      return 'expired';
    }
    return false;
  }
}

export default async function handler(req, res) {
  // Verify this is called by Vercel Cron (security)
  const authHeader = req.headers.authorization;
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    // 1. Fetch live IPL matches
    const matches = await fetchCurrentMatches();
    const liveMatches = matches.filter(m => m.matchStarted && !m.matchEnded);

    if (liveMatches.length === 0) {
      return res.status(200).json({ message: 'No live matches' });
    }

    // 2. Get all subscriber IDs from KV
    const subscriberIds = await kv.smembers('subscribers');
    if (!subscriberIds?.length) {
      return res.status(200).json({ message: 'No subscribers' });
    }

    // 3. For each live match, check player state changes
    const notifications = [];

    for (const match of liveMatches) {
      const matchKey = `match:state:${match.id}`;
      const prevState = await kv.get(matchKey) || { batting: [], bowling: [] };

      // Fetch scorecard for detailed player info
      const scorecard = await fetchMatchScorecard(match.id);
      const currentBatting = extractBattingPlayers(scorecard);
      const currentBowling = extractBowlingPlayers(scorecard);

      // Detect new batters (came to crease since last check)
      const newBatters = currentBatting.filter(p => !prevState.batting?.includes(p));
      const newBowlers = currentBowling.filter(p => !prevState.bowling?.includes(p));

      // Save current state back to KV
      await kv.set(matchKey, {
        batting: currentBatting,
        bowling: currentBowling,
        updatedAt: Date.now(),
      }, { ex: 86400 }); // expire after 24 hours

      // 4. Check each subscriber's player preferences
      for (const userId of subscriberIds) {
        const userSub = await kv.get(`sub:${userId}`);
        if (!userSub) continue;

        const { subscription, players } = userSub;
        if (!players?.length) continue;

        // Check if any followed player is now batting
        for (const player of players) {
          const newBatter = newBatters.find(b => b?.toLowerCase().includes(player.toLowerCase()));
          if (newBatter) {
            notifications.push(sendNotification(subscription, {
              title: `🏏 ${player} is batting!`,
              body: `${player} has come to bat in ${match.name}. Watch the live action!`,
              url: `https://cricketsaathi.in`,
              player,
              action: 'batting',
            }));
          }

          // Check if followed player is now bowling
          const newBowler = newBowlers.find(b => b?.toLowerCase().includes(player.toLowerCase()));
          if (newBowler) {
            notifications.push(sendNotification(subscription, {
              title: `🎳 ${player} is bowling!`,
              body: `${player} has started bowling in ${match.name}. Watch live!`,
              url: `https://cricketsaathi.in`,
              player,
              action: 'bowling',
            }));
          }
        }
      }
    }

    // 5. Fire all notifications in parallel
    await Promise.allSettled(notifications);

    return res.status(200).json({
      success: true,
      liveMatches: liveMatches.length,
      notificationsFired: notifications.length,
    });

  } catch (err) {
    console.error('check-matches error:', err);
    return res.status(500).json({ error: err.message });
  }
}
