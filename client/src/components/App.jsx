import React from "react";
import Scene from "./Scene.jsx";
import SolarSystem from "./SolarSystem.jsx";

export default function App() {
  const [view, setView] = React.useState("solarSystem");

  return (
    <div id="App">
      <div id="header">
        <p></p>
        <div>
          <button className="headerBtn" onClick={() => setView("scene")}>
            Scene
          </button>
          <button className="headerBtn" onClick={() => setView("solarSystem")}>
            Solar System
          </button>
        </div>
      </div>
      <div>
        {view === "scene" && <Scene />}
        {view === "solarSystem" && <SolarSystem />}
      </div>
    </div>
  );
}
