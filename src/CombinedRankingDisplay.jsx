import React, { useState, useEffect } from 'react';
import PremiumHeader from './PremiumHeader';

const CombinedRankingDisplay = () => {

  /* =========================
     TEAM DATA (API)
  ========================== */
  const [teamData, setTeamData] = useState(null);
  const [teamLoading, setTeamLoading] = useState(true);

  const safeJson = (data) => {
    if (typeof data === "string") {
      return JSON.parse(data);
    }
    return data;
  };

  useEffect(() => {
    const fetchTeamData = async () => {
      try {
        const res = await fetch("/igss/api/67952737/result");
        const data = await res.json();

        const json = safeJson(data);

        // Check if json exists and has the expected structure
        if (!json || !json.result) {
          console.error("Invalid team API response structure:", json);
          return;
        }

        const formatted = json.result.map((team, index) => ({
          team_name: team.unit ?? team.team_name ?? "",
          score:
            team.score && team.score !== ""
              ? team.score
              : team.total_score && team.total_score !== ""
                ? team.total_score
                : "-",
          team_rank: Number(team.team_rank ?? team.rank ?? index + 1),
        }));


        setTeamData({
          game_name: json.game_name,
          event_name: json.event_name,
          category: json.category,
          report_name: "TEAM RANKING",
          result: formatted
        });

      } catch (err) {
        console.error("Team API Error:", err);
      } finally {
        setTeamLoading(false);
      }
    };

    fetchTeamData();
  }, []);

  /* =========================
     INDIVIDUAL DATA (API)
  ========================== */
  const [individualData, setIndividualData] = useState(null);
  const [individualLoading, setIndividualLoading] = useState(true);


  
  useEffect(() => {
    const fetchIndividualData = async () => {
      try {
        const res = await fetch("/igss/api/67952737/result");
        const data = await res.json();

        const json = safeJson(data);

        // Check if json exists and has the expected structure
        if (!json || !json.result) {
          console.error("Invalid API response structure:", json);
          return;
        }

        const formatted = json.result.map((player, index) => ({
          player_name: player.player_name ?? "",
          unit: player.unit ?? "",
          score: player.score ?? player.total_score??player.total_score ?? "-",
          final_rank: player.final_rank ?? player.rank ?? (index + 1),
          details: player.details ?? {
            "FLOOR EXERCISE": player.fx ?? "-",
            "POMMEL HORSE": player.ph ?? "-",
            "RINGS": player.sr ?? "-",
            "Vault": player.vt ?? "-",
            "PARALLEL BARS": player.pb ?? "-",
            "HORIZONTAL BAR": player.hb ?? "-",
          }
        }));

        setIndividualData({
          game_name: json.game_name,
          event_name: json.event_name,
          category: json.category,
          report_name: "ALL AROUND INDIVIDUAL RANKING",
          result: formatted
        });

      } catch (err) {
        console.error("Individual API Error:", err);
      } finally {
        setIndividualLoading(false);
      }
    };

    fetchIndividualData();
  }, []);

  /* =========================
     HELPERS
  ========================== */
  const apparatusShortNames = {
    "FLOOR EXERCISE": "FX",
    "POMMEL HORSE": "PH",
    "RINGS": "SR",
    "Vault": "VT",
    "PARALLEL BARS": "PB",
    "HORIZONTAL BAR": "HB"
  };

  const getRankBgColor = (rank) => {
    const rankColors = {
      1: 'bg-red-600',
      2: 'bg-orange-500',
      3: 'bg-orange-600',
    };

    return rankColors[rank] || (rank % 2 === 0 ? 'bg-blue-500' : 'bg-blue-600');
  };

  const handleScroll = (e) => {
    const container = e.target;
    if (!container.dataset.scrolling) {
      container.dataset.scrolling = 'true';
      let lastTime = Date.now();
      const scroll = () => {
        const currentTime = Date.now();
        const deltaTime = currentTime - lastTime;
        lastTime = currentTime;
        const scrollSpeed = 0.07;
        const scrollAmount = scrollSpeed * deltaTime;
        container.scrollTop += scrollAmount;
        const singleListHeight = container.scrollHeight / 2;
        if (container.scrollTop >= singleListHeight) {
          container.scrollTop = 0;
        }
        if (container.dataset.scrolling === 'true') {
          requestAnimationFrame(scroll);
        }
      };
      requestAnimationFrame(scroll);
    }
  };

  const truncateName = (name, maxLength) => {
    if (name.length <= maxLength) return name;
    return name.substring(0, maxLength - 2) + '..';
  };

  /* =========================
     TEAM SECTION
  ========================== */
  const TeamRankingSection = ({ position }) => {
    if (teamLoading || !teamData) {
      return (
        <div className="w-full h-full flex items-center justify-center bg-black text-white text-2xl font-black">
          Loading Team Rankings...
        </div>
      );
    }

    return (
      <div className="w-full h-full flex flex-col bg-gray-900">
        {position && (
          <div className="bg-gray-800 text-white text-center font-black text-2xl flex-shrink-0 py-2">
            {position}
          </div>
        )}
        <div className="bg-black text-white text-center font-black text-2xl py-2">
          {teamData.category} TEAM CHAMPIONSHIP
        </div>
        <div className="flex-1 overflow-hidden flex flex-col min-h-0">
          <div className="bg-gray-900 flex-shrink-0">
            <div className="grid grid-cols-[80px_420px_140px] gap-8 px-2">
              <div className="px-1 py-2 text-center font-black text-white border-b-4 border-gray-600 text-2xl">
                RANK
              </div>
              <div className="px-2 py-2 text-left font-black text-white border-b-4 border-gray-600 text-2xl">
                TEAM NAME
              </div>
              <div className="px-1 py-2 text-center font-black text-white border-b-4 border-gray-600 text-2xl">
                SCORE
              </div>
            </div>
          </div>
          <div className="flex-shrink-0 sticky top-0 z-10">
            {teamData.result.slice(0, 3).map((team, index) => (
              <div
                key={index}
                className={`${getRankBgColor(team.team_rank)} text-white border-b-2 border-gray-800 grid grid-cols-[80px_420px_140px] gap-8 px-2`}
              >
                <div className="px-1 py-2 text-center font-black text-2xl flex items-center justify-center">
                  {team.team_rank}
                </div>
                <div className="px-2 py-2 font-black text-2xl flex items-center">
                  {team.team_name}
                </div>
                <div className="px-1 py-2 text-center font-black text-2xl flex items-center justify-center">
                  {team.score}
                </div>
              </div>
            ))}
          </div>
          <div
            className="flex-1 overflow-y-scroll box-border"
            style={{ scrollbarGutter: 'stable' }}
            ref={(el) => el && handleScroll({ target: el })}
          >
            {teamData.result.slice(3).map((team, index) => (
              <div
                key={`first-${index + 3}`}
                className={`${getRankBgColor(team.team_rank)} text-white hover:opacity-90 transition-opacity border-b-2 border-gray-800 grid grid-cols-[80px_420px_140px] gap-8 px-2`}
              >
                <div className="px-1 py-2 text-center font-black text-2xl flex items-center justify-center">
                  {team.team_rank}
                </div>
                <div className="px-2 py-2 font-black text-xl flex items-center">
                  {team.team_name}
                </div>
                <div className="px-1 py-2 text-center font-black text-2xl flex items-center justify-center">
                  {team.score}
                </div>
              </div>
            ))}
            {teamData.result.slice(3).map((team, index) => (
              <div
                key={`second-${index + 3}`}
                className={`${getRankBgColor(team.team_rank)} text-white hover:opacity-90 transition-opacity border-b-2 border-gray-800 grid grid-cols-[80px_420px_140px] gap-2 px-2`}
              >
                <div className="px-1 py-2 text-center font-black text-2xl flex items-center justify-center">
                  {team.team_rank}
                </div>
                <div className="px-2 py-2 font-black text-xl flex items-center">
                  {team.team_name}
                </div>
                <div className="px-1 py-2 text-center font-black text-xl flex items-center justify-center">
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
     INDIVIDUAL SECTION
  ========================== */
  const IndividualRankingSection = ({ position }) => {
    if (individualLoading || !individualData) {
      return (
        <div className="w-full h-full flex items-center justify-center bg-black text-white text-2xl font-black">
          Loading Individual Rankings...
        </div>
      );
    }

    return (
      <div className="w-full h-full flex flex-col bg-gray-900">
        {position && (
          <div className="bg-gray-800 text-white text-center font-black text-2xl flex-shrink-0 py-2">
            {position}
          </div>
        )}
        <div className="bg-black text-white text-center font-black text-2xl py-2">
          {individualData.category} ALL AROUND INDIVIDUAL
        </div>
        <div className="flex-1 overflow-hidden flex flex-col min-h-0">
          <div className="bg-gray-900 flex-shrink-0">
            <div className="grid grid-cols-[60px_minmax(140px,1fr)_80px_repeat(6,minmax(60px,1fr))] gap-2 px-2">
              <div className="px-1 py-2 text-center font-black text-white border-b-4 border-gray-600 text-xl">
                RNK
              </div>
              <div className="px-2 py-2 text-left font-black text-white border-b-4 border-gray-600 text-xl">
                NAME
              </div>

              {Object.keys(individualData.result[0].details).map((apparatus) => (
                <div key={apparatus} className="px-1 py-2 text-center font-black text-white border-b-4 border-gray-600 text-2xl">
                  {apparatusShortNames[apparatus]}
                </div>
              ))}
              <div className="px-1 py-2 text-center font-black text-white border-b-4 border-gray-600 text-xl">
                TOT
              </div>
            </div>
          </div>
          <div className="flex-shrink-0 sticky top-0 z-10">
            {individualData.result.slice(0, 3).map((player, index) => (
              <div
                key={index}
                className={`${getRankBgColor(player.final_rank)} text-white border-b-2 border-gray-800 py-2`}
              >
                <div className="grid grid-cols-[60px_minmax(140px,1fr)_80px_repeat(6,minmax(60px,1fr))] gap-2 px-2">
                  <div className="px-1 text-center font-black text-2xl flex items-center justify-center">
                    {player.final_rank}
                  </div>
                  <div className="px-2 flex flex-col justify-center overflow-hidden">
                    <div className={`font-black leading-tight ${player.player_name.length > 18 ? 'text-2xl' : 'text-xl'}`}>
                      <span className="truncate block">{truncateName(player.player_name, 20)}</span>
                    </div>
                    <div className="text-xs font-bold opacity-90 leading-tight">
                      {player.unit}
                    </div>
                  </div>
                  {Object.entries(player.details).map(([apparatus, score]) => (
                    <div key={apparatus} className="px-1 flex items-center justify-center">
                      <div className="text-2xl font-black">
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
            className="flex-1 overflow-auto"
            ref={(el) => el && handleScroll({ target: el })}
            style={{ scrollBehavior: 'auto' }}
          >
            {individualData.result.slice(3).map((player, index) => (
              <div
                key={`first-${index}`}
                className={`${getRankBgColor(player.final_rank)} text-white border-b-2 border-gray-800 py-2`}
              >
                <div className="grid grid-cols-[60px_minmax(140px,1fr)_80px_repeat(6,minmax(60px,1fr))] gap-2 px-2">
                  <div className="px-1 text-center font-black text-2xl flex items-center justify-center">
                    {player.final_rank}
                  </div>
                  <div className="px-2 flex flex-col justify-center overflow-hidden">
                    <div className={`font-black leading-tight ${player.player_name.length > 18 ? 'text-base' : 'text-2xl'}`}>
                      <span className="truncate block">{truncateName(player.player_name, 20)}</span>
                    </div>
                    <div className="text-xs font-bold opacity-90 leading-tight">
                      {player.unit}
                    </div>
                  </div>
                  <div className="px-1 text-center font-black text-xl flex items-center justify-center">
                    {player.score}
                  </div>
                  {Object.entries(player.details).map(([apparatus, score]) => (
                    <div key={apparatus} className="px-1 flex items-center justify-center">
                      <div className="text-2xl font-black">
                        {score}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            {individualData.result.slice(3).map((player, index) => (
              <div
                key={`second-${index}`}
                className={`${getRankBgColor(player.final_rank)} text-white border-b-2 border-gray-800 py-2`}
              >
                <div className="grid grid-cols-[60px_minmax(140px,1fr)_80px_repeat(6,minmax(60px,1fr))] gap-2 px-2">
                  <div className="px-1 text-center font-black text-2xl flex items-center justify-center">
                    {player.final_rank}
                  </div>
                  <div className="px-2 flex flex-col justify-center overflow-hidden">
                    <div className={`font-black leading-tight ${player.player_name.length > 18 ? 'text-base' : 'text-2xl'}`}>
                      <span className="truncate block">{truncateName(player.player_name, 20)}</span>
                    </div>
                    <div className="text-xs font-bold opacity-90 leading-tight">
                      {player.unit}
                    </div>
                  </div>
                  <div className="px-1 text-center font-black text-xl flex items-center justify-center">
                    {player.score}
                  </div>
                  {Object.entries(player.details).map(([apparatus, score]) => (
                    <div key={apparatus} className="px-1 flex items-center justify-center">
                      <div className="text-2xl font-black">
                        {score}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  /* =========================
     RENDER
  ========================== */
  return (
    <>
      <PremiumHeader />
      <div className="w-full h-screen grid grid-cols-2 grid-rows-2 gap-1 bg-black p-1">
        <IndividualRankingSection />
        <IndividualRankingSection />
        <TeamRankingSection />
        <TeamRankingSection />
      </div>
    </>
  );
};

export default CombinedRankingDisplay;

