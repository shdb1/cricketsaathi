import { useState, useEffect, useRef } from "react";

const TEAMS = [
  { name: "Mumbai Indians", short: "MI", color: "#004BA0", accent: "#D4AF37", emoji: "🔵" },
  { name: "Chennai Super Kings", short: "CSK", color: "#F5A623", accent: "#0033A0", emoji: "🟡" },
  { name: "Royal Challengers Bengaluru", short: "RCB", color: "#CC0000", accent: "#000000", emoji: "🔴" },
  { name: "Kolkata Knight Riders", short: "KKR", color: "#3A225D", accent: "#F5C518", emoji: "🟣" },
  { name: "Delhi Capitals", short: "DC", color: "#0078BC", accent: "#EF1C25", emoji: "🔵" },
  { name: "Rajasthan Royals", short: "RR", color: "#EA1A85", accent: "#254AA5", emoji: "🩷" },
  { name: "Sunrisers Hyderabad", short: "SRH", color: "#F7A721", accent: "#E8450A", emoji: "🟠" },
  { name: "Punjab Kings", short: "PBKS", color: "#ED1B24", accent: "#A7A9AC", emoji: "🔴" },
  { name: "Lucknow Super Giants", short: "LSG", color: "#A72056", accent: "#FBDB1E", emoji: "💜" },
  { name: "Gujarat Titans", short: "GT", color: "#1C4B82", accent: "#C8A951", emoji: "🔵" },
];

const MOCK_MATCHES = [
  { id: 1, team1: "MI", team2: "CSK", score1: "187/4", score2: "182/7", overs1: "20", overs2: "19.4", status: "MI won by 5 runs", venue: "Wankhede Stadium, Mumbai", date: "Today, 7:30 PM", live: true },
  { id: 2, team1: "RCB", team2: "KKR", score1: "204/6", score2: "167/9", overs1: "20", overs2: "20", status: "RCB won by 37 runs", venue: "M. Chinnaswamy, Bengaluru", date: "Yesterday", live: false },
  { id: 3, team1: "SRH", team2: "DC", score1: "—", score2: "—", overs1: "", overs2: "", status: "Upcoming • Tomorrow 3:30 PM", venue: "Rajiv Gandhi Stadium, Hyderabad", date: "Tomorrow", live: false },
  { id: 4, team1: "RR", team2: "PBKS", score1: "—", score2: "—", overs1: "", overs2: "", status: "Upcoming • 9 May 7:30 PM", venue: "Sawai Mansingh, Jaipur", date: "9 May", live: false },
];

const MOCK_PLAYERS = [
  { name: "Virat Kohli", team: "RCB", runs: 487, avg: 54.1, sr: 148.3, form: [45, 0, 82, 73, 34, 112, 29, 67], role: "Batter" },
  { name: "Rohit Sharma", team: "MI", runs: 412, avg: 45.7, sr: 141.6, form: [67, 34, 0, 89, 23, 78, 45, 56], role: "Batter" },
  { name: "MS Dhoni", team: "CSK", runs: 198, avg: 39.6, sr: 178.9, form: [34, 12, 56, 0, 23, 45, 28, 0], role: "WK-Batter" },
  { name: "Jasprit Bumrah", team: "MI", wickets: 18, avg: 19.4, eco: 7.2, form: [3, 1, 2, 3, 1, 2, 2, 4], role: "Bowler" },
  { name: "Rashid Khan", team: "GT", wickets: 15, avg: 22.1, eco: 6.8, form: [2, 3, 1, 2, 2, 1, 2, 2], role: "Bowler" },
];

const MOCK_NEWS = [
  { id: 1, title: "Bumrah's fiery spell leaves CSK struggling at 45/5 in powerplay", category: "Match Report", time: "2 hours ago", hot: true },
  { id: 2, title: "Kohli becomes first batter to cross 500 runs in IPL 2025", category: "Records", time: "5 hours ago", hot: true },
  { id: 3, title: "KKR confirm Russell available for next three matches after recovery", category: "Team News", time: "8 hours ago", hot: false },
  { id: 4, title: "Pitch report: Wankhede surface expected to assist pacers in evening dew", category: "Pitch Report", time: "12 hours ago", hot: false },
  { id: 5, title: "Fantasy tip: Back Suryakumar Yadav as captain for tonight's match", category: "Fantasy", time: "1 hour ago", hot: true },
  { id: 6, title: "IPL 2025 Points Table: MI surge to 2nd place after thrilling win", category: "Standings", time: "3 hours ago", hot: false },
];

