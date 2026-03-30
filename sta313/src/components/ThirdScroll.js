import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import MapPlaceholder from "./MapPlaceholder";
import "./ThirdScroll.css";

function ThirdScroll() {
  const svgRef = useRef(null);
  const [count, setCount] = useState(0);

  useEffect(() => {
    let isMounted = true;

    async function drawMap() {
      const width = window.innerWidth;
      const height = window.innerHeight;

      const svg = d3.select(svgRef.current);
      svg.selectAll("*").remove(); // clear old drawing
      svg.attr("width", width).attr("height", height);

      const g = svg.append("g");

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

      const points = [
        { name: "Point A", coords: [-79.3957, 43.6629] },
        { name: "Point B", coords: [-79.4, 43.67] },
        { name: "Point C", coords: [-79.38, 43.68] },
      ];

      function updatePointCounter(transform) {
        let visibleCount = 0;

        points.forEach((point) => {
          const projected = projection(point.coords);
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
          }
        });

        if (isMounted) setCount(visibleCount);
      }

      const zoom = d3
        .zoom()
        .scaleExtent([1, 8])
        .on("zoom", (event) => {
          g.attr("transform", event.transform);
          updatePointCounter(event.transform);
        });

      svg.call(zoom);

      g.selectAll("path")
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

      g.selectAll("circle.point")
        .data(points)
        .enter()
        .append("circle")
        .attr("class", "point")
        .attr("cx", (d) => projection(d.coords)[0])
        .attr("cy", (d) => projection(d.coords)[1])
        .attr("r", 5)
        .attr("fill", "#ff0000")
        .attr("stroke", "#000")
        .attr("stroke-width", 2);

      updatePointCounter(d3.zoomIdentity);

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
    <section className="panel">
      {/* <MapPlaceholder title="3rd Scroll Map" /> */}
      <div id="counter">Points in view: {count}</div>
      <svg
        id="map"
        ref={svgRef}
        style={{ width: "100vw", height: "100vh", display: "block" }}
      />
    </section>
  );
}

export default ThirdScroll;