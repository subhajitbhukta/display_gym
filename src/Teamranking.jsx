import React, { useRef, useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';

const TeamRanking = ({ apiId, headerTitle }) => {
    const scrollRef = useRef(null);
    const animationRef = useRef(null);
    const API_BASE = import.meta.env.VITE_API_BASE_URL;
    // Control panel state
    const [showControls, setShowControls] = useState(false);
    const [scrollSpeed, setScrollSpeed] = useState(0.5);
    const [pauseDuration, setPauseDuration] = useState(2000);
    const [isScrollPaused, setIsScrollPaused] = useState(false);

    // ============= UTILITY FUNCTIONS =============
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

    const getRankBgColor = (rank) => {
        const r = Number(rank);
        if (r === 1) return "bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 text-black";
        if (r === 2) return "bg-gradient-to-r from-gray-300 via-gray-400 to-gray-500 text-black";
        if (r === 3) return "bg-gradient-to-r from-orange-700 via-orange-800 to-orange-900 text-white";
        return r % 2 === 0 ? "bg-blue-500 text-white" : "bg-blue-600 text-white";
    };

    const truncateName = (name, maxLength) => {
        if (!name) return '';
        if (name.length <= maxLength) return name;
        return name.substring(0, maxLength - 2) + '..';
    };

    // ============= KEYBOARD SHORTCUT (Alt+L) =============
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.altKey && e.key.toLowerCase() === 'l') {
                e.preventDefault();
                setShowControls(prev => !prev);
            }
            if (e.key === 'Escape') {
                setShowControls(false);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // ============= FETCH FUNCTION =============
    const fetchTeamData = async () => {
        const res = await fetch(`${API_BASE}/igss/api/${apiId}/result`);
        const data = await res.json();
        const json = safeJson(data);

        if (!json || !json.result) {
            throw new Error("Invalid team API response structure");
        }

        let resultArray = Array.isArray(json.result)
            ? json.result
            : Object.values(json.result);

        const formatted = resultArray.map((team, index) => ({
            team_name: team.team_name ?? "",
            score: formatScore(team.score),
            team_rank: Number(team.team_rank ?? team.rank ?? index + 1),
        }));

        return {
            game_name: json.game_name,
            event_name: json.event_name,
            category: json.category,
            result: formatted
        };
    };

    // ============= TANSTACK QUERY WITH POLLING =============
    const { data: teamData, isLoading, error } = useQuery({
        queryKey: ['teamRanking', apiId],
        queryFn: fetchTeamData,
        refetchInterval: 5000,
        staleTime: 2000,
        refetchOnWindowFocus: true,
    });

    // ============= SMOOTH SCROLL EFFECT =============
    useEffect(() => {
        if (!teamData || teamData.result.length <= 3 || !scrollRef.current || isScrollPaused) {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
            return;
        }

        const container = scrollRef.current;
        let isPaused = true;
        let pauseEndTime = performance.now() + pauseDuration;

        const animate = () => {
            const now = performance.now();

            if (isPaused) {
                if (now >= pauseEndTime) {
                    isPaused = false;
                } else {
                    animationRef.current = requestAnimationFrame(animate);
                    return;
                }
            }

            container.scrollTop += scrollSpeed;
            const singleContentHeight = container.scrollHeight / 2;

            if (container.scrollTop >= singleContentHeight) {
                container.scrollTop = 0;
                isPaused = true;
                pauseEndTime = now + pauseDuration;
            }

            animationRef.current = requestAnimationFrame(animate);
        };

        animationRef.current = requestAnimationFrame(animate);

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [teamData, scrollSpeed, pauseDuration, isScrollPaused]);

    if (isLoading || !teamData) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-black text-2xl font-black text-white">
                Loading Team Rankings...
            </div>
        );
    }

    if (error) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-black text-xl font-black text-red-500">
                Error loading team rankings
            </div>
        );
    }

    const topThree = teamData.result.slice(0, 3);
    const scrollableItems = teamData.result.slice(3);

    return (
        <div className="w-full h-full flex flex-col bg-gray-900 overflow-hidden relative">
            {/* Control Panel Popup */}
            {showControls && (
                <div className="absolute inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center">
                    <div className="bg-gray-800 rounded-lg p-6 w-96 shadow-2xl border-2 border-blue-500">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-white text-2xl font-black">SCROLL CONTROLS</h3>
                            <button
                                onClick={() => setShowControls(false)}
                                className="text-white hover:text-red-500 text-2xl font-bold"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Scroll Pause Toggle */}
                        <div className="mb-6">
                            <div className="flex justify-between items-center mb-2">
                                <label className="text-white font-bold text-lg">Scroll Status</label>
                                <button
                                    onClick={() => setIsScrollPaused(!isScrollPaused)}
                                    className={`px-6 py-2 rounded font-black text-lg ${isScrollPaused
                                            ? 'bg-red-500 hover:bg-red-600 text-white'
                                            : 'bg-green-500 hover:bg-green-600 text-white'
                                        }`}
                                >
                                    {isScrollPaused ? '⏸ PAUSED' : '▶ RUNNING'}
                                </button>
                            </div>
                        </div>

                        {/* Scroll Speed */}
                        <div className="mb-6">
                            <div className="flex justify-between items-center mb-2">
                                <label className="text-white font-bold">Scroll Speed</label>
                                <span className="text-yellow-400 font-bold">{scrollSpeed.toFixed(2)}x</span>
                            </div>
                            <input
                                type="range"
                                min="0.1"
                                max="3"
                                step="0.1"
                                value={scrollSpeed}
                                onChange={(e) => setScrollSpeed(parseFloat(e.target.value))}
                                className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                            />
                            <div className="flex justify-between text-xs text-gray-400 mt-1">
                                <span>Slow</span>
                                <span>Fast</span>
                            </div>
                        </div>

                        {/* Pause Duration */}
                        <div className="mb-6">
                            <div className="flex justify-between items-center mb-2">
                                <label className="text-white font-bold">Pause Duration</label>
                                <span className="text-yellow-400 font-bold">{pauseDuration / 1000}s</span>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="10000"
                                step="500"
                                value={pauseDuration}
                                onChange={(e) => setPauseDuration(parseInt(e.target.value))}
                                className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                            />
                            <div className="flex justify-between text-xs text-gray-400 mt-1">
                                <span>0s</span>
                                <span>10s</span>
                            </div>
                        </div>

                        {/* Quick Presets */}
                        <div className="mb-4">
                            <label className="text-white font-bold mb-2 block">Quick Presets</label>
                            <div className="grid grid-cols-3 gap-2">
                                <button
                                    onClick={() => { setScrollSpeed(0.3); setPauseDuration(3000); }}
                                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-3 rounded text-sm"
                                >
                                    Slow
                                </button>
                                <button
                                    onClick={() => { setScrollSpeed(0.5); setPauseDuration(2000); }}
                                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-3 rounded text-sm"
                                >
                                    Normal
                                </button>
                                <button
                                    onClick={() => { setScrollSpeed(1.0); setPauseDuration(1000); }}
                                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-3 rounded text-sm"
                                >
                                    Fast
                                </button>
                            </div>
                        </div>

                        <div className="text-center text-gray-400 text-sm mt-4">
                            Press <kbd className="bg-gray-700 px-2 py-1 rounded">Alt + L</kbd> to toggle controls
                        </div>
                    </div>
                </div>
            )}

            {/* Header Title */}
            <div className="bg-black text-white text-center font-black text-3xl py-1 flex-shrink-0">
                {headerTitle || `${teamData.category} TEAM CHAMPIONSHIP`}
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-hidden flex flex-col min-h-0">
                {/* Column Headers */}
                <div className="bg-gray-900 flex-shrink-0">
                    <div className="grid grid-cols-[100px_1fr_140px] gap-1 px-2">
                        <div className="px-2 py-2 text-center font-black text-white text-2xl overflow-hidden">
                            RANK
                        </div>
                        <div className="px-3 py-2 text-left font-black text-white text-2xl overflow-hidden">
                            TEAM NAME
                        </div>
                        <div className="px-2 py-2 text-center font-black text-white text-2xl overflow-hidden">
                            SCORE
                        </div>
                    </div>
                </div>

                {/* Top 3 (Fixed) */}
                <div className="flex-shrink-0">
                    {topThree.map((team, index) => (
                        <div
                            key={`top-${index}`}
                            className={`${getRankBgColor(team.team_rank)} border-b-2 border-gray-800 grid grid-cols-[100px_1fr_140px] gap-1 px-2`}
                        >
                            <div className="px-2 py-3 text-center font-black text-4xl flex items-center justify-center overflow-hidden">
                                {team.team_rank}
                            </div>
                            <div className="px-3 py-3 font-black text-3xl flex items-center overflow-hidden">
                                <span className="truncate">{truncateName(team.team_name, 30)}</span>
                            </div>
                            <div className="px-2 py-3 text-center font-black text-4xl flex items-center justify-center overflow-hidden">
                                {team.score}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Scrollable Items */}
                {scrollableItems.length > 0 && (
                    <div
                        ref={scrollRef}
                        className="flex-1 overflow-hidden"
                        style={{
                            scrollbarWidth: 'none',
                            msOverflowStyle: 'none',
                            WebkitOverflowScrolling: 'touch'
                        }}
                    >
                        <style jsx>{`
              div::-webkit-scrollbar {
                display: none;
              }
            `}</style>
                        {scrollableItems.concat(scrollableItems).map((team, index) => (
                            <div
                                key={`scroll-${index}`}
                                className={`${getRankBgColor(team.team_rank)} text-white border-b-2 border-gray-800 grid grid-cols-[100px_1fr_140px] gap-1 px-2`}
                            >
                                <div className="px-2 py-3 text-center font-black text-3xl flex items-center justify-center overflow-hidden">
                                    {team.team_rank}
                                </div>
                                <div className="px-3 py-3 font-black text-2xl flex items-center overflow-hidden">
                                    <span className="truncate">{truncateName(team.team_name, 30)}</span>
                                </div>
                                <div className="px-2 py-3 text-center font-black text-3xl flex items-center justify-center overflow-hidden">
                                    {team.score}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Floating hint when controls are hidden */}
            {/* {!showControls && (
        <div className="absolute bottom-4 right-4 bg-gray-800 bg-opacity-80 text-white px-3 py-2 rounded text-xs">
          Press <kbd className="bg-gray-700 px-1 rounded">Alt+L</kbd> for controls
        </div>
      )} */}
        </div>
    );
};

export default TeamRanking;