import { useEffect, useState } from "react";
import Papa from "papaparse";
import HistogramTooltip from "./HistogramTooltip";


function parseNumber(value) {
  return Number(String(value).replace(/,/g, "").trim());
}

function formatOverviewLabel(label) {
  const map = {
    "European origins": "European",
    "Other North American origins": "Other N. American",
    "Asian origins": "Asian",
    "North American Aboriginal origins": "Aboriginal",
    "Caribbean origins": "Caribbean",
    "African origins": "African",
    "Latin, Central and South American origins": "Latin/South American",
    "Oceania origins": "Oceania",
  };

  return map[label] || label.replace(" origins", "");
}

function isTopLevelGroup(label) {
  const topLevelGroups = [
    "North American Aboriginal origins",
    "Other North American origins",
    "European origins",
    "Caribbean origins",
    "Latin, Central and South American origins",
    "African origins",
    "Asian origins",
    "Oceania origins",
  ];

  return topLevelGroups.includes(label?.trim());
}

function buildOverviewAndTooltipData(rows) {
  const cleanedRows = rows
    .filter((row) => row["Ethnic Origin"]?.trim())
    .map((row) => ({
      label: row["Ethnic Origin"].trim(),
      value2011: parseNumber(row["Ontario 2011"]),
      value2016: parseNumber(row["Ontario 2016"]),
    }));

  const topLevelRows = cleanedRows.filter((row) => isTopLevelGroup(row.label));

  const top6Groups = [...topLevelRows]
    .sort((a, b) => b.value2016 - a.value2016)
    .slice(0, 6);

  const top6Labels = top6Groups.map((row) => row.label);

  const overviewData = top6Groups.map((row) => ({
    ethnicGroup: formatOverviewLabel(row.label),
    total2011: row.value2011,
    total2016: row.value2016,
    originalLabel: row.label,
  }));

  const tooltipDataMap = {};

  for (let i = 0; i < top6Labels.length; i++) {
    const currentLabel = top6Labels[i];
    const currentIndex = cleanedRows.findIndex((row) => row.label === currentLabel);

    const nextTopLevelIndex = cleanedRows.findIndex(
      (row, idx) => idx > currentIndex && isTopLevelGroup(row.label)
    );

    const sectionRows =
      nextTopLevelIndex === -1
        ? cleanedRows.slice(currentIndex + 1)
        : cleanedRows.slice(currentIndex + 1, nextTopLevelIndex);

    const top5Subgroups = sectionRows
      .filter((row) => !row.label.toLowerCase().includes("origins"))
      .sort((a, b) => b.value2016 - a.value2016)
      .slice(0, 5)
      .map((row) => ({
        label: row.label,
        value2011: row.value2011,
        value2016: row.value2016,
      }));

    tooltipDataMap[formatOverviewLabel(currentLabel)] = top5Subgroups;
  }

  return { overviewData, tooltipDataMap };
}


function Histogram() {
  const [overviewData, setOverviewData] = useState([]);
  const [tooltipDataMap, setTooltipDataMap] = useState({});
  const [hoveredGroup, setHoveredGroup] = useState(null);

  useEffect(() => {
    Papa.parse("/diversity-dataset.csv", {
      download: true,
      header: true,
      complete: (results) => {
        const { overviewData, tooltipDataMap } =
          buildOverviewAndTooltipData(results.data);
  
        setOverviewData(overviewData);
        setTooltipDataMap(tooltipDataMap);
      },
    });
  }, []);

  if (overviewData.length === 0) {
    return <div className="histogram-loading">Loading census data...</div>;
  }

  const maxValue = Math.max(
    ...overviewData.flatMap((item) => [item.total2011, item.total2016])
  );

  return (
    <div className="histogram-overlay-container">
      <div className="histogram-layout">
        <div className="histogram-header-row">
          <h2>2011 Census</h2>
          <h2>2016 Census</h2>
        </div>

        <div className="histogram-rows">
          {overviewData.map((item) => {
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