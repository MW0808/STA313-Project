import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import "./FifthScroll.css";
import StackedBar from "./StackedBar";
import EventPopup from "./eventpopup/EventPopup";
import { adaptEvent } from "./eventpopup/adapter";


function hasFeature(event, keyword) {
  return (event.event_features || []).some((f) =>
    (Array.isArray(f) ? f[0] : f).includes(keyword)
  );
}

// returns the month number (1–12) from a date string
function getMonth(dateStr) {
  return new Date(dateStr).getMonth() + 1;
}

const EVENT_TYPE_MAP = {
  "Arts & Culture":         ["Arts/Exhibits", "Cultural", "Theatre", "Museum", "Dance", "Literary", "Indigenous", "Film", "World Culture", "Artisan", "History"],
  "Entertainment":          ["Live Performances", "Music", "Nightlife", "Comedy", "Trivia"],
  "Community & Food":       ["Celebrations", "Food/Culinary", "Farmers' Market", "Farmers Market", "Street Festival", "Public Square", "Parade", "Tour"],
  "Family & Education":     ["Family/Children", "Seminars/Workshops", "Talks", "Camp"],
  "Environment & Wellness": ["Environmental", "Charity/Cause", "Run/Walk", "Sports", "2SLGBTQ+", "LGBTQ2S+"],
  "Other":                  ["Virtual/Online Event", "Consumer Show/Convention", "Other"],
};

const colorMap = {
  null: "#ddd",
  1: "#80B0E8",
  2: "#F4D242",
  3: "#008471",
  4: "#D1CAEA",
  5: "#C19665",
  6: "#C45F3F",
  7: "#155C02",
  8: "#898E46",
  9: "#F29CC3",
  10: "#791357",
};

function matchesEventType(event, selectedType) {
  if (!selectedType) return true; // no filter = show all
  const keywords = EVENT_TYPE_MAP[selectedType] || [];
  return (event.event_category || []).some((cat) => {
    const catStr = Array.isArray(cat) ? cat[0] : cat;
    return keywords.includes(catStr);
  });
}

const MONTHS = [
  "", "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function runKMeans(points, k, maxIterations = 20) {
  if (points.length === 0) return [];
  if (points.length <= k) {
    return points.map((p) => ({ x: p.x, y: p.y, points: [p] }));
  }

  let centroids = points.slice(0, k).map((p) => ({ x: p.x, y: p.y }));
  let clusters = [];

  for (let iter = 0; iter < maxIterations; iter++) {
    clusters = centroids.map((c) => ({ x: c.x, y: c.y, points: [] }));

    for (const p of points) {
      let bestIndex = 0;
      let bestDist = Infinity;
      for (let i = 0; i < centroids.length; i++) {
        const dx = p.x - centroids[i].x;
        const dy = p.y - centroids[i].y;
        const dist = dx * dx + dy * dy;
        if (dist < bestDist) { bestDist = dist; bestIndex = i; }
      }
      clusters[bestIndex].points.push(p);
    }

    let moved = false;
    centroids = clusters.map((cluster, i) => {
      if (cluster.points.length === 0) return centroids[i];
      const newX = cluster.points.reduce((s, p) => s + p.x, 0) / cluster.points.length;
      const newY = cluster.points.reduce((s, p) => s + p.y, 0) / cluster.points.length;
      if (Math.abs(newX - centroids[i].x) > 1 || Math.abs(newY - centroids[i].y) > 1) moved = true;
      return { x: newX, y: newY };
    });

    if (!moved) break;
  }

  return clusters
    .filter((c) => c.points.length > 0)
    .map((c) => ({
      x: c.points.reduce((s, p) => s + p.x, 0) / c.points.length,
      y: c.points.reduce((s, p) => s + p.y, 0) / c.points.length,
      points: c.points,
    }));
}

