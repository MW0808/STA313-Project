import "./App.css";
import LandingPage from "./components/LandingPage";
import HistogramPage from "./components/HistogramPage";
import FirstScroll from "./components/FirstScroll";
import SecondScroll from "./components/SecondScroll";
import ThirdScroll from "./components/ThirdScroll";
import FifthScroll from "./components/FifthScroll";

function App() {
  return (
    <div className="app">
      <LandingPage />
      <HistogramPage />
      <FirstScroll />
      <SecondScroll />
      <ThirdScroll/>
      <FifthScroll />
    </div>
  );
}

export default App;