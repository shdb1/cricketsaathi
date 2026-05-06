import { useState, useEffect } from "react";

const TEAMS = [
  { name: "Mumbai Indians", short: "MI", emoji: "🔵" },
  { name: "Chennai Super Kings", short: "CSK", emoji: "🟡" },
  { name: "Royal Challengers Bengaluru", short: "RCB", emoji: "🔴" },
  { name: "Kolkata Knight Riders", short: "KKR", emoji: "🟣" },
  { name: "Delhi Capitals", short: "DC", emoji: "🔵" },
  { name: "Rajasthan Royals", short: "RR", emoji: "🩷" },
  { name: "Sunrisers Hyderabad", short: "SRH", emoji: "🟠" },
  { name: "Punjab Kings", short: "PBKS", emoji: "🔴" },
  { name: "Lucknow Super Giants", short: "LSG", emoji: "💜" },
  { name: "Gujarat Titans", short: "GT", emoji: "🔵" },
];

const CRICAPI_KEY = import.meta.env.VITE_CRICAPI_KEY;
const OPENROUTER_KEY =
  import.meta.env.VITE_OPENROUTER_API_KEY;

const CRICAPI = `https://api.cricapi.com/v1`;

function useMatches() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  // =========================
  // CONFIG
  // =========================

  const AUTO_REFRESH = false;
  const REFRESH_INTERVAL = 30000;

  useEffect(() => {
    const fetch_ = async () => {
      try {
        console.log("Fetching IPL data...");

        const res = await fetch(
          `${CRICAPI}/currentMatches?apikey=${CRICAPI_KEY}&offset=0`
        );

        const data = await res.json();

        console.log("API Response:", data);

        if (!data?.data) {
          setMatches([]);
          setLoading(false);
          return;
        }

        // FILTER IPL ONLY
        const iplMatches = data.data.filter((m) =>
          m.name?.toLowerCase().includes(
            "indian premier league"
          )
        );

        const mapped = iplMatches.map((m, i) => {
          const t1name = m.teams?.[0] || "TBA";
          const t2name = m.teams?.[1] || "TBA";

          const getShort = (name) => {
            const found = TEAMS.find((t) =>
              name
                .toLowerCase()
                .includes(
                  t.name.toLowerCase().split(" ")[0]
                )
            );

            return found
              ? found.short
              : name.slice(0, 3).toUpperCase();
          };

          const score1 = m.score?.[0]
            ? `${m.score[0].r}/${m.score[0].w}`
            : "—";

          const score2 = m.score?.[1]
            ? `${m.score[1].r}/${m.score[1].w}`
            : "—";

          const overs1 =
            m.score?.[0]?.o?.toString() || "";

          const overs2 =
            m.score?.[1]?.o?.toString() || "";

          // DATE + TIME

          const dt = new Date(m.dateTimeGMT);

          const formattedDate =
            dt.toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            });

          const formattedTime =
            dt.toLocaleTimeString("en-IN", {
              hour: "numeric",
              minute: "2-digit",
              hour12: true,
            });

          return {
            id: i,

            team1: getShort(t1name),
            team2: getShort(t2name),

            team1full: t1name,
            team2full: t2name,

            score1,
            score2,

            overs1,
            overs2,

            status: m.status || "Upcoming",

            venue: m.venue || "TBA",

            date: formattedDate,
            time: formattedTime,

            live:
              m.matchStarted && !m.matchEnded,

            ended: m.matchEnded,
          };
        });

        setMatches(mapped);
      } catch (err) {
        console.error("API ERROR:", err);
        setMatches([]);
      }

      setLoading(false);
    };

    fetch_();

    let interval;

    if (AUTO_REFRESH) {
      interval = setInterval(
        fetch_,
        REFRESH_INTERVAL
      );
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, []);

  return { matches, loading };
}

function getTeam(short) {
  return (
    TEAMS.find((t) => t.short === short) ||
    TEAMS[0]
  );
}

