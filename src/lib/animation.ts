import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";

// Register plugins
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// Fade in animation
export const fadeIn = (
  element: HTMLElement,
  delay: number = 0,
  duration: number = 0.6
) => {
  gsap.fromTo(
    element,
    {
      opacity: 0,
      y: 20,
    },
    {
      opacity: 1,
      y: 0,
      duration,
      delay,
      ease: "power2.out",
    }
  );
};

// Fade in from left
export const fadeInLeft = (
  element: HTMLElement,
  delay: number = 0,
  duration: number = 0.6
) => {
  gsap.fromTo(
    element,
    {
      opacity: 0,
      x: -50,
    },
    {
      opacity: 1,
      x: 0,
      duration,
      delay,
      ease: "power2.out",
    }
  );
};

// Stagger animation for multiple elements
export const staggerFadeIn = (
  elements: HTMLElement[],
  delay: number = 0,
  stagger: number = 0.1
) => {
  gsap.fromTo(
    elements,
    {
      opacity: 0,
      y: 20,
    },
    {
      opacity: 1,
      y: 0,
      duration: 0.6,
      delay,
      stagger,
      ease: "power2.out",
    }
  );
};

// Scroll trigger animation
export const animateOnScroll = (
  element: HTMLElement,
  animation: string = "fadeIn"
) => {
  const animations: { [key: string]: () => void } = {
    fadeIn: () => {
      ScrollTrigger.create({
        trigger: element,
        start: "top 80%",
        onEnter: () => fadeIn(element),
        once: true,
      });
    },
    fadeInLeft: () => {
      ScrollTrigger.create({
        trigger: element,
        start: "top 80%",
        onEnter: () => fadeInLeft(element),
        once: true,
      });
    },
  };

  if (animations[animation]) {
    animations[animation]();
  } else {
    animations.fadeIn();
  }
};

// Button hover animation
export const buttonHoverAnimation = (button: HTMLElement) => {
  button.addEventListener("mouseenter", () => {
    gsap.to(button, {
      scale: 1.05,
      duration: 0.3,
      ease: "power1.out",
    });
  });

  button.addEventListener("mouseleave", () => {
    gsap.to(button, {
      scale: 1,
      duration: 0.3,
      ease: "power1.out",
    });
  });
};

// Export a hook to initialize animations
export const initAnimations = () => {
  if (typeof window === "undefined") return;

  // Initialize button hover animations
  const buttons = document.querySelectorAll(".btn");
  buttons.forEach((button) => {
    buttonHoverAnimation(button as HTMLElement);
  });

  // Initialize scroll animations
  const fadeElements = document.querySelectorAll(".animate-fade-in");
  fadeElements.forEach((element) => {
    animateOnScroll(element as HTMLElement, "fadeIn");
  });

  const fadeLeftElements = document.querySelectorAll(".animate-fade-in-left");
  fadeLeftElements.forEach((element) => {
    animateOnScroll(element as HTMLElement, "fadeInLeft");
  });
};
