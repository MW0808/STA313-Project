import { useState } from "react";
import ToggleSwitch from "./ToggleSwitch";
import "./HistogramPage.css";

function HistogramPage() {
  const [isDetailed, setIsDetailed] = useState(false);

  return (
    <section className="panel">
      <div className="histogram-page">
        <h2 className="histogram-title">
          Ontario's Ethnic Diversity: Population Breakdown (2011 vs. 2016)
        </h2>

        <ToggleSwitch
          isDetailed={isDetailed}
          onToggle={() => setIsDetailed((prev) => !prev)}
        />

        <div className="histogram-box">
          {isDetailed ? "Detailed Breakdown View" : "Census Overview View"}
        </div>
      </div>
    </section>
  );
}

export default HistogramPage;