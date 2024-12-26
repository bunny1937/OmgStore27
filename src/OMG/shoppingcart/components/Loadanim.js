export const opacity = {
  initial: {
    opacity: 0,
  },
  enter: {
    opacity: 0.75,
    transition: { duration: 2, delay: 0.2 },
  },
};

export const slideUp = {
  initial: {
    top: 0,
  },
  exit: {
    top: "-150vh",
    transition: { duration: 1, ease: [0.76, 0, 0.24, 1], delay: 2.2 },
  },
};
