import React, { useMemo } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import PremiumHeader from './PremiumHeader';
import TeamRanking from './Teamranking';
import IndividualRanking from './Individualranking';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
  },
});

const CombinedRankingDisplay = () => {
  // ============= URL PARAMS HOOK =============
  const useDisplayConfig = () => {
    return useMemo(() => {
      const params = new URLSearchParams(window.location.search);

      // Get display count (default: 1)
      const displayCount = parseInt(params.get('displays')) || 1;

      // Parse display configurations
      const displays = [];
      for (let i = 1; i <= displayCount; i++) {
        const type = params.get(`d${i}_type`) || 'individual';
        const apiId = params.get(`d${i}_api`) || '67952737';
        const title = params.get(`d${i}_title`) || '';

        displays.push({
          id: i,
          type: type.toLowerCase(),
          apiId,
          title
        });
      }

      // Get main header title
      const mainHeader = params.get('header') || 'GYMNASTICS CHAMPIONSHIP';

      return { displays, mainHeader, displayCount };
    }, []);
  };

  const { displays, mainHeader, displayCount } = useDisplayConfig();

  // Render displays based on count
  const renderDisplays = () => {
    if (displayCount === 3) {
      // Special layout: 2 on top, 1 full-width on bottom
      return (
        <div className="w-full flex flex-col gap-0 bg-black p-0" style={{ height: 'calc(100vh - 60px)' }}>
          {/* Top row: 2 displays side by side - 50% height */}
          <div className="grid grid-cols-2 gap-0" style={{ height: '50%' }}>
            {displays.slice(0, 2).map((display) => (
              display.type === 'team' ? (
                <TeamRanking
                  key={display.id}
                  apiId={display.apiId}
                  headerTitle={display.title}
                />
              ) : (
                <IndividualRanking
                  key={display.id}
                  apiId={display.apiId}
                  headerTitle={display.title}
                  displayCount={displayCount}
                />
              )
            ))}
          </div>
          {/* Bottom row: 1 full-width display - 50% height */}
          <div style={{ height: '50%' }}>
            {displays[2] && (
              displays[2].type === 'team' ? (
                <TeamRanking
                  key={displays[2].id}
                  apiId={displays[2].apiId}
                  headerTitle={displays[2].title}
                />
              ) : (
                <IndividualRanking
                  key={displays[2].id}
                  apiId={displays[2].apiId}
                  headerTitle={displays[2].title}
                  displayCount={displayCount}
                />
              )
            )}
          </div>
        </div>
      );
    }

    // Standard grid layouts for other counts
    const getGridClass = () => {
      switch (displayCount) {
        case 1:
          return 'grid-cols-1 grid-rows-1';
        case 2:
          return 'grid-cols-2 grid-rows-1';
        case 4:
          return 'grid-cols-2 grid-rows-2';
        case 6:
          return 'grid-cols-3 grid-rows-2';
        default:
          return 'grid-cols-2 grid-rows-2';
      }
    };

    return (
      <div className={`w-full grid ${getGridClass()} gap-0 bg-black p-0`} style={{ height: 'calc(100vh - 60px)' }}>
        {displays.map((display) => (
          display.type === 'team' ? (
            <TeamRanking
              key={display.id}
              apiId={display.apiId}
              headerTitle={display.title}
            />
          ) : (
            <IndividualRanking
              key={display.id}
              apiId={display.apiId}
              headerTitle={display.title}
              displayCount={displayCount}
            />
          )
        ))}
      </div>
    );
  };

  return (
    <QueryClientProvider client={queryClient}>
      <div className="w-full h-screen overflow-hidden bg-black">
        <PremiumHeader title={mainHeader} />
        {renderDisplays()}
      </div>
    </QueryClientProvider>
  );
};

export default CombinedRankingDisplay;