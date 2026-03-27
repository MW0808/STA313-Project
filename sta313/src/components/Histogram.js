import { useState } from "react";
import HistogramTooltip from "./HistogramTooltip";


// Dummy date for census view
const combinedData = [
  { ethnicGroup: "European", total2011: 8231410, total2016: 7900000 },
  { ethnicGroup: "Asian", total2011: 1452000, total2016: 1780000 },
  { ethnicGroup: "Aboriginal", total2011: 210000, total2016: 250000 },
  { ethnicGroup: "African", total2011: 180000, total2016: 230000 },
  { ethnicGroup: "Caribbean", total2011: 160000, total2016: 175000 },
  { ethnicGroup: "Latin/South American", total2011: 120000, total2016: 150000 }
];

// Dummy data for tooltip for census view
const tooltipDataMap = {
  Asian: [
    { label: "Chinese", value2011: 520000, value2016: 610000 },
    { label: "East Indian", value2011: 480000, value2016: 590000 },
    { label: "Filipino", value2011: 210000, value2016: 300000 },
    { label: "etc.", value2011: 260000, value2016: 340000 },
  ],
  European: [
    { label: "English", value2011: 1100000, value2016: 1000000 },
    { label: "Italian", value2011: 800000, value2016: 760000 },
    { label: "French", value2011: 700000, value2016: 690000 },
    { label: "etc.", value2011: 5631410, value2016: 5450000 },
  ],
  "Other N. American": [
    { label: "Canadian", value2011: 400000, value2016: 420000 },
    { label: "American", value2011: 220000, value2016: 240000 },
    { label: "Métis-linked", value2011: 100000, value2016: 120000 },
    { label: "etc.", value2011: 260000, value2016: 230000 },
  ],
};


function Histogram() {
  const [hoveredGroup, setHoveredGroup] = useState(null);

  const maxValue = Math.max(
    ...combinedData.flatMap((item) => [item.total2011, item.total2016])
  );

  return (
    <div className="histogram-overlay-container">
      <div className="histogram-layout">
        <div className="histogram-header-row">
          <h2>2011 Census</h2>
          <h2>2016 Census</h2>
        </div>

        <div className="histogram-rows">
          {combinedData.map((item) => {
            const width2011 = (item.total2011 / maxValue) * 100;
            const width2016 = (item.total2016 / maxValue) * 100;
            const hasTooltip = !!tooltipDataMap[item.ethnicGroup];

            return (
              <div className="histogram-row" key={item.ethnicGroup}>
                <div className="bar-side left-side">
                  <div
                    className="bar bar-2011"
                    style={{ width: `${Math.max(width2011, 1)}%` }}
                  />
                </div>

                <div
                  className={`category-label ${
                    hoveredGroup === item.ethnicGroup ? "category-label-active" : ""
                  } ${hasTooltip ? "category-label-hoverable" : ""}`}
                  onMouseEnter={() => {
                    if (hasTooltip) setHoveredGroup(item.ethnicGroup);
                  }}
                  onMouseLeave={() => {
                    if (hasTooltip) setHoveredGroup(null);
                  }}
                >
                  {item.ethnicGroup}
                </div>

                <div className="bar-side right-side">
                  <div
                    className="bar bar-2016"
                    style={{ width: `${Math.max(width2016, 1)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {hoveredGroup && (
        <div className="histogram-tooltip-overlay">
          <HistogramTooltip
            title={hoveredGroup}
            data={tooltipDataMap[hoveredGroup]}
          />
        </div>
      )}
    </div>
  );
}

export default Histogram;