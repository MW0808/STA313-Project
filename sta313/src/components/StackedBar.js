import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

const categories = ["Arts & Culture", "Entertainment", "Community & Food", "Family & Education", "Environment & Wellness", "Other"];
const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function StackedBar({ data }) {
  const svgRef = useRef();
  const [baselineCategory, setBaselineCategory] = useState(null);

  useEffect(() => {
    if (!data || data.length === 0) return;
    const container = svgRef.current.parentElement;

    const fullWidth = container.clientWidth;
    const fullHeight = container.clientHeight;

    const margin = { top: 20, right: 150, bottom: 50, left: 50 };
    const width = fullWidth - margin.left - margin.right;
    const height = fullHeight - margin.top - margin.bottom;

    const svg = d3.select(svgRef.current)
    .attr("width", fullWidth)
    .attr("height", fullHeight);
    

    const g = svg.selectAll(".chart-root")
        .data([null])
        .join("g")
        .attr("class", "chart-root")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const tooltip = d3.select("body")
        .selectAll(".tooltip")
        .data([null])
        .join("div")
        .attr("class", "tooltip");

    const monthData = groupDataByMonthAndCategory(data);

    monthData.forEach(d => {
    const total = categories.reduce((sum, key) => sum + d[key], 0);
    categories.forEach(key => {
        d[key] = total ? d[key] / total : 0;
    });
    });
    
    const stack = d3.stack().keys(categories);
    const series = stack(monthData);

    const x = d3.scaleBand()
      .domain(monthNames)
      .range([0, width])
      .padding(0.2);

    const yMax = d3.max(monthData, d => categories.reduce((sum, key) => sum + (Number(d[key]) || 0), 0)) || 100;
    
    const y = d3.scaleLinear()
        .domain([0, 1])
        .range([height, 0]);

    const color = d3.scaleOrdinal()
      .domain(categories)
      .range(d3.schemeTableau10);

    const getOffset = (d, i) => {
      if (!baselineCategory) return 0;
      const targetSeries = series.find(s => s.key === baselineCategory);
      return height - y(targetSeries[i][0]); 
    };

    const layers = g.selectAll(".layer")
        .data(series)
        .join("g")
        .attr("class", "layer")
        .attr("fill", d => color(d.key))
        .on("click", (event, d) => {
            setBaselineCategory(prev => prev === d.key ? null : d.key);
        })
        .style("cursor", "pointer");

    const rects = layers.selectAll("rect")
        .data(layer => layer.map(d => ({ ...d, category: layer.key })));

    rects.join("rect")
        .attr("x", d => x(d.data.month.substring(0, 3)))
        .attr("width", x.bandwidth())
        .on("mouseover", function (event, d) {
            const details = d.data.details[d.category];

            const text = Object.entries(details)
                .map(([k, v]) => `${k}: ${v}`)
                .join("<br>");

            tooltip
                .html(`<strong>${d.category}</strong><br>${text}`)
                .style("opacity", 1);
        })
        .on("mousemove", function (event) {
            tooltip
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 20) + "px");
        })
        .on("mouseleave", function () {
            tooltip.style("opacity", 0);
        })
        .transition()
        .duration(500)
        .ease(d3.easeCubicOut)
        .attr("y", d => y(d[1]) + getOffset(d, d.data.index))
        .attr("height", d => y(d[0]) - y(d[1]));

    g.selectAll(".x-axis")
        .data([null])
        .join("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0,${height})`)
        .transition()
        .duration(1200)
        .ease(d3.easeLinear)
        .call(d3.axisBottom(x));

    g.selectAll(".y-axis")
        .data([null])
        .join("g")
        .attr("class", "y-axis")
        .transition()
        .duration(1200)
        .ease(d3.easeLinear)
        .call(d3.axisLeft(y).tickFormat(d3.format(".0%")));

    const legend = g.selectAll(".legend")
        .data(categories)
        .join("g")
        .attr("class", "legend")
        .attr("transform", (d, i) => `translate(${width + 10}, ${i * 20})`);

    legend.selectAll("rect")
        .data(d => [d])
        .join("rect")
        .attr("width", 15)
        .attr("height", 15)
        .attr("fill", color)
        .style("opacity", d => (baselineCategory === d || !baselineCategory ? 1 : 0.3));

    legend.selectAll("text")
        .data(d => [d])
        .join("text")
        .attr("x", 20)
        .attr("y", 12)
        .text(d => d)
        .style("font-size", "11px");

  }, [data, baselineCategory]);

  return (
    <>
    <h3 className="chart-title">
        Events by Month (Click a category to set baseline)
        </h3>
        <div className="chart-inner">
        <svg ref={svgRef} className="chart-svg"></svg>
        </div>
    </>
  );
}

function groupDataByMonthAndCategory(data) {
  const categoryMap = {
    "Arts/Exhibits": "Arts & Culture",
    "Cultural": "Arts & Culture",
    "Theatre": "Arts & Culture",
    "Museum": "Arts & Culture",
    "Dance": "Arts & Culture",
    "Literary": "Arts & Culture",
    "Indigenous": "Arts & Culture",
    "Film": "Arts & Culture",
    "World Culture": "Arts & Culture",
    "Artisan": "Arts & Culture",
    "History": "Arts & Culture",

    "Live Performances": "Entertainment",
    "Music": "Entertainment",
    "Nightlife": "Entertainment",
    "Comedy": "Entertainment",
    "Trivia": "Entertainment",

    "Celebrations": "Community & Food",
    "Food/Culinary": "Community & Food",
    "Farmers' Market": "Community & Food",
    "Farmers Market": "Community & Food",
    "Street Festival": "Community & Food",
    "Public Square": "Community & Food",
    "Parade": "Community & Food",
    "Tour": "Community & Food",

    "Family/Children": "Family & Education",
    "Seminars/Workshops": "Family & Education",
    "Talks": "Family & Education",
    "Camp": "Family & Education",

    "Environmental": "Environment & Wellness",
    "Charity/Cause": "Environment & Wellness",
    "Run/Walk": "Environment & Wellness",
    "Sports": "Environment & Wellness",
    "2SLGBTQ+": "Environment & Wellness",
    "LGBTQ2S+": "Environment & Wellness",

    "Virtual/Online Event": "Other",
    "Consumer Show/Convention": "Other",
    "Other": "Other"
  };

  const categories = [
    "Arts & Culture",
    "Entertainment",
    "Community & Food",
    "Family & Education",
    "Environment & Wellness",
    "Other"
  ];

  const monthNames = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];

  const monthData = monthNames.map((month, index) => {
    const row = {
        month,
        index,
        details: {}
    };
    categories.forEach(cat => {
      row[cat] = 0;
      row.details[cat] = {};
    });
    return row;
  });

  data.forEach((event) => {
    const date = new Date(event.event_startdate);
    if (isNaN(date)) return;

    const monthIndex = date.getMonth();
    const monthRow = monthData[monthIndex];

    (event.event_category || []).forEach((cat) => {
      const detailed = Array.isArray(cat) ? cat[0] : cat;
      const broad = categoryMap[detailed] || "Other";

      monthRow[broad] += 1;
      monthRow.details[broad][detailed] = (monthRow.details[broad][detailed] || 0) + 1;
    });
  });

  return monthData;
  
}

export default StackedBar;
  