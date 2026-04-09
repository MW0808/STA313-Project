import { useState } from "react";
import ToggleSwitch from "./ToggleSwitch";
import Histogram from "./Histogram";
import DetailedHistogram from "./DetailedHistogram.js";
import "./HistogramPage.css";

function HistogramPage() {
  const [isDetailed, setIsDetailed] = useState(false);

  return (
    <section className="panel">
      <div className="histogram-page">
        <h1 className="histogram-title">
          Ontario&apos;s Ethnic Diversity: <br /> Population Breakdown (2011 vs. 2016)
        </h1>

        <ToggleSwitch
          isDetailed={isDetailed}
          onToggle={() => setIsDetailed((prev) => !prev)}
        />

        {isDetailed ? <DetailedHistogram /> : <Histogram />}
      </div>
    </section>
  );
}

export default HistogramPage;