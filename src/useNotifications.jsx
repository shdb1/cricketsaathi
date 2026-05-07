// src/useNotifications.js

import { useState, useEffect } from 'react';

const VAPID_PUBLIC_KEY =
  import.meta.env.VITE_VAPID_PUBLIC_KEY;

const API_BASE = '/api';

// =====================================
// FEATURE FLAGS
// =====================================

const ENABLE_BROWSER_NOTIFICATIONS =
  import.meta.env
    .VITE_ENABLE_BROWSER_NOTIFICATIONS ===
  'true';

const ENABLE_SERVER_NOTIFICATIONS =
  import.meta.env
    .VITE_ENABLE_SERVER_NOTIFICATIONS ===
  'true';

const ENABLE_VERCEL_CRON =
  import.meta.env
    .VITE_ENABLE_VERCEL_CRON ===
  'true';

const BROWSER_POLL_INTERVAL =
  Number(
    import.meta.env
      .VITE_BROWSER_POLL_INTERVAL ||
      60000
  );

const ENABLE_DEBUG_LOGS =
  import.meta.env
    .VITE_ENABLE_DEBUG_LOGS ===
  'true';

const ENABLE_MOCK_NOTIFICATIONS =
  import.meta.env
    .VITE_ENABLE_MOCK_NOTIFICATIONS ===
  'true';

// =====================================
// HELPERS
// =====================================

