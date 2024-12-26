import React, { useEffect } from "react";
import "./Scroll.css";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const Scroll1 = () => {
  useEffect(() => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: "#scrollmain",
        start: "50% 50%",
        end: "150% 50%",
        scrub: 2,
        markers: true,
        pin: true,
      },
    });

    tl.to("#center", { height: "100vh" }, "a")
      .to("#top", { top: "-50%" }, "a")
      .to("#bottom", { bottom: "-60%" }, "a")
      .to("#top-h1", { top: "87%" }, "a")
      .to("#bottom-h1", { bottom: "-40%" }, "a")
      .to("#center-h1", { top: "-30%" }, "a")
      .to(".content", { delay: -0.2, marginTop: "10%" });
    return () => {
      // Kill GSAP animation on unmount to avoid interference
      tl.kill();
    };
  }, []);

  return (
    <div id="scrollmain">
      <div id="top">
        <h1 id="top-h1">LETS DRESSED</h1>
      </div>
      <div id="center">
        <div className="content">
          <h4 className="center-h1">WELCOME</h4>
          <h3>
            <i>Browse</i> the work that define a <i>movement</i> and created a
            craft.
          </h3>
          <div className="btn">
            <h5>ENTER GALLERY</h5>
          </div>
          <h2>(17)</h2>
        </div>
      </div>
      <div id="bottom">
        <h1 id="bottom-h1">LETS DRESSED</h1>
      </div>
    </div>
  );
};

export default Scroll1;
