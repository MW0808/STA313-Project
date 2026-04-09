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
        
        const regionLabels = [
          { id: 1, name: "Toronto", color: "#333" },       // White/Grey region
          { id: 9, name: "Etobicoke", color: "#333" },     // Pink region
          { id: 8, name: "North York", color: "#333" }, // Green region
          { id: 6, name: "Scarborough", color: "#333" } // Orange/Red region
        ];

      // regionLabels.forEach(label => {
      //   const regionFeatures = features.filter(f => f.properties.PARENT_AREA_ID === label.id);
        
      //   if (regionFeatures.length > 0) {
      //     const featureCollection = { type: "FeatureCollection", features: regionFeatures };
      //     const [x, y] = path.centroid(featureCollection);

      //     mapLayer.append("text")
      //       .attr("class", "map-region-label")
      //       .attr("x", x)
      //       .attr("y", y)
      //       .attr("dy", label.name === "North York" ? "-20px" : "0px") 
      //       .attr("dy", label.name === "Toronto" ? "-40px" : "0px") 
      //       .text(label.name)
      //       .attr("text-anchor", "middle")
      //       .style("font-size", "22px") // Bumped up for better visibility
      //       .style("font-weight", "800")
      //       .style("fill", label.color)
      //       .style("pointer-events", "none")
      //       .style("text-shadow", label.color === "#fbfbfbff" ? "2px 2px 4px rgba(38, 10, 10, 0.64)" : "none");
      //   }
      // });
      regionLabels.forEach(label => {
        const regionFeatures = features.filter(f => f.properties.PARENT_AREA_ID === label.id);
        
        if (regionFeatures.length > 0) {
          const featureCollection = { type: "FeatureCollection", features: regionFeatures };
          const [x, y] = path.centroid(featureCollection);

          const dyMap = {
            "North York": -20,
            "Toronto": -40,
          };
          const dy = dyMap[label.name] ?? 0;

          const g = mapLayer.append("g")
            .attr("transform", `translate(${x}, ${y + dy})`);

          // Append text first so we can measure it
          const text = g.append("text")
            .attr("class", "map-region-label")
            .attr("text-anchor", "middle")
            .attr("dominant-baseline", "middle")
            .text(label.name)
            .style("font-size", "22px")
            .style("font-weight", "800")
            .style("fill", label.color)
            .style("pointer-events", "none");

          // Measure and insert a rect behind the text
          const padding = { x: 10, y: 6 };
          const bbox = text.node().getBBox();

          g.insert("rect", "text")
            .attr("x", bbox.x - padding.x)
            .attr("y", bbox.y - padding.y)
            .attr("width", bbox.width + padding.x * 2)
            .attr("height", bbox.height + padding.y * 2)
            .attr("rx", 4)
            .attr("ry", 4)
            .style("fill", "rgba(221, 219, 219, 0.48)")
            .style("pointer-events", "none");
        }
      });
        
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