function urlBase64ToUint8Array(
  base64String
) {

  const padding =
    '='.repeat(
      (4 - (base64String.length % 4)) %
        4
    );

  const base64 =
    (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

  const rawData =
    atob(base64);

  return Uint8Array.from(
    [...rawData].map(c =>
      c.charCodeAt(0)
    )
  );
}

function getUserId() {

  let id =
    localStorage.getItem(
      'cs_user_id'
    );

  if (!id) {

    id = `user_${Date.now()}_${Math.random()
      .toString(36)
      .slice(2)}`;

    localStorage.setItem(
      'cs_user_id',
      id
    );
  }

  return id;
}

// =====================================
// SOUND SYSTEM
// =====================================

function playNotificationSound(
  type
) {

  try {

    let soundFile =
      '/sounds/ipl.mp3';

    switch (type) {

      case 'batting':
        soundFile =
          '/sounds/crowd.mp3';
        break;

      case 'wicket':
        soundFile =
          '/sounds/wicket.mp3';
        break;

      case 'six':
        soundFile =
          '/sounds/six.mp3';
        break;

      case 'century':
        soundFile =
          '/sounds/century.mp3';
        break;

      default:
        soundFile =
          '/sounds/ipl.mp3';
    }

    const audio =
      new Audio(soundFile);

    audio.volume = 0.8;

    audio.play();

    console.log(
      `Playing sound: ${soundFile}`
    );

  } catch (err) {

    console.error(
      'Audio playback failed:',
      err
    );
  }
}

// =====================================
// NOTIFICATION SYSTEM
// =====================================

async function showNotification(
  title,
  body,
  soundType = 'batting'
) {

  if (
    Notification.permission !==
    'granted'
  ) {
    return;
  }

  try {

    const reg =
      await navigator
        .serviceWorker.ready;

    await reg.showNotification(
      title,
      {
        body,

        icon: '/icons.svg',

        badge: '/icons.svg',

        vibrate: [200, 100, 200],

        tag: 'cricket-saathi',

        renotify: true,
      }
    );

    // PLAY SOUND

    playNotificationSound(
      soundType
    );

    console.log(
      'Browser notification displayed'
    );

  } catch (err) {

    console.error(
      'Notification display failed:',
      err
    );
  }
}

// =====================================
// DUPLICATE PREVENTION
// =====================================

const alreadyNotifiedPlayers = {};

// =====================================
// MAIN HOOK
// =====================================

export function useNotifications() {

  const [permission, setPermission] =
    useState(
      Notification.permission
    );

  const [subscription, setSubscription] =
    useState(null);

  const [
    followedPlayers,
    setFollowedPlayers,
  ] = useState(() => {

    try {

      return JSON.parse(
        localStorage.getItem(
          'cs_followed_players'
        ) || '[]'
      );

    } catch {

      return [];
    }
  });

  const [loading, setLoading] =
    useState(false);

  // =====================================
  // EFFECT
  // =====================================

  useEffect(() => {

    // FEATURE DISABLED

    if (
      !ENABLE_BROWSER_NOTIFICATIONS
    ) {

      if (
        ENABLE_DEBUG_LOGS
      ) {
        console.log(
          'Browser notifications disabled'
        );
      }

      return;
    }

    // =====================================
    // EXISTING SUBSCRIPTION
    // =====================================

    if (
      'serviceWorker' in
        navigator &&
      permission === 'granted'
    ) {

      navigator.serviceWorker.ready.then(
        reg => {

          reg.pushManager
            .getSubscription()
            .then(sub => {

              if (sub) {

                setSubscription(sub);

                if (
                  ENABLE_DEBUG_LOGS
                ) {
                  console.log(
                    'Existing push subscription found'
                  );
                }
              }
            });
        }
      );
    }

    // =====================================
    // POLLING
    // =====================================

    const pollLiveMatches =
      async () => {

        try {

          // SAVE API HITS

          if (document.hidden) {

            if (
              ENABLE_DEBUG_LOGS
            ) {
              console.log(
                'Tab hidden → skipping poll'
              );
            }

            return;
          }

          if (
            ENABLE_DEBUG_LOGS
          ) {
            console.log(
              'Polling live match updates...'
            );
          }

          // =====================================
          // MOCK MODE
          // =====================================

          if (
            ENABLE_MOCK_NOTIFICATIONS
          ) {

            if (
              ENABLE_DEBUG_LOGS
            ) {
              console.log(
                'Using MOCK notification mode'
              );
            }

            const mockCurrentBatsmen =
              [
                'Virat Kohli',
                'Rohit Sharma',
              ];

            for (const player of followedPlayers) {

              const isBatting =
                mockCurrentBatsmen.includes(
                  player
                );

              if (
                isBatting &&
                !alreadyNotifiedPlayers[
                  player
                ]
              ) {

                await showNotification(
                  `${player} is batting! 🔥`,
                  'Live commentary available now',
                  'batting'
                );

                alreadyNotifiedPlayers[
                  player
                ] = true;

                console.log(
                  `Mock notification sent for ${player}`
                );
              }
            }

            return;
          }

          // =====================================
          // REAL MODE
          // =====================================

          if (
            ENABLE_DEBUG_LOGS
          ) {
            console.log(
              'Using REAL CricAPI mode'
            );
          }

          const res =
            await fetch(
              'https://api.cricapi.com/v1/currentMatches?apikey=' +
                import.meta.env
                  .VITE_CRICAPI_KEY +
                '&offset=0'
            );

          const data =
            await res.json();

          if (!data?.data) {
            return;
          }

          const iplMatches =
            data.data.filter(
              match =>
                match.name
                  ?.toLowerCase()
                  .includes(
                    'indian premier league'
                  )
            );

          for (const match of iplMatches) {

            const batsmen = [];

            if (
              match.teamInfo?.[0]
                ?.name
            ) {

              batsmen.push(
                match.teamInfo[0]
                  .name
              );
            }

            if (
              match.teamInfo?.[1]
                ?.name
            ) {

              batsmen.push(
                match.teamInfo[1]
                  .name
              );
            }

            for (const player of followedPlayers) {

              const isBatting =
                batsmen.some(
                  name =>
                    name.includes(
                      player
                    )
                );

              if (
                isBatting &&
                !alreadyNotifiedPlayers[
                  player
                ]
              ) {

                await showNotification(
                  `${player} is batting! 🔥`,
                  `${match.name} is live now`,
                  'batting'
                );

                alreadyNotifiedPlayers[
                  player
                ] = true;

                console.log(
                  `Real notification sent for ${player}`
                );
              }
            }
          }

        } catch (err) {

          console.error(err);

        }
      };

    // =====================================
    // START POLLING
    // =====================================

    const interval =
      setInterval(
        pollLiveMatches,
        BROWSER_POLL_INTERVAL
      );

    pollLiveMatches();

    return () =>
      clearInterval(interval);

  }, [
    permission,
    followedPlayers,
  ]);

  // =====================================
  // REQUEST PERMISSION
  // =====================================

  const requestPermission =
    async () => {

      setLoading(true);

      try {

        const reg =
          await navigator
            .serviceWorker
            .register('/sw.js');

        await navigator
          .serviceWorker.ready;

        const result =
          await Notification.requestPermission();

        setPermission(result);

        if (
          result === 'granted'
        ) {

          const sub =
            await reg.pushManager.subscribe(
              {
                userVisibleOnly: true,

                applicationServerKey:
                  urlBase64ToUint8Array(
                    VAPID_PUBLIC_KEY
                  ),
              }
            );

          setSubscription(sub);

          // SERVER MODE ONLY

          if (
            ENABLE_SERVER_NOTIFICATIONS
          ) {

            await fetch(
              `${API_BASE}/subscribe`,
              {
                method: 'POST',

                headers: {
                  'Content-Type':
                    'application/json',
                },

                body: JSON.stringify(
                  {
                    subscription:
                      sub.toJSON(),

                    userId:
                      getUserId(),

                    players:
                      followedPlayers,
                  }
                ),
              }
            );
          }
        }

      } catch (err) {

        console.error(
          'Push subscription error:',
          err
        );

      }

      setLoading(false);
    };

  // =====================================
  // FOLLOW PLAYER
  // =====================================

  const followPlayer =
    async playerName => {

      const updated =
        followedPlayers.includes(
          playerName
        )
          ? followedPlayers.filter(
              p =>
                p !== playerName
            )
          : [
              ...followedPlayers,
              playerName,
            ];

      setFollowedPlayers(updated);

      localStorage.setItem(
        'cs_followed_players',
        JSON.stringify(updated)
      );

      // SERVER MODE ONLY

      if (
        subscription &&
        ENABLE_SERVER_NOTIFICATIONS
      ) {

        await fetch(
          `${API_BASE}/subscribe`,
          {
            method: 'POST',

            headers: {
              'Content-Type':
                'application/json',
            },

            body: JSON.stringify({
              subscription:
                subscription.toJSON(),

              userId:
                getUserId(),

              players: updated,
            }),
          }
        );
      }

      return updated;
    };

  // =====================================
  // HELPERS
  // =====================================

  const isFollowing =
    playerName =>
      followedPlayers.includes(
        playerName
      );

  return {
    permission,
    subscription,
    followedPlayers,
    loading,
    requestPermission,
    followPlayer,
    isFollowing,
  };
}

// =====================================
// UI COMPONENTS
// =====================================

export function NotificationBanner({
  onRequestPermission,
  loading,
}) {

  return (
    <div className="bg-gradient-to-r from-orange-500/20 to-red-500/10 border border-orange-500/30 rounded-2xl p-4 flex items-center justify-between gap-4">

      <div className="flex items-center gap-3">

        <span className="text-2xl">
          🔔
        </span>

        <div>

          <p className="text-white font-bold text-sm">
            Get notified when your
            player bats!
          </p>

          <p className="text-gray-400 text-xs">
            Follow players → get
            alerts when they come
            to bat or bowl
          </p>

        </div>
      </div>

      <button
        onClick={
          onRequestPermission
        }
        disabled={loading}
        className="whitespace-nowrap bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-bold px-4 py-2 rounded-xl text-sm transition-colors"
      >

        {loading
          ? 'Setting up...'
          : 'Enable 🔔'}

      </button>

    </div>
  );
}

export function PlayerFollowButton({
  playerName,
  isFollowing,
  onFollow,
  hasPermission,
}) {

  const [clicked, setClicked] =
    useState(false);

  const handleClick =
    async e => {

      e.stopPropagation();

      setClicked(true);

      await onFollow(
        playerName
      );

      setTimeout(() => {
        setClicked(false);
      }, 1000);
    };

  if (!hasPermission) {
    return null;
  }

  return (
    <button
      onClick={handleClick}
      className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold transition-all ${
        isFollowing
          ? 'bg-orange-500 text-white'
          : 'bg-gray-800 text-gray-400 hover:bg-orange-500/20 hover:text-orange-400'
      }`}
      title={
        isFollowing
          ? 'Unfollow player'
          : 'Notify me when this player bats/bowls'
      }
    >

      {clicked
        ? '✓'
        : isFollowing
          ? '🔔 Following'
          : '+ Follow'}

    </button>
  );
}

export function FollowedPlayersList({
  followedPlayers,
  onUnfollow,
}) {

  if (
    !followedPlayers.length
  ) {
    return null;
  }

  return (
    <div className="bg-gray-900 border border-orange-500/20 rounded-2xl p-4">

      <p className="text-gray-500 text-xs uppercase tracking-wider mb-3">
        🔔 You'll be notified for
      </p>

      <div className="flex flex-wrap gap-2">

        {followedPlayers.map(
          player => (

            <div
              key={player}
              className="flex items-center gap-2 bg-orange-500/20 border border-orange-500/30 text-orange-300 text-xs px-3 py-1.5 rounded-full"
            >

              <span>
                {player}
              </span>

              <button
                onClick={() =>
                  onUnfollow(
                    player
                  )
                }
                className="text-orange-400 hover:text-white ml-1"
              >
                ✕
              </button>

            </div>
          )
        )}

      </div>
    </div>
  );
}