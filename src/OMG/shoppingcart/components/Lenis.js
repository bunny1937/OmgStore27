import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ReactLenis } from "lenis/react";

gsap.registerPlugin(ScrollTrigger);

const Lenis = () => {
  const sectionRef = useRef(null);

  useEffect(() => {
    const sections = sectionRef.current.querySelectorAll(".animate");
    sections.forEach((section, index) => {
      gsap.fromTo(
        section,
        { opacity: 0, y: 100 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          delay: index * 0.3,
          scrollTrigger: {
            trigger: section,
            start: "top 80%",
            end: "top 50%",
            scrub: true,
          },
        }
      );
    });
  }, []);

  useEffect(() => {
    gsap.fromTo(
      ".hero-content",
      { y: 100, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, delay: 0.5 }
    );
  }, []);

  return (
    <ReactLenis root>
      {/* Hero Section */}
      <div style={{ height: "100vh" }}>
        <section
          style={{
            height: "100vh",
            position: "relative",
            background: "#d7f7d8",
          }}
        >
          <div className="hero-content" style={{ textAlign: "center" }}>
            <h1 style={{ fontSize: "4rem" }}>Welcome to the Future</h1>
            <p style={{ fontSize: "1.5rem" }}>Scroll down to discover more.</p>
          </div>
        </section>
      </div>

      {/* Scroll Animation Sections */}
      <div ref={sectionRef}>
        <div
          className="animate"
          style={{ height: "100vh", background: "blue" }}
        >
          Section 2
        </div>
        <div
          className="animate"
          style={{ height: "100vh", background: "green" }}
        >
          Section 3
        </div>
      </div>
    </ReactLenis>
  );
};

export default Lenis;