const POINTS_TABLE = [
  { pos: 1, team: "RCB", p: 9, w: 7, l: 2, pts: 14, nrr: "+0.821" },
  { pos: 2, team: "MI", p: 9, w: 6, l: 3, pts: 12, nrr: "+0.542" },
  { pos: 3, team: "CSK", p: 9, w: 6, l: 3, pts: 12, nrr: "+0.318" },
  { pos: 4, team: "KKR", p: 9, w: 5, l: 4, pts: 10, nrr: "+0.211" },
  { pos: 5, team: "SRH", p: 9, w: 5, l: 4, pts: 10, nrr: "-0.112" },
  { pos: 6, team: "RR", p: 9, w: 4, l: 5, pts: 8, nrr: "+0.089" },
  { pos: 7, team: "DC", p: 9, w: 4, l: 5, pts: 8, nrr: "-0.234" },
  { pos: 8, team: "GT", p: 9, w: 3, l: 6, pts: 6, nrr: "-0.445" },
  { pos: 9, team: "LSG", p: 9, w: 2, l: 7, pts: 4, nrr: "-0.567" },
  { pos: 10, team: "PBKS", p: 9, w: 2, l: 7, pts: 4, nrr: "-0.623" },
];

const getTeam = (short) => TEAMS.find(t => t.short === short) || TEAMS[0];

function AdBanner({ size = "leaderboard", label = "Advertisement" }) {
  const sizes = {
    leaderboard: "w-full h-[90px]",
    rectangle: "w-[300px] h-[250px]",
    banner: "w-full h-[60px]",
  };
  return (
    <div className={`${sizes[size]} bg-gradient-to-r from-gray-800 to-gray-900 border border-gray-700 rounded-lg flex items-center justify-center relative overflow-hidden`}>
      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "repeating-linear-gradient(45deg, #fff 0, #fff 1px, transparent 0, transparent 50%)", backgroundSize: "10px 10px" }} />
      <div className="text-center z-10">
        <p className="text-gray-500 text-xs uppercase tracking-widest">{label}</p>
        <p className="text-gray-400 text-sm font-bold mt-1">Your Ad Here • Google AdSense</p>
        <p className="text-gray-600 text-xs">High CTR Cricket Audience • ₹800–3000 CPM</p>
      </div>
    </div>
  );
}

function LiveBadge() {
  return (
    <span className="inline-flex items-center gap-1 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full animate-pulse">
      <span className="w-1.5 h-1.5 bg-white rounded-full"></span> LIVE
    </span>
  );
}

function MatchCard({ match }) {
  const t1 = getTeam(match.team1);
  const t2 = getTeam(match.team2);
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 hover:border-orange-500/50 transition-all duration-300 cursor-pointer group">
      <div className="flex items-center justify-between mb-3">
        <span className="text-gray-500 text-xs">{match.venue}</span>
        {match.live ? <LiveBadge /> : <span className="text-gray-600 text-xs">{match.date}</span>}
      </div>
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 text-center">
          <div className="text-3xl mb-1">{t1.emoji}</div>
          <div className="font-bold text-white text-lg" style={{ fontFamily: "'Bebas Neue', cursive" }}>{match.team1}</div>
          {match.score1 !== "—" && <div className="text-orange-400 font-bold text-xl mt-1">{match.score1}</div>}
          {match.overs1 && <div className="text-gray-500 text-xs">({match.overs1} ov)</div>}
        </div>
        <div className="text-center">
          <div className="text-gray-600 font-black text-xl">VS</div>
        </div>
        <div className="flex-1 text-center">
          <div className="text-3xl mb-1">{t2.emoji}</div>
          <div className="font-bold text-white text-lg" style={{ fontFamily: "'Bebas Neue', cursive" }}>{match.team2}</div>
          {match.score2 !== "—" && <div className="text-orange-400 font-bold text-xl mt-1">{match.score2}</div>}
          {match.overs2 && <div className="text-gray-500 text-xs">({match.overs2} ov)</div>}
        </div>
      </div>
      <div className="mt-3 pt-3 border-t border-gray-800 text-center">
        <p className="text-sm text-gray-400">{match.status}</p>
      </div>
    </div>
  );
}