function MatchCard({ match }) {
  const t1 = getTeam(match.team1);
  const t2 = getTeam(match.team2);

  return (
    <div className="bg-[#07142a] border border-[#1b2c47] rounded-3xl p-6 hover:border-orange-500/40 transition-all duration-300 shadow-lg">

      {/* TOP */}

      <div className="flex items-start justify-between mb-5 flex-wrap gap-3">

        <div>
          <p className="text-gray-400 text-sm font-medium">
            {match.venue}
          </p>

          <div className="flex items-center gap-2 mt-3 flex-wrap">

            <span className="bg-[#13233d] text-gray-200 text-xs px-3 py-1 rounded-full border border-[#20314e]">
              📅 {match.date}
            </span>

            <span className="bg-orange-500/10 text-orange-300 text-xs px-3 py-1 rounded-full border border-orange-500/20">
              🕒 {match.time}
            </span>

          </div>
        </div>

        <div>
          {match.live ? (
            <span className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full animate-pulse">
              🔴 LIVE
            </span>
          ) : match.ended ? (
            <span className="bg-green-500/10 text-green-300 text-xs font-bold px-3 py-1 rounded-full border border-green-500/20">
              COMPLETED
            </span>
          ) : (
            <span className="bg-blue-500/10 text-blue-300 text-xs font-bold px-3 py-1 rounded-full border border-blue-500/20">
              UPCOMING
            </span>
          )}
        </div>
      </div>

      {/* MATCH */}

      <div className="grid grid-cols-3 items-center gap-4">

        {/* TEAM 1 */}

        <div className="text-center">

          <div className="text-5xl mb-3">
            {t1.emoji}
          </div>

          <div className="text-white font-bold text-2xl leading-tight">
            {match.team1full}
          </div>

          <div className="text-orange-400 font-black text-5xl mt-3">
            {match.score1}
          </div>

          <div className="text-gray-500 text-xl mt-1">
            ({match.overs1} ov)
          </div>

        </div>

        {/* VS */}

        <div className="text-center">

          <div className="text-gray-600 font-black text-6xl">
            VS
          </div>

        </div>

        {/* TEAM 2 */}

        <div className="text-center">

          <div className="text-5xl mb-3">
            {t2.emoji}
          </div>

          <div className="text-white font-bold text-2xl leading-tight">
            {match.team2full}
          </div>

          <div className="text-orange-400 font-black text-5xl mt-3">
            {match.score2}
          </div>

          <div className="text-gray-500 text-xl mt-1">
            ({match.overs2} ov)
          </div>

        </div>
      </div>

      {/* STATUS */}

      <div className="mt-6 pt-5 border-t border-[#1b2c47]">

        <p className="text-center text-gray-300 text-2xl font-medium">
          {match.status}
        </p>

      </div>
    </div>
  );
}

