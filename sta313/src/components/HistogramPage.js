import Histogram from "./Histogram";

function HistogramPage() {
  return (
    <section className="panel">
      <div className="histogram-page">
        <h1>Ontario's Ethnic Diversity: Population Breakdown (2011 vs. 2016)</h1>
        <Histogram />
      </div>
    </section>
  );
}

export default HistogramPage;