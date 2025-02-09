import React, { useEffect, useRef } from "react";
import "./AniComponent2.css";

function FloatingPaths({ position }) {
  const svgRef = useRef(null);

  useEffect(() => {
    const svg = svgRef.current;
    const svgWidth = 696;
    const svgHeight = 316;
    const pathCount = 36;

    const paths = Array.from({ length: pathCount }, (_, i) => {
      const path = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "path"
      );

      // Create smoother, more consistent paths
      const startY = -50 + (i / pathCount) * (svgHeight + 100);
      const endY = startY + (Math.random() * 100 - 50);
      const controlY1 = startY + (Math.random() * 100 - 50);
      const controlY2 = endY + (Math.random() * 100 - 50);

      const d = `
        M${-100 * position} ${startY} 
        C${svgWidth * 0.3 * position} ${controlY1}, 
         ${svgWidth * 0.7 * position} ${controlY2}, 
         ${(svgWidth + 100) * position} ${endY}
      `;

      path.setAttribute("d", d);
      path.setAttribute("stroke", "currentColor");
      path.setAttribute("stroke-width", 0.5 + i * 0.03);
      path.setAttribute("fill", "none");
      svg.appendChild(path);

      return { path, length: path.getTotalLength() };
    });

    paths.forEach(({ path, length }) => {
      path.style.strokeDasharray = length;
      path.style.strokeDashoffset = position > 0 ? length : -length;

      const animate = () => {
        const duration = 20000 + Math.random() * 10000;
        path.animate(
          [
            { strokeDashoffset: position > 0 ? length : -length },
            { strokeDashoffset: position > 0 ? -length : length },
          ],
          {
            duration: duration,
            iterations: Infinity,
            easing: "linear",
          }
        );
      };

      animate();
    });
  }, [position]);

  return (
    <div className="paths-container">
      <svg
        ref={svgRef}
        className="paths-svg"
        viewBox="0 0 696 316"
        preserveAspectRatio="xMidYMid slice"
      >
        <title>Background Paths</title>
      </svg>
    </div>
  );
}

export default function BackgroundPaths({ title = "Background Paths" }) {
  const words = title.split(" ");
  const titleRef = useRef(null);

  useEffect(() => {
    const titleElement = titleRef.current;
    const letters = titleElement.querySelectorAll(".letter");
    const button = document.querySelector(".button-container");

    // Fade in the title
    titleElement.style.opacity = "1";

    // Animate letters
    letters.forEach((letter, index) => {
      setTimeout(() => {
        letter.style.opacity = "1";
        letter.style.transform = "translateY(0)";
      }, 50 * index);
    });

    // Fade in the button
    setTimeout(() => {
      button.style.opacity = "1";
      button.style.transform = "translateY(0)";
    }, 50 * letters.length + 200);
  }, []);

  return (
    <div className="background-paths">
      <FloatingPaths position={1} />
      <FloatingPaths position={-1} />

      <div className="content">
        <h1 ref={titleRef}>
          {words.map((word, wordIndex) => (
            <span key={wordIndex} className="word">
              {word.split("").map((letter, letterIndex) => (
                <span key={`${wordIndex}-${letterIndex}`} className="letter">
                  {letter}
                </span>
              ))}
            </span>
          ))}
        </h1>

        <div className="button-container">
          <button className="button">
            <span>Discover Excellence</span>
            <span>→</span>
          </button>
        </div>
      </div>
    </div>
  );
}