export default function CricketSaathi() {
  const { matches, loading } = useMatches();

  const [aiQuery, setAiQuery] =
    useState("");

  const [showAI, setShowAI] =
    useState(false);

  const [currentQuery, setCurrentQuery] =
    useState("");

  const [aiResponse, setAiResponse] =
    useState("");

  const [aiLoading, setAiLoading] =
    useState(false);

  const handleAsk = async (queryText) => {
    const query = queryText || aiQuery;

    if (!query.trim()) return;

    setShowAI(true);

    setCurrentQuery(query);

    try {
      setAiLoading(true);

      const res = await fetch(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            Authorization: `Bearer ${OPENROUTER_KEY}`,

            "HTTP-Referer":
              window.location.origin,

            "X-Title":
              "CricketSaathi",
          },

          body: JSON.stringify({
            model: "openrouter/auto",

            messages: [
              {
                role: "system",

                content:
                  "You are CricketSaathi AI, an IPL and fantasy cricket expert. Give concise smart answers with cricket analysis.",
              },

              {
                role: "user",
                content: query,
              },
            ],

            max_tokens: 300,
          }),
        }
      );

      const data = await res.json();

      console.log(data);

      const text =
        data?.choices?.[0]?.message
          ?.content ||
        "No response received.";

      setAiResponse(text);
    } catch (err) {
      console.error(err);

      setAiResponse(
        "AI service temporarily unavailable."
      );
    }

    setAiLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#020817] text-white">

      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* HEADER */}

        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">

          <div className="flex items-center gap-4">

            <div className="w-14 h-14 rounded-2xl bg-orange-500 flex items-center justify-center text-3xl shadow-lg shadow-orange-500/30">
              🏏
            </div>

            <div>

              <h1 className="text-5xl font-black tracking-tight">
                Cricket
                <span className="text-orange-500">
                  Saathi
                </span>
              </h1>

              <p className="text-gray-500 mt-1">
                IPL Live Match Center
              </p>

            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">

            <div className="bg-[#0d1b33] border border-[#1c2d4b] px-4 py-2 rounded-xl">

              <p className="text-gray-400 text-sm">
                Auto Refresh
              </p>

              <p className="text-yellow-400 font-bold">
                OFF
              </p>

            </div>

            <div className="bg-[#0d1b33] border border-[#1c2d4b] px-4 py-2 rounded-xl">

              <p className="text-gray-400 text-sm">
                API Calls Saved
              </p>

              <p className="text-green-400 font-bold">
                Manual Mode
              </p>

            </div>

          </div>
        </div>

        {/* AI BAR */}

        <div className="mb-8">

          <div className="bg-gradient-to-r from-[#07142a] to-[#0b1d39] border border-orange-500/20 rounded-3xl p-5 shadow-lg shadow-orange-500/10">

            <div className="flex items-center gap-3 mb-4">

              <div className="w-10 h-10 rounded-2xl bg-orange-500 flex items-center justify-center text-xl shadow-lg shadow-orange-500/20">
                🤖
              </div>

              <div>

                <h2 className="text-white font-bold text-xl">
                  Ask CricketSaathi AI
                </h2>

                <p className="text-orange-300 text-sm">
                  Powered by Gemini
                </p>

              </div>
            </div>

            <div className="flex gap-3 flex-wrap">

              <input
                value={aiQuery}
                onChange={(e) =>
                  setAiQuery(e.target.value)
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleAsk();
                  }
                }}
                placeholder="Ask anything... 'Who should I captain tonight?'"
                className="flex-1 min-w-[250px] bg-[#0d1b33] border border-[#1c2d4b] rounded-2xl px-5 py-4 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-all"
              />

              <button
                onClick={() =>
                  handleAsk()
                }
                className="bg-orange-500 hover:bg-orange-600 transition-colors px-6 py-4 rounded-2xl font-bold shadow-lg shadow-orange-500/20 whitespace-nowrap"
              >
                Ask AI ⚡
              </button>

            </div>

            {/* QUICK QUESTIONS */}

            <div className="flex gap-2 flex-wrap mt-4">

              {[
                "Who should I captain tonight?",
                "Predict next IPL winner",
                "Best fantasy picks today",
                "Pitch report analysis",
              ].map((q, i) => (
                <button
                  key={i}
                  onClick={() =>
                    handleAsk(q)
                  }
                  className="bg-[#0d1b33] border border-[#1c2d4b] hover:border-orange-500/40 hover:bg-orange-500/10 transition-all px-4 py-2 rounded-full text-sm text-gray-300"
                >
                  {q}
                </button>
              ))}

            </div>
          </div>
        </div>

        {/* REFRESH */}

        <div className="mb-8">

          <button
            onClick={() =>
              window.location.reload()
            }
            className="bg-orange-500 hover:bg-orange-600 transition-colors px-6 py-3 rounded-2xl font-bold shadow-lg shadow-orange-500/20"
          >
            Refresh Matches
          </button>

        </div>

        {/* MATCHES */}

        {loading ? (
          <div className="space-y-6">

            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-[320px] bg-[#07142a] border border-[#1b2c47] rounded-3xl animate-pulse"
              />
            ))}

          </div>
        ) : matches.length > 0 ? (

          <div className="space-y-6">

            {matches.map((m) => (
              <MatchCard
                key={m.id}
                match={m}
              />
            ))}

          </div>

        ) : (

          <div className="bg-[#07142a] border border-[#1b2c47] rounded-3xl p-16 text-center">

            <div className="text-7xl mb-6">
              🏏
            </div>

            <h2 className="text-4xl font-bold mb-4">
              No IPL Matches Found
            </h2>

            <p className="text-gray-400 text-xl">
              IPL may not be live currently
            </p>

          </div>

        )}

      </div>

      {/* AI MODAL */}

      {showAI && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() =>
            setShowAI(false)
          }
        >

          <div
            className="bg-[#07142a] border border-orange-500/20 rounded-3xl p-6 max-w-2xl w-full"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div className="flex items-center justify-between mb-5">

              <div className="flex items-center gap-3">

                <div className="w-10 h-10 rounded-2xl bg-orange-500 flex items-center justify-center text-xl">
                  🤖
                </div>

                <div>

                  <h2 className="font-bold text-xl">
                    CricketSaathi AI
                  </h2>

                  <p className="text-orange-300 text-sm">
                    Powered by Gemini
                  </p>

                </div>
              </div>

              <button
                onClick={() =>
                  setShowAI(false)
                }
                className="text-gray-500 hover:text-white text-xl"
              >
                ✕
              </button>

            </div>

            <div className="bg-[#0d1b33] border border-[#1c2d4b] rounded-2xl p-4 mb-5">

              <p className="text-orange-300 text-sm mb-2">
                Your Question
              </p>

              <p className="text-white">
                {currentQuery}
              </p>

            </div>

            <div className="bg-[#0d1b33] border border-[#1c2d4b] rounded-2xl p-5 min-h-[150px]">

              {aiLoading ? (
                <div className="flex items-center gap-3 text-orange-400">

                  <div className="w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>

                  Cricket AI analyzing...

                </div>
              ) : (
                <div className="text-gray-200 whitespace-pre-wrap leading-7">
                  {aiResponse}
                </div>
              )}

            </div>

          </div>

        </div>
      )}

    </div>
  );
}