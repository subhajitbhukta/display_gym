import React, { useState, useEffect, useRef } from 'react';
import PremiumHeader from './PremiumHeader';

const CombinedRankingDisplay = () => {
  const safeJson = (data) => {
    if (typeof data === "string") {
      return JSON.parse(data);
    }
    return data;
  };

  const formatScore = (score) => {
    if (!score || score === "" || score === "-") return "-";
    const numScore = parseFloat(score);
    if (isNaN(numScore)) return "-";
    return numScore.toFixed(2);
  };

  const apparatusShortNames = {
    "FLOOR EXERCISE": "FX",
    "POMMEL HORSE": "PH",
    "RINGS": "SR",
    "Vault": "VT",
    "PARALLEL BARS": "PB",
    "HORIZONTAL BAR": "HB"
  };

  const getRankBgColor = (rank) => {
    const r = Number(rank);

    if (r === 1) return "bg-orange-500 text-white"; // 🇮🇳 Saffron

    if (r === 2)
      return "bg-white text-black border-t-2 border-b-2 border-blue-900 shadow-sm";

    if (r === 3) return "bg-green-600 text-white"; // 🇮🇳 Green

    return r % 2 === 0
      ? "bg-blue-500 text-white"
      : "bg-blue-600 text-white";
  };



  const truncateName = (name, maxLength) => {
    if (!name) return '';
    if (name.length <= maxLength) return name;
    return name.substring(0, maxLength - 2) + '..';
  };

  /* =========================
     SMOOTH SCROLL HOOK
  ========================== */
  const useSmoothScroll = (contentRef, isActive = true) => {
    const scrollRef = useRef(null);
    const animationRef = useRef(null);
    const scrollPosition = useRef(0);

    useEffect(() => {
      if (!isActive || !scrollRef.current) return;

      const container = scrollRef.current;
      const SCROLL_SPEED = 0.3; // pixels per frame (adjust for speed)
      const PAUSE_AT_TOP = 2000; // pause duration at top in ms
      const PAUSE_AT_BOTTOM = 2000; // pause duration at bottom in ms

      let lastTimestamp = null;
      let pauseUntil = null;
      let isAtBottom = false;

      const animate = (timestamp) => {
        if (!lastTimestamp) lastTimestamp = timestamp;

        // Check if we're in a pause period
        if (pauseUntil && timestamp < pauseUntil) {
          animationRef.current = requestAnimationFrame(animate);
          return;
        }

        const deltaTime = timestamp - lastTimestamp;
        lastTimestamp = timestamp;

        // Calculate scroll amount based on time elapsed
        const scrollAmount = SCROLL_SPEED * (deltaTime / 16.67); // normalized to 60fps

        scrollPosition.current += scrollAmount;

        // Get the height of one set of content (duplicated content for seamless loop)
        const singleContentHeight = container.scrollHeight / 2;

        // Check if we've reached the bottom of the first set
        if (scrollPosition.current >= singleContentHeight) {
          // Pause at bottom
          pauseUntil = timestamp + PAUSE_AT_BOTTOM;
          isAtBottom = true;
          scrollPosition.current = singleContentHeight;
        }

        // Reset to top after pause at bottom
        if (isAtBottom && pauseUntil && timestamp >= pauseUntil) {
          scrollPosition.current = 0;
          pauseUntil = timestamp + PAUSE_AT_TOP;
          isAtBottom = false;
        }

        // Apply smooth scroll position
        container.scrollTop = scrollPosition.current;

        animationRef.current = requestAnimationFrame(animate);
      };

      // Start animation after initial pause
      pauseUntil = performance.now() + PAUSE_AT_TOP;
      animationRef.current = requestAnimationFrame(animate);

      return () => {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
      };
    }, [isActive]);

    return scrollRef;
  };

  /* =========================
     TEAM RANKING COMPONENT
  ========================== */
  const TeamRankingScreen = ({ apiId, position, headerTitle }) => {
    const [teamData, setTeamData] = useState(null);
    const [teamLoading, setTeamLoading] = useState(true);
    const scrollRef = useSmoothScroll(null, teamData?.result?.length > 3);

    useEffect(() => {
      const fetchTeamData = async () => {
        try {
          const res = await fetch(`/igss/api/${apiId}/result`);
          const data = await res.json();
          const json = safeJson(data);

          if (!json || !json.result) {
            console.error("Invalid team API response structure:", json);
            return;
          }

          let resultArray = json.result;
          if (!Array.isArray(json.result)) {
            resultArray = Object.values(json.result);
          }

          const formatted = resultArray.map((team, index) => ({
            team_name: team.team_name ?? "",
            score: formatScore(team.score),
            team_rank: Number(team.team_rank ?? team.rank ?? index + 1),
          }));

          setTeamData({
            game_name: json.game_name,
            event_name: json.event_name,
            category: json.category,
            result: formatted
          });
        } catch (err) {
          console.error("Team API Error:", err);
        } finally {
          setTeamLoading(false);
        }
      };

      fetchTeamData();
    }, [apiId]);

    if (teamLoading || !teamData) {
      return (
        <div className="w-full h-full flex items-center justify-center bg-black text-2xl font-black">
          Loading Team Rankings...
        </div>
      );
    }

    const scrollableItems = teamData.result.slice(3);

    return (
      <div className="w-full h-full flex flex-col bg-gray-900">
        <div className="bg-black text-white text-center font-black text-xl py-1">
          {headerTitle || `${teamData.category} TEAM CHAMPIONSHIP`}
        </div>
        <div className="flex-1 overflow-hidden flex flex-col min-h-0">
          <div className="bg-gray-900 flex-shrink-0">
            <div className="grid grid-cols-[70px_1fr_120px] gap-4 px-2">
              <div className="px-1 py-3 text-center font-black text-white border-b-4 border-gray-600 text-2xl">
                RANK
              </div>
              <div className="px-2 py-3 text-left font-black text-white border-b-4 border-gray-600 text-2xl">
                TEAM NAME
              </div>
              <div className="px-1 py-3 text-center font-black text-white border-b-4 border-gray-600 text-2xl">
                SCORE
              </div>
            </div>
          </div>
          <div className="flex-shrink-0 sticky top-0 z-10">
            {teamData.result.slice(0, 3).map((team, index) => (
              <div
                key={index}
                className={`${getRankBgColor(team.team_rank)}  border-b-2 border-gray-800 grid grid-cols-[70px_1fr_120px] gap-4 px-2`}
              >
                <div className="px-1 py-3 text-center font-black text-2xl flex items-center justify-center">
                  {team.team_rank}
                </div>
                <div className="px-2 py-3 font-black text-2xl flex items-center">
                  {team.team_name}
                </div>
                <div className="px-1 py-3 text-center font-black text-2xl flex items-center justify-center">
                  {team.score}
                </div>
              </div>
            ))}
          </div>
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto scrollbar-hide"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              WebkitOverflowScrolling: 'touch'
            }}
          >
            {scrollableItems.map((team, index) => (
              <div
                key={`first-${index + 3}`}
                className={`${getRankBgColor(team.team_rank)} text-white border-b-2 border-gray-800 grid grid-cols-[70px_1fr_120px] gap-4 px-2`}
              >
                <div className="px-1 py-3 text-center font-black text-2xl flex items-center justify-center">
                  {team.team_rank}
                </div>
                <div className="px-2 py-3 font-black text-lg flex items-center">
                  {team.team_name}
                </div>
                <div className="px-1 py-3 text-center font-black text-2xl flex items-center justify-center">
                  {team.score}
                </div>
              </div>
            ))}
            {scrollableItems.map((team, index) => (
              <div
                key={`second-${index + 3}`}
                className={`${getRankBgColor(team.team_rank)} text-white border-b-2 border-gray-800 grid grid-cols-[70px_1fr_120px] gap-4 px-2`}
              >
                <div className="px-1 py-3 text-center font-black text-2xl flex items-center justify-center">
                  {team.team_rank}
                </div>
                <div className="px-2 py-3 font-black text-lg flex items-center">
                  {team.team_name}
                </div>
                <div className="px-1 py-3 text-center font-black text-2xl flex items-center justify-center">
                  {team.score}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  /* =========================
     INDIVIDUAL RANKING COMPONENT
  ========================== */
  const IndividualRankingScreen = ({ apiId, position, headerTitle }) => {
    const [individualData, setIndividualData] = useState(null);
    const [individualLoading, setIndividualLoading] = useState(true);
    const scrollRef = useSmoothScroll(null, individualData?.result?.length > 3);

    useEffect(() => {
      const fetchIndividualData = async () => {
        try {
          const res = await fetch(`/igss/api/${apiId}/result`);
          const data = await res.json();
          const json = safeJson(data);

          if (!json || !json.result) {
            console.error("Invalid API response structure:", json);
            return;
          }

          let resultArray = json.result;
          if (!Array.isArray(json.result)) {
            resultArray = Object.values(json.result);
          }

          const formatted = resultArray.map((player, index) => ({
            player_name: player.player_name ?? "",
            unit: player.unit ?? "",
            score: formatScore(player.score),
            final_rank: player.final_rank ?? player.rank ?? (index + 1),
            details: {
              "FLOOR EXERCISE": formatScore(player.details?.["FLOOR EXERCISE"] ?? player.fx),
              "POMMEL HORSE": formatScore(player.details?.["POMMEL HORSE"] ?? player.ph),
              "RINGS": formatScore(player.details?.["RINGS"] ?? player.sr),
              "Vault": formatScore(player.details?.["Vault"] ?? player.vt),
              "PARALLEL BARS": formatScore(player.details?.["PARALLEL BARS"] ?? player.pb),
              "HORIZONTAL BAR": formatScore(player.details?.["HORIZONTAL BAR"] ?? player.hb),
            }
          }));

          setIndividualData({
            game_name: json.game_name,
            event_name: json.event_name,
            category: json.category,
            result: formatted
          });
        } catch (err) {
          console.error("Individual API Error:", err);
        } finally {
          setIndividualLoading(false);
        }
      };

      fetchIndividualData();
    }, [apiId]);

    if (individualLoading || !individualData || !individualData.result || individualData.result.length === 0) {
      return (
        <div className="w-full h-full flex items-center justify-center bg-black text-white text-2xl font-black">
          Loading Individual Rankings...
        </div>
      );
    }

    const scrollableItems = individualData.result.slice(3);

    return (
      <div className="w-full h-full flex flex-col bg-gray-900">
        <div className="bg-black text-white text-center font-black text-xl py-1">
          {headerTitle || `${individualData.category} ALL AROUND INDIVIDUAL`}
        </div>
        <div className="flex-1 overflow-hidden flex flex-col min-h-0">
          <div className="bg-gray-900 flex-shrink-0">
            <div className="grid grid-cols-[60px_minmax(120px,1fr)_repeat(6,70px)_80px] gap-1 px-1">
              <div className="px-1 py-3 text-center font-black text-white border-b-4 border-gray-600 text-base">
                RANK
              </div>
              <div className="px-1 py-3 text-left font-black text-white border-b-4 border-gray-600 text-base">
                NAME
              </div>
              {Object.keys(individualData.result[0].details).map((apparatus) => (
                <div key={apparatus} className="px-1 py-3 text-center font-black text-white border-b-4 border-gray-600 text-base">
                  {apparatusShortNames[apparatus]}
                </div>
              ))}
              <div className="px-1 py-3 text-center font-black text-white border-b-4 border-gray-600 text-base">
                TOT
              </div>
            </div>
          </div>
          <div className="flex-shrink-0 sticky top-0 z-10">
            {individualData.result.slice(0, 3).map((player, index) => (
              <div
                key={index}
                className={`${getRankBgColor(player.final_rank)} border-b-2 border-gray-800 py-2`}
              >
                <div className="grid grid-cols-[60px_minmax(120px,1fr)_repeat(6,70px)_80px] gap-1 px-1">
                  <div className="px-1 text-center font-black text-2xl flex items-center justify-center">
                    {player.final_rank}
                  </div>
                  <div className="px-1 flex flex-col justify-center overflow-hidden">
                    <div className="font-black leading-tight text-lg">
                      <span className="truncate block">{truncateName(player.player_name, 20)}</span>
                    </div>
                    <div className="text-sm font-black opacity-90 leading-tight">
                      {player.unit}
                    </div>
                  </div>
                  {Object.entries(player.details).map(([apparatus, score]) => (
                    <div key={apparatus} className="px-1 flex items-center justify-center">
                      <div className="text-xl font-black">
                        {score}
                      </div>
                    </div>
                  ))}
                  <div className="px-1 text-center font-black text-2xl flex items-center justify-center">
                    {player.score}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div
            ref={scrollRef}
            className="flex-1 overflow-auto scrollbar-hide"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              WebkitOverflowScrolling: 'touch'
            }}
          >
            {scrollableItems.map((player, index) => (
              <div
                key={`first-${index}`}
                className={`${getRankBgColor(player.final_rank)} text-white border-b-2 border-gray-800 py-2`}
              >
                <div className="grid grid-cols-[60px_minmax(120px,1fr)_repeat(6,70px)_80px] gap-1 px-1">
                  <div className="px-1 text-center font-black text-2xl flex items-center justify-center">
                    {player.final_rank}
                  </div>
                  <div className="px-1 flex flex-col justify-center overflow-hidden">
                    <div className="font-black leading-tight text-lg">
                      <span className="truncate block">{truncateName(player.player_name, 20)}</span>
                    </div>
                    <div className="text-xs font-black opacity-90 leading-tight">
                      {player.unit}
                    </div>
                  </div>
                  {Object.entries(player.details).map(([apparatus, score]) => (
                    <div key={apparatus} className="px-1 flex items-center justify-center">
                      <div className="text-xl font-black">
                        {score}
                      </div>
                    </div>
                  ))}
                  <div className="px-1 text-center font-black text-lg flex items-center justify-center">
                    {player.score}
                  </div>
                </div>
              </div>
            ))}
            {scrollableItems.map((player, index) => (
              <div
                key={`second-${index}`}
                className={`${getRankBgColor(player.final_rank)} text-white border-b-2 border-gray-800 py-2`}
              >
                <div className="grid grid-cols-[60px_minmax(120px,1fr)_repeat(6,70px)_80px] gap-1 px-1">
                  <div className="px-1 text-center font-black text-2xl flex items-center justify-center">
                    {player.final_rank}
                  </div>
                  <div className="px-1 flex flex-col justify-center overflow-hidden">
                    <div className="font-black leading-tight text-sm">
                      <span className="truncate block">{truncateName(player.player_name, 20)}</span>
                    </div>
                    <div className="text-xs font-black opacity-90 leading-tight">
                      {player.unit}
                    </div>
                  </div>
                  {Object.entries(player.details).map(([apparatus, score]) => (
                    <div key={apparatus} className="px-1 flex items-center justify-center">
                      <div className="text-base font-black">
                        {score}
                      </div>
                    </div>
                  ))}
                  <div className="px-1 text-center font-black text-lg flex items-center justify-center">
                    {player.score}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  /* =========================
     API CONFIGURATION
  ========================== */
  const API_CONFIG = {
    individual1: "67952737",
    individual2: "67952737",
    team1: "6795273",
    team2: "6795273"
  };

  const HEADER_TITLES = {
    mainHeader: "GYMNASTICS CHAMPIONSHIP",
    individual1: "",
    individual2: "",
    team1: "",
    team2: ""
  };

  return (
    <>
      <PremiumHeader title={HEADER_TITLES.mainHeader} />
      <div className="w-full h-screen grid grid-cols-2 grid-rows-2 gap-1 bg-black p-1">
        <IndividualRankingScreen
          apiId={API_CONFIG.individual1}
          position="INDIVIDUAL - SCREEN 1"
          headerTitle={HEADER_TITLES.individual1}
        />
        <IndividualRankingScreen
          apiId={API_CONFIG.individual2}
          position="INDIVIDUAL - SCREEN 2"
          headerTitle={HEADER_TITLES.individual2}
        />
        <TeamRankingScreen
          apiId={API_CONFIG.team1}
          position="TEAM - SCREEN 1"
          headerTitle={HEADER_TITLES.team1}
        />
        <TeamRankingScreen
          apiId={API_CONFIG.team2}
          position="TEAM - SCREEN 2"
          headerTitle={HEADER_TITLES.team2}
        />
      </div>
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </>
  );
};

export default CombinedRankingDisplay;