function AIAnalysisPanel({ query, onClose }) {
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalysis = async () => {
      setLoading(true);
      setResponse("");
      try {
        const OPENROUTER_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;
        const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${OPENROUTER_KEY}`,
            "HTTP-Referer": "https://cricketsaathi.in",
            "X-Title": "CricketSaathi",
          },
          body: JSON.stringify({
            model: "openrouter/auto",
            max_tokens: 400,
            messages: [
              { role: "system", content: `You are CricketSaathi AI — India's smartest cricket analyst. You provide sharp, engaging cricket analysis in a mix of English with occasional Hindi phrases (like 'yaar', 'ekdum solid', 'kya shot tha'). You analyze IPL 2025 matches, players, fantasy tips, and predictions with genuine cricket knowledge. Be specific with stats, player names, and match situations. Keep responses punchy and exciting — like a cricket commentator mixed with a data analyst. Use emojis sparingly. Max 200 words.` },
              { role: "user", content: query }
            ],
          }),
        });
        const data = await res.json();
        console.log(data);
        const text = data.choices?.[0]?.message?.content || "Analysis unavailable right now.";
        setResponse(text);
      } catch {
        setResponse("⚠️ AI analysis temporarily unavailable. Please try again.");
      }
      setLoading(false);
    };
    fetchAnalysis();
  }, [query]);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-gray-900 border border-orange-500/50 rounded-2xl p-6 max-w-lg w-full shadow-2xl shadow-orange-500/10" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-sm">🤖</div>
            <div>
              <p className="text-white font-bold text-sm">CricketSaathi AI</p>
              <p className="text-gray-500 text-xs">Powered by Gemini</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white text-xl">✕</button>
        </div>
        <div className="bg-gray-800/50 rounded-xl p-3 mb-4">
          <p className="text-gray-400 text-sm italic">"{query}"</p>
        </div>
        {loading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-4 bg-gray-800 rounded animate-pulse" style={{ width: `${85 - i * 10}%` }} />
            ))}
            <p className="text-orange-400 text-xs text-center mt-2">AI analyzing cricket data...</p>
          </div>
        ) : (
          <div className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">{response}</div>
        )}
        <div className="mt-4 pt-4 border-t border-gray-800">
          <AdBanner size="banner" label="Sponsored" />
        </div>
      </div>
    </div>
  );
}

function FormBar({ data, role }) {
  const max = Math.max(...data);
  return (
    <div className="flex items-end gap-0.5 h-8">
      {data.map((val, i) => (
        <div key={i} className="flex-1 rounded-sm transition-all" style={{
          height: `${(val / max) * 100}%`,
          background: i === data.length - 1 ? "#f97316" : `rgba(249,115,22,${0.3 + (i / data.length) * 0.4})`,
        }} title={`${role === "Bowler" ? val + " wkts" : val + " runs"}`} />
      ))}
    </div>
  );
}

