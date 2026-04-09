import { useEffect, useState } from "react";
import Papa from "papaparse";

function parseNumber(value) {
  return Number(String(value).replace(/,/g, "").trim());
}

function formatMillions(value) {
  if (value >= 1000000) return (value / 1000000).toFixed(1) + "M";
  if (value >= 1000) return (value / 1000).toFixed(0) + "K";
  return value.toString();
}

const detailedGroupConfig = [
  {
    csvLabel: "British Isles origins",
    displayLabel: "British Isles origins",
  },
  {
    csvLabel: "Southern European origins",
    displayLabel: "Southern European\norigins",
  },
  {
    csvLabel: "Eastern European origins",
    displayLabel: "Eastern European\norigins",
  },
  {
    csvLabel: "Western European origins (except French origins)",
    displayLabel: "Western European\norigins",
  },
  {
    csvLabel: "French origins",
    displayLabel: "French origins",
  },
  {
    csvLabel: "Northern European origins (except British Isles origins)",
    displayLabel: "Northern European\norigins",
  },
  {
    csvLabel: "South Asian origins",
    displayLabel: "South Asian origins",
  },
  {
    csvLabel: "East and Southeast Asian origins",
    displayLabel: "East and Southeast\nAsian origins",
  },
  {
    csvLabel: "West Central Asian and Middle Eastern origins",
    displayLabel: "West Central Asian &\nMiddle Eastern",
  },
  {
    csvLabel: "Canadian",
    displayLabel: "Canadian / American",
    combineWith: "American",
  },
  {
    csvLabel: "Sub-Saharan African origins",
    displayLabel: "Sub-Saharan African\norigins",
  },
  {
    csvLabel: "North African origins",
    displayLabel: "North African origins",
  },
  {
    csvLabel: "Caribbean origins",
    displayLabel: "Caribbean origins",
  },
  {
    csvLabel: "South American origins",
    displayLabel: "South American\norigins",
  },
  {
    csvLabel: "Central American origins",
    displayLabel: "Central American\norigins",
  },
  {
    csvLabel: "First Nations (North American Indian)",
    displayLabel: "First Nations",
  },
  {
    csvLabel: "Métis",
    displayLabel: "Métis",
  },
  {
    csvLabel: "Inuit",
    displayLabel: "Inuit",
  },
];

function findRow(rows, label) {
  return rows.find(
    (row) => row["Ethnic Origin"] && row["Ethnic Origin"].trim() === label
  );
}

function buildDetailedRows(rows) {
  return detailedGroupConfig
    .map((item) => {
      const mainRow = findRow(rows, item.csvLabel);
      if (!mainRow) return null;

      let total2011 = parseNumber(mainRow["Ontario 2011"]);
      let total2016 = parseNumber(mainRow["Ontario 2016"]);

      if (item.combineWith) {
        const secondRow = findRow(rows, item.combineWith);
        if (secondRow) {
          total2011 += parseNumber(secondRow["Ontario 2011"]);
          total2016 += parseNumber(secondRow["Ontario 2016"]);
        }
      }

      return {
        label: item.displayLabel,
        total2011,
        total2016,
      };
    })
    .filter(Boolean);
}

function DetailedHistogram() {
  const [detailData, setDetailData] = useState([]);

  useEffect(() => {
    Papa.parse("/diversity-dataset.csv", {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const rows = buildDetailedRows(results.data);
        setDetailData(rows);
      },
      error: (error) => {
        console.error("Error loading detailed CSV:", error);
      },
    });
  }, []);

  if (detailData.length === 0) {
    return (
      <div className="histogram-loading">Loading detailed breakdown...</div>
    );
  }

  const maxValue = Math.max(
    ...detailData.flatMap((item) => [item.total2011, item.total2016])
  );
 

  return (
    <div
      className="histogram-overlay-container detailed-overlay-container"
    >
      <div className="histogram-layout">
        <div className="histogram-header-row">
          <h2>2011 Census</h2>
          <div></div>
          <h2>2016 Census</h2>
        </div>

        <div className="histogram-rows detailed-histogram-rows">
          {detailData.map((item) => {
            const width2011 = (item.total2011 / maxValue) * 100;
            const width2016 = (item.total2016 / maxValue) * 100;

            return (
              <div className="histogram-row detailed-histogram-row" key={item.label}>
                <div className="bar-side left-side">
                  <span className="bar-label-2011">
                    {formatMillions(item.total2011)}
                  </span>
                  <div
                    className="bar bar-2011 detailed-bar"
                    style={{ width: `${Math.max(width2011, 1)}%` }}
                  />
                </div>

                <div
                  className="category-label detailed-category-label"
                >
                  {item.label.split("\n").map((line, index) => (
                    <div key={index}>{line}</div>
                  ))}
                </div>

                <div className="bar-side right-side">
                  <div
                    className="bar bar-2016 detailed-bar"
                    style={{ width: `${Math.max(width2016, 1)}%` }}
                  />
                  <span className="bar-label-2016">
                    {formatMillions(item.total2016)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default DetailedHistogram;