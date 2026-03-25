function ToggleSwitch({ isDetailed, onToggle }) {
    return (
      <div className="toggle-wrapper">
        <div className="toggle-container" onClick={onToggle}>
          <span className={`toggle-label left ${!isDetailed ? "active" : ""}`}>
            Census Overview
          </span>
  
          <div className={`toggle-slider ${isDetailed ? "right" : "left"}`}>
            <div className="toggle-knob"></div>
          </div>
  
          <span className={`toggle-label right ${isDetailed ? "active" : ""}`}>
            Detailed Breakdown
          </span>
        </div>
      </div>
    );
  }
  
  export default ToggleSwitch;