export default function CricketSaathi() {
  const [activeTab, setActiveTab] = useState("matches");
  const [aiQuery, setAiQuery] = useState("");
  const [showAI, setShowAI] = useState(false);
  const [currentQuery, setCurrentQuery] = useState("");
  const [ticker, setTicker] = useState(0);
  const inputRef = useRef(null);

  const tickerItems = [
    "🏏 MI vs CSK LIVE: MI 187/4 (20) • CSK need 6 off last over",
    "🔥 Kohli hits century • RCB vs KKR • 112(68)",
    "📊 Points Table: RCB leads with 14 pts",
    "💫 Fantasy Tip: Bumrah must-pick tonight",
    "🏆 IPL 2025: 34 matches completed • 26 remaining",
  ];

  useEffect(() => {
    const t = setInterval(() => setTicker(p => (p + 1) % tickerItems.length), 3000);
    return () => clearInterval(t);
  }, []);

  const quickQueries = [
    "Who should I pick as captain for Dream11 tonight?",
    "Predict MI vs CSK winner with analysis",
    "Best batting pitch in IPL 2025?",
    "Kohli vs Bumrah head-to-head stats",
    "Which team has best chance of winning IPL 2025?",
  ];

  const handleAsk = (q) => {
    const query = q || aiQuery;
    if (!query.trim()) return;
    setCurrentQuery(query);
    setShowAI(true);
    setAiQuery("");
  };

  const tabs = [
    { id: "matches", label: "Matches", icon: "🏏" },
    { id: "players", label: "Players", icon: "⭐" },
    { id: "points", label: "Points Table", icon: "📊" },
    { id: "news", label: "News", icon: "📰" },
    { id: "fantasy", label: "Fantasy AI", icon: "🎯" },
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-white" style={{ fontFamily: "'Barlow', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow:wght@400;500;600;700&family=Barlow+Condensed:wght@700;800&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: #111; } ::-webkit-scrollbar-thumb { background: #f97316; border-radius: 2px; }
        .tab-active { background: linear-gradient(135deg, #f97316, #ea580c); color: white; }
        .glow { box-shadow: 0 0 30px rgba(249,115,22,0.3); }
        @keyframes slideIn { from { opacity:0; transform: translateY(-4px); } to { opacity:1; transform:translateY(0); } }
        .slide-in { animation: slideIn 0.3s ease; }
      `}</style>

      {/* Header */}
      <header className="sticky top-0 z-40 bg-gray-950/95 backdrop-blur border-b border-gray-800">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-orange-500 rounded-xl flex items-center justify-center text-lg glow">🏏</div>
            <div>
              <h1 className="text-white font-black text-xl leading-none" style={{ fontFamily: "'Bebas Neue', cursive", letterSpacing: "2px" }}>
                CRICKET<span className="text-orange-500">SAATHI</span>
              </h1>
              <p className="text-gray-500 text-xs leading-none">AI-Powered Cricket Intelligence</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <LiveBadge />
            <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-700">🔔</div>
          </div>
        </div>

        {/* Live Ticker */}
        <div className="bg-orange-500/10 border-t border-orange-500/20 px-4 py-1.5 overflow-hidden">
          <div className="max-w-5xl mx-auto flex items-center gap-3">
            <span className="text-orange-400 text-xs font-bold uppercase tracking-wider whitespace-nowrap">LIVE</span>
            <div className="flex-1 overflow-hidden">
              <p key={ticker} className="text-gray-300 text-xs slide-in truncate">{tickerItems[ticker]}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Top Ad */}
      <div className="max-w-5xl mx-auto px-4 py-3">
        <AdBanner size="leaderboard" />
      </div>

      {/* AI Ask Bar */}
      <div className="max-w-5xl mx-auto px-4 pb-4">
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 border border-orange-500/30 rounded-2xl p-4 glow">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-orange-400 text-lg">🤖</span>
            <p className="text-white font-bold text-sm">Ask CricketSaathi AI</p>
            <span className="text-xs bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded-full">Powered by Gemini</span>
          </div>
          <div className="flex gap-2">
            <input
              ref={inputRef}
              value={aiQuery}
              onChange={e => setAiQuery(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleAsk()}
              placeholder="Ask anything... 'Who should I captain tonight?'"
              className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors"
            />
            <button onClick={() => handleAsk()} className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-colors whitespace-nowrap">
              Ask AI ⚡
            </button>
          </div>
          <div className="flex gap-2 mt-3 overflow-x-auto pb-1 scrollbar-hide">
            {quickQueries.map((q, i) => (
              <button key={i} onClick={() => handleAsk(q)} className="whitespace-nowrap text-xs bg-gray-800 hover:bg-orange-500/20 text-gray-400 hover:text-orange-300 border border-gray-700 hover:border-orange-500/50 px-3 py-1.5 rounded-full transition-all">
                {q}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-5xl mx-auto px-4 pb-4">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`whitespace-nowrap flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${activeTab === tab.id ? "tab-active" : "bg-gray-800 text-gray-400 hover:text-white"}`}
            >
              <span>{tab.icon}</span> {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 pb-8">
        <div className="flex gap-6">
          <div className="flex-1 min-w-0">

            {/* Matches Tab */}
            {activeTab === "matches" && (
              <div className="space-y-4 slide-in">
                <h2 className="text-white font-bold text-lg" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>IPL 2025 • Matches</h2>
                {MOCK_MATCHES.map(m => <MatchCard key={m.id} match={m} />)}
                <div className="mt-4">
                  <AdBanner size="leaderboard" label="Advertisement" />
                </div>
              </div>
            )}

            {/* Players Tab */}
            {activeTab === "players" && (
              <div className="space-y-3 slide-in">
                <h2 className="text-white font-bold text-lg" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>Top Performers • IPL 2025</h2>
                {MOCK_PLAYERS.map((p, i) => (
                  <div key={i} className="bg-gray-900 border border-gray-800 rounded-2xl p-4 hover:border-orange-500/40 transition-all cursor-pointer" onClick={() => handleAsk(`Analyze ${p.name}'s performance in IPL 2025 and is he good for fantasy?`)}>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center text-xl font-black text-orange-500" style={{ fontFamily: "'Bebas Neue', cursive" }}>
                        {p.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-white font-bold">{p.name}</p>
                          <span className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full">{p.team}</span>
                          <span className="text-xs text-gray-600">{p.role}</span>
                        </div>
                        <div className="flex gap-4 mt-1">
                          {p.runs !== undefined ? (
                            <>
                              <span className="text-sm text-orange-400 font-bold">{p.runs} runs</span>
                              <span className="text-sm text-gray-500">Avg {p.avg}</span>
                              <span className="text-sm text-gray-500">SR {p.sr}</span>
                            </>
                          ) : (
                            <>
                              <span className="text-sm text-orange-400 font-bold">{p.wickets} wkts</span>
                              <span className="text-sm text-gray-500">Avg {p.avg}</span>
                              <span className="text-sm text-gray-500">Eco {p.eco}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="w-20">
                        <p className="text-gray-600 text-xs mb-1">Last 8</p>
                        <FormBar data={p.form} role={p.role} />
                      </div>
                    </div>
                  </div>
                ))}
                <AdBanner size="leaderboard" />
              </div>
            )}

            {/* Points Table */}
            {activeTab === "points" && (
              <div className="slide-in">
                <h2 className="text-white font-bold text-lg mb-4" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>Points Table • IPL 2025</h2>
                <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
                  <div className="grid grid-cols-7 bg-gray-800 px-4 py-2 text-xs text-gray-500 font-bold uppercase tracking-wider">
                    <span>#</span><span className="col-span-2">Team</span><span className="text-center">P</span><span className="text-center">W</span><span className="text-center">Pts</span><span className="text-center">NRR</span>
                  </div>
                  {POINTS_TABLE.map((row, i) => (
                    <div key={i} className={`grid grid-cols-7 px-4 py-3 border-t border-gray-800 hover:bg-gray-800/50 transition-colors ${i < 4 ? "border-l-2 border-l-green-500" : i < 6 ? "" : "opacity-60"}`}>
                      <span className="text-gray-500 text-sm">{row.pos}</span>
                      <span className="col-span-2 text-white font-bold text-sm">{row.team}</span>
                      <span className="text-center text-gray-400 text-sm">{row.p}</span>
                      <span className="text-center text-gray-400 text-sm">{row.w}</span>
                      <span className="text-center text-orange-400 font-bold text-sm">{row.pts}</span>
                      <span className={`text-center text-sm ${row.nrr.startsWith("+") ? "text-green-400" : "text-red-400"}`}>{row.nrr}</span>
                    </div>
                  ))}
                </div>
                <p className="text-gray-600 text-xs mt-2 pl-1">🟢 Top 4 qualify for playoffs</p>
                <div className="mt-4"><AdBanner size="leaderboard" /></div>
              </div>
            )}

            {/* News Tab */}
            {activeTab === "news" && (
              <div className="space-y-3 slide-in">
                <h2 className="text-white font-bold text-lg" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>Cricket News • IPL 2025</h2>
                {MOCK_NEWS.map(n => (
                  <div key={n.id} className="bg-gray-900 border border-gray-800 rounded-2xl p-4 hover:border-orange-500/40 transition-all cursor-pointer group" onClick={() => handleAsk(`Tell me more about: ${n.title}`)}>
                    <div className="flex items-start gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded-full">{n.category}</span>
                          {n.hot && <span className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full">🔥 Trending</span>}
                        </div>
                        <p className="text-white text-sm font-semibold leading-snug group-hover:text-orange-300 transition-colors">{n.title}</p>
                        <p className="text-gray-600 text-xs mt-1">{n.time} • Tap for AI analysis</p>
                      </div>
                      <div className="text-gray-700 group-hover:text-orange-500 transition-colors text-lg">→</div>
                    </div>
                  </div>
                ))}
                <AdBanner size="leaderboard" />
              </div>
            )}

            {/* Fantasy AI Tab */}
            {activeTab === "fantasy" && (
              <div className="space-y-4 slide-in">
                <div className="bg-gradient-to-br from-orange-500/20 to-red-500/10 border border-orange-500/30 rounded-2xl p-5">
                  <h2 className="text-white font-black text-xl mb-1" style={{ fontFamily: "'Bebas Neue', cursive", letterSpacing: "1px" }}>🎯 FANTASY AI ASSISTANT</h2>
                  <p className="text-gray-400 text-sm">Get AI-powered Dream11 & My11Circle tips instantly</p>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {[
                    { title: "Captain & Vice Captain Picks", desc: "Tonight's best C/VC for Dream11", query: "Who are the best captain and vice-captain picks for tonight's IPL match in Dream11?" },
                    { title: "Best XI Selection", desc: "Balanced team for maximum points", query: "Give me the best Dream11 team of 11 players for tonight's IPL match with reasoning" },
                    { title: "Differential Picks", desc: "Low ownership high reward players", query: "Which low-ownership differential players should I pick in Dream11 for tonight's IPL match?" },
                    { title: "Pitch & Conditions Analysis", desc: "How pitch affects your team", query: "How will tonight's IPL pitch and conditions affect fantasy cricket team selection?" },
                  ].map((item, i) => (
                    <button key={i} onClick={() => handleAsk(item.query)} className="bg-gray-900 border border-gray-800 hover:border-orange-500/50 rounded-2xl p-4 text-left transition-all group">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white font-semibold text-sm">{item.title}</p>
                          <p className="text-gray-500 text-xs mt-0.5">{item.desc}</p>
                        </div>
                        <div className="w-8 h-8 bg-orange-500/20 group-hover:bg-orange-500 rounded-lg flex items-center justify-center transition-colors text-orange-400 group-hover:text-white">⚡</div>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Fantasy Ad - high CPM */}
                <div className="bg-gray-900 border border-yellow-500/30 rounded-2xl p-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-yellow-500 font-bold uppercase tracking-wider">Sponsored • Dream11</p>
                    <p className="text-white font-bold mt-1">Win ₹10 Crore this IPL! 🏆</p>
                    <p className="text-gray-400 text-sm">Join 15 Crore+ fantasy players</p>
                  </div>
                  <button className="bg-yellow-500 text-black font-black px-4 py-2 rounded-xl text-sm hover:bg-yellow-400 transition-colors">
                    PLAY NOW
                  </button>
                </div>

                <AdBanner size="leaderboard" />
              </div>
            )}
          </div>

          {/* Sidebar Ad */}
          <div className="hidden lg:block w-[300px] flex-shrink-0 space-y-4">
            <AdBanner size="rectangle" label="Advertisement" />
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
              <p className="text-gray-500 text-xs uppercase tracking-wider mb-3">Quick AI Tips</p>
              {quickQueries.slice(0, 3).map((q, i) => (
                <button key={i} onClick={() => handleAsk(q)} className="w-full text-left text-sm text-gray-400 hover:text-orange-400 py-2 border-b border-gray-800 last:border-0 transition-colors">
                  🤖 {q}
                </button>
              ))}
            </div>
            <AdBanner size="rectangle" label="Advertisement" />
          </div>
        </div>
      </div>

      {/* AI Modal */}
      {showAI && <AIAnalysisPanel query={currentQuery} onClose={() => setShowAI(false)} />}

      {/* Footer */}
      <footer className="border-t border-gray-800 bg-gray-900 py-6 mt-8">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <p className="text-white font-black text-lg" style={{ fontFamily: "'Bebas Neue', cursive", letterSpacing: "2px" }}>CRICKET<span className="text-orange-500">SAATHI</span></p>
          <p className="text-gray-600 text-xs mt-1">AI-Powered Cricket Intelligence for India 🇮🇳</p>
          <p className="text-gray-700 text-xs mt-3">© 2025 CricketSaathi • Data for entertainment purposes • Powered by Claude AI</p>
        </div>
      </footer>
    </div>
  );
}
