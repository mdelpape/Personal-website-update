import React from "react";
import Scene from "./Scene.jsx";
import SolarSystem from "./SolarSystem.jsx";
import ImageEffect from "./ImageEffect.jsx";
import Slider from "rc-slider";

export default function App() {
  const [view, setView] = React.useState("scene");

  return (
    <div id="App">
      <div id="header">
        <p></p>
        <div>
          <button className="headerBtn" onClick={() => setView("scene")}>
            Home
          </button>
          <button className="headerBtn" onClick={() => setView("solarSystem")}>
            Solar System
          </button>
          <button className="headerBtn" onClick={() => setView("imageEffect")}>
            Image Effect
          </button>
        </div>
      </div>
      <div>
        {view === "scene" && <Scene />}
        {view === "solarSystem" && <SolarSystem />}
        {view === "imageEffect" && <ImageEffect />}
      </div>
    </div>
  );
}
