import React, { useRef, useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';

const IndividualRanking = ({ apiId, headerTitle, displayCount = 1 }) => {
    const scrollRef = useRef(null);
    const animationRef = useRef(null);

    // Control panel state
    const [showControls, setShowControls] = useState(false);
    const [scrollSpeed, setScrollSpeed] = useState(0.5);
    const [pauseDuration, setPauseDuration] = useState(2000);
    const [isScrollPaused, setIsScrollPaused] = useState(false);
    const API_BASE = import.meta.env.VITE_API_BASE_URL;

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

    const rankColWidth = displayCount === 1 ? '90px' : '70px';
    const apparatusColWidth = displayCount === 1 ? '90px' : '70px';
    const totalColWidth = displayCount === 1 ? '100px' : '85px';

    const gridStyle = {
        display: 'grid',
        gridTemplateColumns: `${rankColWidth} minmax(140px, 1fr) repeat(6, ${apparatusColWidth}) ${totalColWidth}`,
        gap: '3px'
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
    const fetchIndividualData = async () => {
        const res = await fetch(`${API_BASE}/igss/api/${apiId}/result`);
        const data = await res.json();
        const json = safeJson(data);

        if (!json || !json.result) {
            throw new Error("Invalid API response structure");
        }

        let resultArray = Array.isArray(json.result)
            ? json.result
            : Object.values(json.result);

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

        return {
            game_name: json.game_name,
            event_name: json.event_name,
            category: json.category,
            result: formatted
        };
    };

    // ============= TANSTACK QUERY WITH POLLING =============
    const { data: individualData, isLoading, error } = useQuery({
        queryKey: ['individualRanking', apiId],
        queryFn: fetchIndividualData,
        refetchInterval: 5000,
        staleTime: 2000,
        refetchOnWindowFocus: true,
    });

    // ============= SMOOTH SCROLL EFFECT =============
    useEffect(() => {
        if (!individualData || individualData.result.length <= 3 || !scrollRef.current || isScrollPaused) {
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
    }, [individualData, scrollSpeed, pauseDuration, isScrollPaused]);

    if (isLoading || !individualData || !individualData.result || individualData.result.length === 0) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-black text-white text-2xl font-black">
                Loading Individual Rankings...
            </div>
        );
    }

    if (error) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-black text-xl font-black text-red-500">
                Error loading individual rankings
            </div>
        );
    }

    const topThree = individualData.result.slice(0, 3);
    const scrollableItems = individualData.result.slice(3);

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
                {headerTitle || `${individualData.category} ALL AROUND INDIVIDUAL`}
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-hidden flex flex-col min-h-0">
                {/* Column Headers */}
                <div className="bg-gray-900 flex-shrink-0 py-[6px]">
                    <div style={gridStyle} className="px-1">
                        <div className="px-1 py-1 text-center font-black text-white text-xl overflow-hidden">
                            RANK
                        </div>
                        <div className="px-2 py-1 text-left font-black text-white text-xl overflow-hidden">
                            NAME
                        </div>
                        {Object.keys(individualData.result[0].details).map((apparatus) => (
                            <div key={apparatus} className="px-1 py-1 text-center font-black text-white text-xl overflow-hidden">
                                {apparatusShortNames[apparatus]}
                            </div>
                        ))}
                        <div className="px-1 py-1 text-center font-black text-white text-xl overflow-hidden">
                            TOT
                        </div>
                    </div>
                </div>

                {/* Top 3 (Fixed) */}
                <div className="flex-shrink-0">
                    {topThree.map((player, index) => (
                        <div
                            key={`top-${index}`}
                            className={`${getRankBgColor(player.final_rank)} border-b-2 border-gray-800 py-2`}
                        >
                            <div style={gridStyle} className="px-1">
                                <div className="px-1 text-center font-black text-4xl flex items-center justify-center overflow-hidden">
                                    {player.final_rank}
                                </div>
                                <div className="px-2 flex flex-col justify-center overflow-hidden min-w-0">
                                    <div className="font-black leading-tight text-[22px] truncate">
                                        {truncateName(player.player_name, 20)}
                                    </div>
                                    <div className="text-base font-black opacity-90 leading-tight truncate">
                                        {player.unit}
                                    </div>
                                </div>
                                {Object.entries(player.details).map(([apparatus, score]) => (
                                    <div key={apparatus} className="px-1 flex items-center justify-center overflow-hidden">
                                        <div className="text-2xl font-black">
                                            {score}
                                        </div>
                                    </div>
                                ))}
                                <div className="px-1 text-center font-black text-3xl flex items-center justify-center overflow-hidden">
                                    {player.score}
                                </div>
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
                        {scrollableItems.concat(scrollableItems).map((player, index) => (
                            <div
                                key={`scroll-${index}`}
                                className={`${getRankBgColor(player.final_rank)} text-white border-b-2 border-gray-800 py-2`}
                            >
                                <div style={gridStyle} className="px-1">
                                    <div className="px-1 text-center font-black text-3xl flex items-center justify-center overflow-hidden">
                                        {player.final_rank}
                                    </div>
                                    <div className="px-2 flex flex-col justify-center overflow-hidden min-w-0">
                                        <div className="font-black leading-tight text-lg truncate">
                                            {truncateName(player.player_name, 20)}
                                        </div>
                                        <div className="text-sm font-black opacity-90 leading-tight truncate">
                                            {player.unit}
                                        </div>
                                    </div>
                                    {Object.entries(player.details).map(([apparatus, score]) => (
                                        <div key={apparatus} className="px-1 flex items-center justify-center overflow-hidden">
                                            <div className="text-xl font-black">
                                                {score}
                                            </div>
                                        </div>
                                    ))}
                                    <div className="px-1 text-center font-black text-2xl flex items-center justify-center overflow-hidden">
                                        {player.score}
                                    </div>
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

export default IndividualRanking;