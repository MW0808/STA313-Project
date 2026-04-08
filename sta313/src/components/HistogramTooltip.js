function HistogramTooltip({ title, data }) {
  if (!title || !data || data.length === 0) return null;
  const maxValue = Math.max(
    ...data.flatMap((item) => [item.value2011, item.value2016])
  );
  return (
    <div className="histogram-tooltip">
      <div className="histogram-tooltip-inner">
        <h3 className="tooltip-title">{title} Origin Breakdown</h3>
        <p className="tooltip-subtitle">(2011 vs 2016)</p>
        <div className="tooltip-list">
          {data.map((item) => {
            const width2011 = (item.value2011 / maxValue) * 100;
            const width2016 = (item.value2016 / maxValue) * 100;
            return (
              <div className="tooltip-item" key={item.label}>
                <div className="tooltip-label">{item.label}</div>
                <div className="tooltip-bar-group">
                  <div className="tooltip-bar-row">
                    <div
                      className="tooltip-bar tooltip-bar-2011"
                      style={{ width: `${Math.max(width2011, 4)}%` }}
                    />
                  </div>
                  <div className="tooltip-bar-row">
                    <div
                      className="tooltip-bar tooltip-bar-2016"
                      style={{ width: `${Math.max(width2016, 4)}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
export default HistogramTooltip;
