import React, { useEffect } from "react";
import "./Gitdemo2.css";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "@studio-freight/lenis";

// Initialize GSAP ScrollTrigger and Lenis
gsap.registerPlugin(ScrollTrigger);

const Gitdemo2 = () => {
  useEffect(() => {
    const lenis = new Lenis();
    const raf = (time) => {
      lenis.raf(time);
      requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);

    // GSAP Scroll Animations
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: ".part-1",
        start: "50% 50%",
        end: "250% 50%",
        scrub: true,
        pin: true,
      },
    });

    tl.to(".overlay-div h1", { opacity: "1", delay: 0.2 }, "a")
      .to(".overlay-div", { backgroundColor: "#000000b4" }, "a")
      .to(".scrolling", { width: "100%" }, "a");

    gsap
      .timeline({
        scrollTrigger: {
          trigger: ".part-2",
          start: "0% 70%",
          end: "50% 50%",
          scrub: true,
        },
      })
      .to(".rounded-div-wrapper", { height: 0, marginTop: 0 });

    gsap
      .timeline({
        scrollTrigger: {
          trigger: ".content-2",
          start: "20% 50%",
          end: "100% 50%",
          scrub: 1,
        },
      })
      .to(".content-2 .text-area-hover h1", { width: "100%" })
      .to(".content-2 .text-area-hover h2", { delay: -0.4, width: "100%" });

    // Other ScrollTrigger timelines (e.g., tl3, tl4) go here...
  }, []);

  return (
    <div id="main">
      <Part1 />
      <Part2 />
      {/* Continue adding other parts (Part4, Part5, etc.) */}
    </div>
  );
};

const Part1 = () => (
  <div className="part-1">
    <div className="content-part-1">
      <Overlay />
    </div>
  </div>
);

const Overlay = () => (
  <div className="overlay-div">
    <h1>Landing Page</h1>
    <div className="scroll-down">
      <h3>SCROLL DOWN</h3>
      <div className="scroll-p">
        <div className="scrolling"></div>
      </div>
    </div>
  </div>
);

const Part2 = () => (
  <div className="part-2">
    <div className="rounded-div-wrapper">
      <div className="rounded-div"></div>
    </div>
    <div className="content-2">
      <div className="text-area">
        <h1>Strategic design solutions</h1> <br />
        <h2>that fuel your bottom line.</h2>
      </div>
      <div className="text-area-hover">
        <h1>Strategic design solutions</h1> <br />
        <h2>that fuel your bottom line.</h2>
      </div>
    </div>
  </div>
);

// Repeat similar structure for Part3, Part4, Part5, etc.

export default Gitdemo2;
