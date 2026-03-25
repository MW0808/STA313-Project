import "./App.css";

import LandingPage from "./components/LandingPage";
import HistogramPage from "./components/HistogramPage";
import FirstScroll from "./components/FirstScroll";
import SecondScroll from "./components/SecondScroll";
import ThirdScroll from "./components/ThirdScroll";
import FourthScroll from "./components/FourthScroll";
import FifthScroll from "./components/FifthScroll";
import SixthScroll from "./components/SixthScroll";

function App() {
  return (
    <div className="app">
      <LandingPage />
      <HistogramPage />
      <FirstScroll />
      <SecondScroll />
      <ThirdScroll />
      <FourthScroll />
      <FifthScroll />
      <SixthScroll />
    </div>
  );
}

export default App;