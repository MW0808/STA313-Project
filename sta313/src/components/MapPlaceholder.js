function MapPlaceholder({ title = "Map Component Placeholder" }) {
    return (
      <div className="map-placeholder-wrapper">
        <div className="map-placeholder">
          <div className="map-header">{title}</div>
  
          <div className="map-box">
          </div>
  
          <p className="map-note">
            Placeholder for future interactive map
          </p>
        </div>
      </div>
    );
  }
  
  export default MapPlaceholder;