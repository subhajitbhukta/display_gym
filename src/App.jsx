import React, { useState, useEffect } from 'react';
import PremiumHeader from './PremiumHeader';
import axios from "axios";

const CombinedRankingDisplay = () => {

  /* =========================
     TEAM DATA (DUMMY)
  ========================== */
  const [teamData] = useState({
    game_name: "69th National School Games 2026",
    event_name: "TEAM CHAMPIONSHIP",
    category: "BOYS",
    report_name: "TEAM RANKING",
    result: [
      { team_name: "CBSE", score: "270.55", team_rank: "1" },
      { team_name: "MAHARASHTRA", score: "240.05", team_rank: "2" },
      { team_name: "HARYANA", score: "221.60", team_rank: "3" },
      { team_name: "C.B.S.E. WELFARE SPORTS ORGANISATION", score: "191.60", team_rank: "4" },
      { team_name: "COUNCIL FOR THE INDIAN SCHOOL CERTIFICATE EXAMINATIONS", score: "191.15", team_rank: "5" },
      { team_name: "UTTAR PRADESH", score: "184.35", team_rank: "6" },
      { team_name: "PUNJAB", score: "181.15", team_rank: "7" },
      { team_name: "GUJARAT", score: "180.20", team_rank: "8" },
      { team_name: "DELHI", score: "163.00", team_rank: "9" },
      { team_name: "WEST BENGAL", score: "157.20", team_rank: "10" },
      { team_name: "KARNATAKA", score: "143.37", team_rank: "11" },
      { team_name: "MADHYA PRADESH", score: "140.80", team_rank: "12" },
      { team_name: "ANDHRA PRADESH", score: "112.60", team_rank: "13" },
      { team_name: "MANIPUR", score: "111.75", team_rank: "14" },
      { team_name: "ASSAM", score: "107.20", team_rank: "15" },
    ]
  });

  /* =========================
     INDIVIDUAL DATA (API)
  ========================== */
  const [individualData, setIndividualData] = useState(null);
  const [loading, setLoading] = useState(true);

  // useEffect(() => {
  //   const fetchIndividualData = async () => {
  //     try {
  //       const res = await fetch("https://finaltsr.com/igss/api/67952737/result");
  //       const json = await res.json();

  //       const formatted = json.data.result.map(player => ({
  //         player_name: player.player_name,
  //         unit: player.unit,
  //         score: player.total_score,
  //         final_rank: player.rank,
  //         details: {
  //           "FLOOR EXERCISE": player.fx,
  //           "POMMEL HORSE": player.ph,
  //           "RINGS": player.sr,
  //           "Vault": player.vt,
  //           "PARALLEL BARS": player.pb,
  //           "HORIZONTAL BAR": player.hb,
  //         }
  //       }));

  //       setIndividualData({
  //         game_name: json.data.game_name,
  //         event_name: json.data.event_name,
  //         category: json.data.category,
  //         report_name: "ALL AROUND INDIVIDUAL RANKING",
  //         result: formatted
  //       });

  //     } catch (error) {
  //       console.error("API Error:", error);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchIndividualData();
  // }, []);

useEffect(() => {
  const fetchIndividualData = async () => {
    try {
      const res = await axios.get(
        "https://https://finaltsr.com/igss/api/67952737/result"
      );

      const json = res.data;

      const formatted = json.data.result.map(player => ({
        player_name: player.player_name,
        unit: player.unit,
        score: player.total_score,
        final_rank: player.rank,
        details: {
          "FLOOR EXERCISE": player.fx,
          "POMMEL HORSE": player.ph,
          "RINGS": player.sr,
          "Vault": player.vt,
          "PARALLEL BARS": player.pb,
          "HORIZONTAL BAR": player.hb,
        }
      }));

      setIndividualData({
        game_name: json.data.game_name,
        event_name: json.data.event_name,
        category: json.data.category,
        report_name: "ALL AROUND INDIVIDUAL RANKING",
        result: formatted
      });

    } catch (err) {
      console.error("API Error:", err);
    } finally {
      setLoading(false);
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
    const r = parseInt(rank);
    if (r === 1) return 'bg-yellow-600';
    if (r === 2) return 'bg-gray-400';
    if (r === 3) return 'bg-orange-600';
    return r % 2 === 0 ? 'bg-blue-500' : 'bg-blue-600';
  };

  const truncateName = (name, max) =>
    name.length <= max ? name : name.substring(0, max - 2) + '..';

  const handleScroll = (e) => {
    const el = e.target;
    if (el.dataset.scrolling) return;
    el.dataset.scrolling = 'true';

    let last = Date.now();
    const animate = () => {
      const now = Date.now();
      el.scrollTop += (now - last) * 0.07;
      last = now;

      if (el.scrollTop >= el.scrollHeight / 2) el.scrollTop = 0;
      requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  };

  /* =========================
     TEAM SECTION
  ========================== */
  const TeamRankingSection = () => (
    <div className="w-full h-full flex flex-col bg-gray-900">
      <div className="bg-black text-white text-center font-black text-2xl py-2">
        14 MAG TEAM PROVISIONAL (SGFI)
      </div>

      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="grid grid-cols-[80px_420px_140px] gap-8 px-2 bg-gray-900">
          {["RANK", "TEAM NAME", "SCORE"].map(h => (
            <div key={h} className="text-white text-2xl font-black border-b-4 border-gray-600 py-2">
              {h}
            </div>
          ))}
        </div>

        {teamData.result.slice(0,3).map((t,i)=>(
          <div key={i} className={`${getRankBgColor(t.team_rank)} grid grid-cols-[80px_420px_140px] gap-8 px-2 text-white`}>
            <div className="text-2xl font-black text-center">{t.team_rank}</div>
            <div className="text-2xl font-black">{t.team_name}</div>
            <div className="text-2xl font-black text-center">{t.score}</div>
          </div>
        ))}

        <div className="flex-1 overflow-y-scroll" ref={el=>el&&handleScroll({target:el})}>
          {[...teamData.result.slice(3), ...teamData.result.slice(3)].map((t,i)=>(
            <div key={i} className={`${getRankBgColor(t.team_rank)} grid grid-cols-[80px_420px_140px] gap-8 px-2 text-white`}>
              <div className="text-xl font-black text-center">{t.team_rank}</div>
              <div className="text-xl font-black">{t.team_name}</div>
              <div className="text-xl font-black text-center">{t.score}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  /* =========================
     INDIVIDUAL SECTION
  ========================== */
  const IndividualRankingSection = () => {
    if (loading || !individualData) {
      return (
        <div className="w-full h-full flex items-center justify-center bg-black text-white text-2xl font-black">
          Loading Individual Rankings...
        </div>
      );
    }

    return (
      <div className="w-full h-full flex flex-col bg-gray-900">
        <div className="bg-black text-white text-center font-black text-2xl py-2">
          14 WAG AAI PROVISIONAL (SGFI)
        </div>

        <div className="grid grid-cols-[60px_1fr_80px_repeat(6,60px)] px-2">
          <div>RNK</div><div>NAME</div><div>TOT</div>
          {Object.keys(individualData.result[0].details).map(a=>(
            <div key={a}>{apparatusShortNames[a]}</div>
          ))}
        </div>

        {[...individualData.result.slice(0,3)].map((p,i)=>(
          <div key={i} className={`${getRankBgColor(p.final_rank)} grid grid-cols-[60px_1fr_80px_repeat(6,60px)] px-2 text-white`}>
            <div>{p.final_rank}</div>
            <div>
              <div>{truncateName(p.player_name,20)}</div>
              <div className="text-xs">{p.unit}</div>
            </div>
            <div>{p.score}</div>
            {Object.values(p.details).map((s,i)=><div key={i}>{s}</div>)}
          </div>
        ))}

        <div className="flex-1 overflow-auto" ref={el=>el&&handleScroll({target:el})}>
          {[...individualData.result.slice(3), ...individualData.result.slice(3)].map((p,i)=>(
            <div key={i} className={`${getRankBgColor(p.final_rank)} grid grid-cols-[60px_1fr_80px_repeat(6,60px)] px-2 text-white`}>
              <div>{p.final_rank}</div>
              <div>
                <div>{truncateName(p.player_name,20)}</div>
                <div className="text-xs">{p.unit}</div>
              </div>
              <div>{p.score}</div>
              {Object.values(p.details).map((s,i)=><div key={i}>{s}</div>)}
            </div>
          ))}
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
