import React, { useState } from "react";
import "./Loaders.css";

const ZenCircle = () => (
  <div className="loader-container">
    <div className="zen-circle"></div>
  </div>
);

const FloatingHoodie = () => (
  <div className="loader-container">
    <div className="floating-hoodie">
      <div className="hood"></div>
      <div className="body"></div>
    </div>
  </div>
);

const BreathingTshirt = () => (
  <div className="loader-container">
    <div className="breathing-tshirt">
      <div className="sleeve left"></div>
      <div className="body"></div>
      <div className="sleeve right"></div>
    </div>
  </div>
);

const MeditationPose = () => (
  <div className="loader-container">
    <div className="meditation-pose">
      <div className="head"></div>
      <div className="body"></div>
      <div className="leg left"></div>
      <div className="leg right"></div>
    </div>
  </div>
);

const YinYang = () => (
  <div className="loader-container">
    <div className="yin-yang">
      <div className="white"></div>
      <div className="black"></div>
    </div>
  </div>
);

const Loaders = () => {
  const [currentAnimation, setCurrentAnimation] = useState(0);
  const animations = [
    { component: ZenCircle, name: "Zen Circle" },
    { component: FloatingHoodie, name: "Floating Hoodie" },
    { component: BreathingTshirt, name: "Breathing T-shirt" },
    { component: MeditationPose, name: "Meditation Pose" },
    { component: YinYang, name: "Yin Yang" },
  ];

  const CurrentAnimation = animations[currentAnimation].component;

  return (
    <div className="app">
      <CurrentAnimation />
      <div className="button-container">
        {animations.map((animation, index) => (
          <button
            key={index}
            className={currentAnimation === index ? "active" : ""}
            onClick={() => setCurrentAnimation(index)}
          >
            {animation.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Loaders;
