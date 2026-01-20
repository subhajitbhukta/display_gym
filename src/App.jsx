import { Routes, Route } from "react-router-dom";
import CombinedRankingDisplay from "./CombinedRankingDisplay";

function App() {
  return (
    <Routes>
      <Route
        path="/display"
        element={<CombinedRankingDisplay />}
      />
    </Routes>
  );
}

export default App;
