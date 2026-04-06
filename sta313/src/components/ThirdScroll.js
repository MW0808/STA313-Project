import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import "./ThirdScroll.css";
import StackedBar from "./StackedBar";

function ThirdScroll() {
  const svgRef = useRef(null);
  const [count, setCount] = useState(0);
  const [dataInRegion, setDataInRegion] = useState([]);

  useEffect(() => {
    let isMounted = true;

    async function drawMap() {
      const data = await d3.json("/events_clean.json");

      const container = d3.select(".map-container").node();
      const width = container.getBoundingClientRect().width;
      const height = container.getBoundingClientRect().height;

      const svg = d3.select(svgRef.current);
      svg.attr("width", width).attr("height", height);
      svg.selectAll("*").remove();

      const mapLayer = svg.append("g").attr("class", "map-layer");
      const pointLayer = svg.append("g").attr("class", "point-layer");

      const toronto = await d3.json("/Neighbourhoods.geojson");
      if (!toronto || !toronto.features) {
        console.error("GeoJSON failed to load or has no features");
        return;
      }

      const features = toronto.features;
      let clickedRegion = false;

      const projection = d3
        .geoMercator()
        .fitSize([width, height], {
          type: "FeatureCollection",
          features,
        });

      const path = d3.geoPath(projection);
      

      function runKMeans(points, k, maxIterations = 20) {
      if (points.length === 0) return [];
      if (points.length <= k) {
        return points.map(p => ({
          x: p.x,
          y: p.y,
          points: [p],
        }));
      }

      let centroids = points.slice(0, k).map(p => ({ x: p.x, y: p.y }));

      let clusters = [];

      for (let iter = 0; iter < maxIterations; iter++) {
        clusters = centroids.map(c => ({
          x: c.x,
          y: c.y,
          points: [],
        }));

        for (const p of points) {
          let bestIndex = 0;
          let bestDist = Infinity;

          for (let i = 0; i < centroids.length; i++) {
            const dx = p.x - centroids[i].x;
            const dy = p.y - centroids[i].y;
            const dist = dx * dx + dy * dy;

            if (dist < bestDist) {
              bestDist = dist;
              bestIndex = i;
            }
          }

          clusters[bestIndex].points.push(p);
        }

        let moved = false;
        centroids = clusters.map((cluster, i) => {
          if (cluster.points.length === 0) {
            return centroids[i];
          }

          const newX =
            cluster.points.reduce((sum, p) => sum + p.x, 0) / cluster.points.length;
          const newY =
            cluster.points.reduce((sum, p) => sum + p.y, 0) / cluster.points.length;

          if (
            Math.abs(newX - centroids[i].x) > 1 ||
            Math.abs(newY - centroids[i].y) > 1
          ) {
            moved = true;
          }

          return { x: newX, y: newY };
        });

        if (!moved) break;
      }

      return clusters
        .filter(cluster => cluster.points.length > 0)
        .map(cluster => ({
          x: cluster.points.reduce((sum, p) => sum + p.x, 0) / cluster.points.length,
          y: cluster.points.reduce((sum, p) => sum + p.y, 0) / cluster.points.length,
          points: cluster.points,
        }));
    }

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
      

      function renderClusters(transform) {
        const visiblePoints = getVisiblePoints(data, transform);
        const zoomedInEnough = transform.k >= 4;
        if (visiblePoints.length <= 500 || (clickedRegion && zoomedInEnough)) {
          pointLayer.selectAll("circle.cluster").remove();
          pointLayer.selectAll("text.cluster-label").remove();

          pointLayer.selectAll("circle.point")
            .data(
              visiblePoints,
              d => d.id ?? `${d.longitude}-${d.latitude}-${d.event_startdate}`
            )
            .join(
              enter => enter.append("circle")
                .attr("class", "point")
                .attr("cx", d => d.x)
                .attr("cy", d => d.y)
                .attr("r", 5)
                .attr("fill", "#ff0000")
                .attr("stroke", "#000")
                .attr("stroke-width", 2),
              update => update
                .attr("cx", d => d.x)
                .attr("cy", d => d.y),
              exit => exit.remove()
            );

          return;
        }

        pointLayer.selectAll("circle.point").remove();

        const k = 10;
        const clusters = runKMeans(visiblePoints, k);

        renderClusterCircles(clusters);
      }


      function getClusterRadius(count) {
        return Math.min(30, Math.max(10, Math.sqrt(count) * 1.2));
      }

      function renderClusterCircles(clusters) {
        const clusterCircles = pointLayer
          .selectAll("circle.cluster")
          .data(clusters, d => `c-${Math.round(d.x)}-${Math.round(d.y)}-${d.points.length}`);

        const maxCount = d3.max(clusters, d => d.points.length) || 1;

        const colorScale = d3.scaleSequential()
          .domain([0, maxCount])
          .interpolator(d3.interpolateYlOrRd);

        const legendWidth = 200;
        const legendHeight = 10;

        const defs = svg.selectAll("defs").data([null]).join("defs");

        const gradient = defs.selectAll("#legend-gradient")
          .data([null])
          .join("linearGradient")
          .attr("id", "legend-gradient");

        gradient.selectAll("stop")
          .data(d3.range(0, 1.01, 0.1))
          .join("stop")
          .attr("offset", d => `${d * 100}%`)
          .attr("stop-color", d => d3.interpolateYlOrRd(d));

        const legend = svg.selectAll(".legend")
          .data([null])
          .join("g")
          .attr("class", "legend")
          .attr("transform", `translate(${width - 240}, ${height - 40})`);

        legend.selectAll(".legend-bar")
          .data([null])
          .join("rect")
          .attr("class", "legend-bar")
          .attr("width", legendWidth)
          .attr("height", legendHeight)
          .attr("fill", "url(#legend-gradient)");

        const legendScale = d3.scaleLinear()
          .domain([0, maxCount])
          .range([0, legendWidth]);

        const axis = d3.axisBottom(legendScale)
          .ticks(5)
          .tickFormat(d3.format("d"));

        legend.selectAll(".legend-axis")
          .data([null])
          .join("g")
          .attr("class", "legend-axis")
          .attr("transform", `translate(0, ${legendHeight})`)
          .call(axis);

        legend.selectAll(".legend-title")
          .data([null])
          .join("text")
          .attr("class", "legend-title")
          .attr("x", 0)
          .attr("y", -5)
          .text("# Events Per Cluster")
          .style("font-size", "12px");

        clusterCircles.join(
          enter => enter
            .append("circle")
            .attr("class", "cluster")
            .attr("cx", d => d.x)
            .attr("cy", d => d.y)
            .attr("r", 0)
            .attr("fill", d => colorScale(d.points.length))
            .attr("stroke", "#222")
            .attr("stroke-width", 2)
            .call(enter => enter.transition().duration(200)
              .attr("r", d => getClusterRadius(d.points.length))),
          update => update
            .attr("fill", d => colorScale(d.points.length))
            .call(update => update.transition().duration(200)
              .attr("cx", d => d.x)
              .attr("cy", d => d.y)
              .attr("r", d => getClusterRadius(d.points.length))),
          exit => exit
            .call(exit => exit.transition().duration(150).attr("r", 0).remove())
        );

        const clusterLabels = pointLayer
          .selectAll("text.cluster-label")
          .data(clusters, d => `l-${Math.round(d.x)}-${Math.round(d.y)}-${d.points.length}`);

        clusterLabels.join(
          enter => enter
            .append("text")
            .attr("class", "cluster-label")
            .attr("x", d => d.x)
            .attr("y", d => d.y)
            .attr("text-anchor", "middle")
            .attr("dy", "0.35em")
            .style("font-size", "12px")
            .style("font-weight", "bold")
            .style("pointer-events", "none")
            .style("fill", "#111")
            .text(d => d.points.length),
          update => update
            .call(update => update.transition().duration(200)
              .attr("x", d => d.x)
              .attr("y", d => d.y)
              .text(d => d.points.length)),
          exit => exit.remove()
        );
      }

      function updatePointCounter(transform) {
        let visibleCount = 0;
        let nextDataInRegion = [];

        data.forEach((event) => {
          const projected = projection([event.longitude, event.latitude]);
          if (!projected) return;

          const transformed = [
            transform.applyX(projected[0]),
            transform.applyY(projected[1]),
          ];

          if (
            transformed[0] >= 0 &&
            transformed[0] <= width &&
            transformed[1] >= 0 &&
            transformed[1] <= height
          ) {
            visibleCount++;
            nextDataInRegion.push(event);
          }
        });

        if (isMounted) {
          setDataInRegion(nextDataInRegion);
          setCount(visibleCount);
        }
      }

      const zoom = d3
        .zoom()
        .scaleExtent([1, 20])
        .on("zoom", (event) => {
          mapLayer.attr("transform", event.transform);
          updatePointCounter(event.transform);
          if (event.transform.k < 4) {
            clickedRegion = false;
          }

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

          if (colorMap[parentId] !== undefined) {
            return colorMap[parentId];
          }

          const hash = Math.abs(
            JSON.stringify(parentId)
              .split("")
              .reduce((a, b) => {
                a = (a << 5) - a + b.charCodeAt(0);
                return a & a;
              }, 0)
          );

          const hue = hash % 360;
          return `hsl(${hue}, 70%, 60%)`;
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
              .scale(
                Math.min(
                  8,
                  0.9 /
                    Math.max((x1 - x0) / width, (y1 - y0) / height)
                )
              )
              .translate(-(x0 + x1) / 2, -(y0 + y1) / 2)
          );
        });


        updatePointCounter(d3.zoomIdentity);
        renderClusters(d3.zoomIdentity);

      svg.on("click", () => {
        svg.transition().duration(750).call(zoom.transform, d3.zoomIdentity);
      });
    }

    drawMap().catch((err) => {
      console.error("Error drawing map:", err);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section className="panel" id ="third-scroll">
      <div id="counter">Points in view: {count}</div>

      <div className="map-container">
        <svg id="map" ref={svgRef} />
      </div>

      <div className="chart-container">
        <StackedBar data={dataInRegion} />
      </div>
    </section>
  );
}

export default ThirdScroll;