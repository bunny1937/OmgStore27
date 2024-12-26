// import React, { useEffect } from "react";
// import { gsap } from "gsap";

// import { ScrollTrigger } from "gsap/ScrollTrigger";
// import "./Gsap.css"; // Ensure this file contains your provided CSS

// const Gsap = () => {
//   useEffect(() => {
//     // Register GSAP plugins
//     gsap.registerPlugin(ScrollTrigger);

//     // Initialize ScrollSmoother
//     const smoother = ScrollSmoother.create({
//       wrapper: "#wrapper",
//       content: "#gsap-content",
//       smooth: 1,
//       normalizeScroll: true,
//       ignoreMobileResize: true,
//       effects: true,
//       preventDefault: true,
//     });

//     // Set initial animation state for the heading
//     gsap.set(".gsap-heading", {
//       yPercent: -150,
//       opacity: 1,
//     });

//     // Split text animation
//     const mySplitText = new SplitText("#split-stagger", {
//       type: "words,chars",
//     });
//     const chars = mySplitText.chars;

//     chars.forEach((char, i) => {
//       smoother.effects(char, { speed: 1, lag: (i + 1) * 0.1 });
//     });

//     return () => {
//       // Cleanup GSAP animations
//       smoother.kill();
//       mySplitText.revert();
//     };
//   }, []);

//   return (
//     <div id="wrapper">
//       <section id="gsap-content">
//         <div className="gsap-heading" aria-hidden="true">
//           <p>smooooth</p>
//           <div className="text-container">
//             <p>scrolling</p>
//             <p data-speed="0.95">scrolling</p>
//             <p data-speed="0.9">scrolling</p>
//             <p data-speed="0.85">scrolling</p>
//             <p data-speed="0.8">scrolling</p>
//             <p data-speed="0.75">scrolling</p>
//             <p data-speed="0.7">scrolling</p>
//           </div>
//         </div>

//         <section className="image-grid container">
//           <div className="image_cont" data-speed="1">
//             <img
//               data-speed="auto"
//               src="https://images.unsplash.com/photo-1556856425-366d6618905d?ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTV8fG5lb258ZW58MHx8MHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=60"
//               alt=""
//             />
//           </div>
//           <div className="image_cont" data-speed="1.7">
//             <img
//               data-speed="auto"
//               src="https://images.unsplash.com/photo-1520271348391-049dd132bb7c?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80"
//               alt=""
//             />
//           </div>
//           <div className="image_cont" data-speed="1.5">
//             <img
//               data-speed="auto"
//               src="https://images.unsplash.com/photo-1609166214994-502d326bafee?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80"
//               alt=""
//             />
//           </div>
//         </section>

//         <section className="title container flow--lg">
//           <h1>
//             <span className="eyebrow" aria-hidden="true">
//               with{" "}
//             </span>
//             GSAP scrollsmoother
//           </h1>
//           <p>
//             Seamlessly integrated with GSAP and ScrollTrigger. Leveraging native
//             scrolling - no "fake" scrollbars or event hijacking.
//           </p>
//         </section>

//         <section className="bars container">
//           <div className="bars-text">
//             <div className="flow content">
//               <h2>Speed Control</h2>
//               <p>
//                 Animate elements along at different speeds, slow them down or
//                 make them whizz past.
//               </p>
//             </div>
//           </div>

//           <div className="bars-cont">
//             <div className="bar" data-speed="0.8">
//               <p>0.8</p>
//             </div>

//             <div className="bar" data-speed="0.9">
//               <p>0.9</p>
//             </div>

//             <div className="bar" data-speed="1">
//               <p>1</p>
//             </div>

//             <div className="bar" data-speed="1.1">
//               <p>1.1</p>
//             </div>

//             <div className="bar" data-speed="1.2">
//               <p>1.2</p>
//             </div>
//           </div>
//         </section>

//         <section className="v-center">
//           <div className="parallax-slab">
//             <img
//               data-speed="auto"
//               src="https://assets.codepen.io/756881/smoothscroller-1.jpg"
//               alt=""
//             />
//           </div>
//         </section>

//         <section className="staggered container">
//           <div className="staggered_text">
//             <div className="flow content">
//               <h2>Add some lag (the good kind!)</h2>
//               <p>
//                 loosen the connection to the scroll to give a feeling of 'follow
//                 through.'
//               </p>
//             </div>
//           </div>

//           <div className="staggered_demo">
//             <h3 id="split-stagger">stagger...</h3>
//           </div>
//         </section>

//         <section className="parallax-images container">
//           <div className="parallax-text">
//             <div className="flow content">
//               <h2>Easy parallax image effects</h2>
//               <p>
//                 Pop your images in a container with overflow hidden, size them a
//                 little larger than the container and set data-speed to auto.
//                 GSAP does the rest.
//               </p>
//             </div>
//           </div>

//           <div className="image_cont">
//             <img
//               data-speed="auto"
//               src="https://assets.codepen.io/756881/neon3.jpg"
//               alt=""
//             />
//           </div>
//           <div className="image_cont">
//             <img
//               data-speed="auto"
//               src="https://assets.codepen.io/756881/neon2.jpg"
//               alt=""
//             />
//           </div>
//         </section>

//         <section className="spacer"></section>
//       </section>
//     </div>
//   );
// };

// export default Gsap;