function FifthScroll() {
  const svgRef = useRef(null);

  const [allEvents, setAllEvents] = useState([]);

  const [filteredEvents, setFilteredEvents] = useState([]);

  const [dataInRegion, setDataInRegion] = useState([]);
  const [count, setCount] = useState(0);

  const [eventType, setEventType] = useState("");
  const [month, setMonth] = useState("");
  const [parking, setParking] = useState(false);
  const [foodBev, setFoodBev] = useState(false);
  const [freeOnly, setFreeOnly] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    fetch("/events_clean.json")
      .then((res) => res.json())
      .then((data) => {
        setAllEvents(data);
        setFilteredEvents(data);
      });
  }, []);

  useEffect(() => {
    const result = allEvents.filter((event) => {
      if (!matchesEventType(event, eventType)) return false;
      if (month && getMonth(event.event_startdate) !== parseInt(month)) return false;
      if (parking && !hasFeature(event, "Parking")) return false;
      if (foodBev && !hasFeature(event, "Food and Beverages")) return false;
      if (freeOnly && event.free_event !== "Yes") return false;
      return true;
    });
    setFilteredEvents(result);
  }, [allEvents, eventType, month, parking, foodBev, freeOnly]);

  useEffect(() => {
    if (!svgRef.current) return;

    let isMounted = true;

    async function drawMap() {
      const container = document.querySelector(".fifth-map-container");
      if (!container) return;
      const width = container.getBoundingClientRect().width;
      const height = container.getBoundingClientRect().height;

      const svg = d3.select(svgRef.current);
      svg.attr("width", width).attr("height", height);
      svg.selectAll("*").remove();

      const mapLayer = svg.append("g").attr("class", "map-layer");
      const pointLayer = svg.append("g").attr("class", "point-layer");

      const toronto = await d3.json("/Neighbourhoods.geojson");
      if (!toronto || !toronto.features) return;

      const features = toronto.features;
      let clickedRegion = false;

      const projection = d3.geoMercator().fitSize([width, height], {
        type: "FeatureCollection",
        features,
      });

      const path = d3.geoPath(projection);

      function getVisiblePoints(data, transform) {
        return data
          .map((event) => {
            const projected = projection([event.longitude, event.latitude]);
            if (!projected) return null;
            const x = transform.applyX(projected[0]);
            const y = transform.applyY(projected[1]);
            if (x < 0 || x > width || y < 0 || y > height) return null;
            return { ...event, x, y };
          })
          .filter(Boolean);
      }

      function getClusterRadius(count) {
        return Math.min(30, Math.max(10, Math.sqrt(count) * 1.2));
      }

      function renderClusterCircles(clusters) {
        const maxCount = d3.max(clusters, (d) => d.points.length) || 1;
        const colorScale = d3.scaleSequential()
          .domain([0, maxCount])
          .interpolator(d3.interpolateYlOrRd);

        const legendWidth = 200;
        const legendHeight = 10;
        const defs = svg.selectAll("defs").data([null]).join("defs");
        const gradient = defs.selectAll("#fifth-legend-gradient").data([null])
          .join("linearGradient").attr("id", "fifth-legend-gradient");
        gradient.selectAll("stop").data(d3.range(0, 1.01, 0.1)).join("stop")
          .attr("offset", (d) => `${d * 100}%`)
          .attr("stop-color", (d) => d3.interpolateYlOrRd(d));

        const legend = svg.selectAll(".legend").data([null]).join("g")
          .attr("class", "legend")
          .attr("transform", `translate(${width - 240}, ${height - 40})`);
        legend.selectAll(".legend-bar").data([null]).join("rect")
          .attr("class", "legend-bar").attr("width", legendWidth)
          .attr("height", legendHeight).attr("fill", "url(#fifth-legend-gradient)");
        const legendScale = d3.scaleLinear().domain([0, maxCount]).range([0, legendWidth]);
        legend.selectAll(".legend-axis").data([null]).join("g")
          .attr("class", "legend-axis")
          .attr("transform", `translate(0, ${legendHeight})`)
          .call(d3.axisBottom(legendScale).ticks(5).tickFormat(d3.format("d")));
        legend.selectAll(".legend-title").data([null]).join("text")
          .attr("class", "legend-title").attr("x", 0).attr("y", -5)
          .text("# Events Per Cluster").style("font-size", "12px");

        pointLayer.selectAll("circle.cluster")
          .data(clusters, (d) => `c-${Math.round(d.x)}-${Math.round(d.y)}-${d.points.length}`)
          .join(
            (enter) => enter.append("circle").attr("class", "cluster")
              .attr("cx", (d) => d.x).attr("cy", (d) => d.y).attr("r", 0)
              .attr("fill", (d) => colorScale(d.points.length))
              .attr("stroke", "#222").attr("stroke-width", 2)
              .call((e) => e.transition().duration(200)
                .attr("r", (d) => getClusterRadius(d.points.length))),
            (update) => update.attr("fill", (d) => colorScale(d.points.length))
              .call((u) => u.transition().duration(200)
                .attr("cx", (d) => d.x).attr("cy", (d) => d.y)
                .attr("r", (d) => getClusterRadius(d.points.length))),
            (exit) => exit.call((e) =>
              e.transition().duration(150).attr("r", 0).remove())
          );

        pointLayer.selectAll("text.cluster-label")
          .data(clusters, (d) => `l-${Math.round(d.x)}-${Math.round(d.y)}-${d.points.length}`)
          .join(
            (enter) => enter.append("text").attr("class", "cluster-label")
              .attr("x", (d) => d.x).attr("y", (d) => d.y)
              .attr("text-anchor", "middle").attr("dy", "0.35em")
              .style("font-size", "12px").style("font-weight", "bold")
              .style("pointer-events", "none").style("fill", "#111")
              .text((d) => d.points.length),
            (update) => update.call((u) => u.transition().duration(200)
              .attr("x", (d) => d.x).attr("y", (d) => d.y)
              .text((d) => d.points.length)),
            (exit) => exit.remove()
          );  
      }
      // ─── REGION LEGEND ───────────────────────────────────────────────
const regionLegend = svg.selectAll(".region-legend")
  .data([null])
  .join("g")
  .attr("class", "region-legend")
  .attr("transform", `translate(20, ${height - 200})`);

const regionEntries = Object.entries({
  1: "Downtown",
  2: "East York",
  3: "East End",
  4: "West End",
  5: "Midtown",
  6: "Scarborough",
  7: "York-Crosstown",
  8: "North York",
  9: "Etobicoke",
  10: "Midtown",
});

regionLegend.selectAll("g")
  .data(regionEntries)
  .join("g")
  .attr("transform", (d, i) => `translate(0, ${i * 20})`)
  .each(function ([id, label]) {
    const g = d3.select(this);

    g.append("rect")
      .attr("width", 14)
      .attr("height", 14)
      .attr("fill", colorMap[id])
      .attr("stroke", "#333");

    g.append("text")
      .attr("x", 20)
      .attr("y", 11)
      .style("font-size", "12px")
      .text(label);
  });

      function renderClusters(transform) {
        const visiblePoints = getVisiblePoints(filteredEvents, transform).filter(p => !isNaN(p.x) && !isNaN(p.y));
        const zoomedInEnough = transform.k >= 4;

        if (visiblePoints.length <= 500 || (clickedRegion && zoomedInEnough)) {
          pointLayer.selectAll("circle.cluster").remove();
          pointLayer.selectAll("text.cluster-label").remove();
          pointLayer.selectAll("circle.point")
          .data(visiblePoints, (d) => d.id ?? `${d.longitude}-${d.latitude}-${d.event_startdate}`)
          .join(
            (enter) => enter.append("circle")
              .attr("class", "point")
              .attr("cx", (d) => d.x)
              .attr("cy", (d) => d.y)
              .attr("r", 5)
              .attr("fill", "#ff0000")
              .attr("stroke", "#000")
              .attr("stroke-width", 2)
              .style("cursor", "pointer") 
              .on("click", (event, d) => {
                event.stopPropagation(); // Prevents map from resetting zoom

                const cleanData = adaptEvent(d);
                setSelectedEvent(cleanData); // This triggers the popup
              }),
              
            (update) => update.attr("cx", (d) => d.x).attr("cy", (d) => d.y),
            (exit) => exit.remove()
          );
        return;
        }

        pointLayer.selectAll("circle.point").remove();
        const clusters = runKMeans(visiblePoints, 10);
        renderClusterCircles(clusters);
      }

      function updatePointCounter(transform) {
        let visibleCount = 0;
        let nextDataInRegion = [];

        filteredEvents.forEach((event) => {
          const projected = projection([event.longitude, event.latitude]);
          if (!projected) return;
          const tx = transform.applyX(projected[0]);
          const ty = transform.applyY(projected[1]);
          if (tx >= 0 && tx <= width && ty >= 0 && ty <= height) {
            visibleCount++;
            nextDataInRegion.push(event);
          }
        });

        if (isMounted) {
          setDataInRegion(nextDataInRegion);
          setCount(visibleCount);
        }
      }

      const zoom = d3.zoom().scaleExtent([1, 20]).on("zoom", (event) => {
        mapLayer.attr("transform", event.transform);
        updatePointCounter(event.transform);
        if (event.transform.k < 4) clickedRegion = false;
        renderClusters(event.transform);
      });

      svg.call(zoom);

      mapLayer.selectAll("path")
        .data(features)
        .enter()
        .append("path")
        .attr("d", path)
        .style("fill", (d) => {
          const parentId = d.properties.PARENT_AREA_ID;
          const colorMap = {
            null: "#ddd", 1: "#80B0E8", 2: "#F4D242", 3: "#008471",
            4: "#D1CAEA", 5: "#C19665", 6: "#C45F3F", 7: "#155C02",
            8: "#898E46", 9: "#F29CC3", 10: "#791357",
          };
          if (colorMap[parentId] !== undefined) return colorMap[parentId];
          const hash = Math.abs(
            JSON.stringify(parentId).split("").reduce((a, b) => {
              a = (a << 5) - a + b.charCodeAt(0);
              return a & a;
            }, 0)
          );
          return `hsl(${hash % 360}, 70%, 60%)`;
        })
        .attr("stroke", "#333")
        .on("click", function (event, d) {
          const [[x0, y0], [x1, y1]] = path.bounds(d);
          event.stopPropagation();
          clickedRegion = true;
          svg.transition().duration(750).call(
            zoom.transform,
            d3.zoomIdentity
              .translate(width / 2, height / 2)
              .scale(Math.min(8, 0.9 / Math.max((x1 - x0) / width, (y1 - y0) / height)))
              .translate(-(x0 + x1) / 2, -(y0 + y1) / 2)
          );
        });

      updatePointCounter(d3.zoomIdentity);
      renderClusters(d3.zoomIdentity);

      svg.on("click", () => {
        svg.transition().duration(750).call(zoom.transform, d3.zoomIdentity);
      });
    }

    drawMap().catch((err) => console.error("Error drawing map:", err));
    return () => { isMounted = false; };

  }, [filteredEvents]); // redraws map whenever filters change

  // reset all filters back to default
  function handleReset() {
    setEventType("");
    setMonth("");
    setParking(false);
    setFoodBev(false);
    setFreeOnly(false);
  }

  // ─── RENDER ───────────────────────────────────────────────────────────────
  return (
    <section className="panel">

      {/* ── Top row: map on left, filters on right ── */}
      <div className="fifth-top-row">

        {/* Map */}
        <div className="fifth-map-container">
          <svg id="fifth-map" ref={svgRef} />
        </div>

        {/* Filters panel */}
        <div className="filters-panel">
          <h2 className="filters-title">FILTERS</h2>

          {/* Event Type dropdown */}
          <div className="filter-group">
            <label className="filter-label" htmlFor="fifth-eventType">Event Type</label>
            <select
              id="fifth-eventType"
              className="filter-select"
              value={eventType}
              onChange={(e) => setEventType(e.target.value)}
            >
              <option value="">All</option>
              {Object.keys(EVENT_TYPE_MAP).map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          {/* Month dropdown */}
          <div className="filter-group">
            <label className="filter-label" htmlFor="fifth-month">Month</label>
            <select
              id="fifth-month"
              className="filter-select"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
            >
              <option value="">All</option>
              {MONTHS.slice(1).map((name, i) => (
                <option key={i + 1} value={i + 1}>{name}</option>
              ))}
            </select>
          </div>

          {/* Available Parking checkbox */}
          <div className="filter-group">
            <label className="filter-checkbox-label">
              <input
                type="checkbox"
                checked={parking}
                onChange={(e) => setParking(e.target.checked)}
              />
              Available Parking
            </label>
          </div>

          {/* Food and Beverage checkbox */}
          <div className="filter-group">
            <label className="filter-checkbox-label">
              <input
                type="checkbox"
                checked={foodBev}
                onChange={(e) => setFoodBev(e.target.checked)}
              />
              Food and Beverage
            </label>
          </div>

          {/* Free checkbox */}
          <div className="filter-group">
            <label className="filter-checkbox-label">
              <input
                type="checkbox"
                checked={freeOnly}
                onChange={(e) => setFreeOnly(e.target.checked)}
              />
              Free
            </label>
          </div>

          {/* Reset button */}
          <button className="filter-reset-btn" onClick={handleReset}>
            Reset Filters
          </button>

          {/* How many events match */}
          <p className="filter-count">
            {filteredEvents.length} event{filteredEvents.length !== 1 ? "s" : ""} match filters
          </p>
        </div>
      </div>

      {/* ── Bottom: bar chart ── */}
      <div className="fifth-chart-container">
        <StackedBar data={dataInRegion} />
      </div>

    {selectedEvent && (
      <EventPopup 
        event={selectedEvent} 
        onClose={() => setSelectedEvent(null)} 
      />
    )}

    </section>
  );
}

export default FifthScroll;

