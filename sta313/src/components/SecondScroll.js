import { useEffect, useRef } from "react";
import * as d3 from "d3";
import "./SecondScroll.css";

function SecondScroll() {
  const svgRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

    async function drawMap() {
      const container = d3.select(".map-container").node();
      if (!container) return;

      const width = container.getBoundingClientRect().width;
      const height = container.getBoundingClientRect().height;

      const svg = d3.select(svgRef.current);
      svg.attr("width", width).attr("height", height).attr("viewBox", `0 0 ${width} ${height}`);

      const mapLayer = svg.append("g").attr("class", "map-layer");

      const toronto = await d3.json("/Neighbourhoods.geojson");
      if (!toronto || !toronto.features) {
        console.error("GeoJSON failed to load or has no features");
        return;
      }

      const features = toronto.features;

      const projection = d3
        .geoMercator()
        .fitSize([width, height], {
          type: "FeatureCollection",
          features,
        });

      const path = d3.geoPath(projection);

      const zoom = d3
        .zoom()
        .scaleExtent([1, 20])
        .on("zoom", (event) => {
          mapLayer.attr("transform", event.transform);
        });



      mapLayer.selectAll("path")
        .data(features)
        .enter()
        .append("path")
        .attr("d", path)
        .style("fill", (d) => {
          const parentId = d.properties.PARENT_AREA_ID;

          const colorMap = {
            null: "#ddd",
            1: "#ddd",
            2: "#ddd",
            3: "#ddd",
            4: "#ddd",
            5: "#ddd",
            6: "#C45F3F",
            7: "#ddd",
            8: "#898E46",
            9: "#F29CC3",
            10: "#ddd",
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
        .attr("stroke", "#333");
        svg.append("text")
  .attr("class", "map-title")
  .attr("x", 700)
  .attr("y", 200)
  .text("Scarborough")
  .style("font-size", "20px")
  .style("font-weight", "600")
  .style("fill", "#f8f0e3")
  .style("pointer-events", "none");
        svg.append("text")
  .attr("class", "map-title")
  .attr("x", 400)
  .attr("y", 225)
  .text("North York")
  .style("font-size", "20px")
  .style("font-weight", "600")
  .style("fill", "#f8f0e3")
  .style("pointer-events", "none");
  svg.append("text")
  .attr("class", "map-title")
  .attr("x", 200)
  .attr("y", 400)
  .text("Etobicoke")
  .style("font-size", "20px")
  .style("font-weight", "600")
  .style("fill", "#333")
  .style("pointer-events", "none");
  svg.append("text")
  .attr("class", "map-title")
  .attr("x", 450)
  .attr("y", 400)
  .text("Toronto")
  .style("font-size", "20px")
  .style("font-weight", "600")
  .style("fill", "#333")
  .style("pointer-events", "none");

      
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
    <section className="panel" id="second-scroll">
      <div className="map-container">
        <svg id="map" ref={svgRef} />
      </div>
    </section>
  );
}

export default SecondScroll;
