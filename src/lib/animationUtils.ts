// src/lib/animationUtils.ts
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";

// Register plugins
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// Enhanced button hover animation
export const enhancedButtonHover = (button: HTMLElement) => {
  const tl = gsap.timeline({ paused: true });

  // Scale and shadow effect
  tl.to(button, {
    scale: 1.05,
    boxShadow: "0 10px 25px rgba(0, 0, 0, 0.15)",
    duration: 0.3,
    ease: "power2.out",
  });

  // Add the event listeners
  button.addEventListener("mouseenter", () => tl.play());
  button.addEventListener("mouseleave", () => tl.reverse());

  return () => {
    // Cleanup function
    button.removeEventListener("mouseenter", () => tl.play());
    button.removeEventListener("mouseleave", () => tl.reverse());
  };
};

// Card hover animation
export const cardHoverEffect = (card: HTMLElement) => {
  const tl = gsap.timeline({ paused: true });

  // Elevation effect
  tl.to(card, {
    y: -8,
    boxShadow:
      "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
    duration: 0.4,
    ease: "power3.out",
  });

  // If there's an icon inside the card, animate it too
  const icon = card.querySelector(".card-icon");
  if (icon) {
    tl.to(
      icon,
      {
        scale: 1.1,
        color: "#0075ff", // primary-500
        duration: 0.3,
        ease: "power2.out",
      },
      "-=0.4"
    ); // Overlap with the card animation
  }

  // Add the event listeners
  card.addEventListener("mouseenter", () => tl.play());
  card.addEventListener("mouseleave", () => tl.reverse());

  return () => {
    // Cleanup function
    card.removeEventListener("mouseenter", () => tl.play());
    card.removeEventListener("mouseleave", () => tl.reverse());
  };
};

// Page transition animation
export const pageTransition = (container: HTMLElement) => {
  // Initial state
  gsap.set(container, { opacity: 0, y: 20 });

  // Animation
  gsap.to(container, {
    opacity: 1,
    y: 0,
    duration: 0.6,
    ease: "power2.out",
  });
};

// Staggered items animation
export const staggerElements = (
  elements: HTMLElement[],
  delay: number = 0.1
) => {
  gsap.from(elements, {
    opacity: 0,
    y: 20,
    stagger: delay,
    duration: 0.5,
    ease: "power2.out",
  });
};

// Section reveal animation
export const revealSection = (section: HTMLElement) => {
  ScrollTrigger.create({
    trigger: section,
    start: "top 80%",
    onEnter: () => {
      gsap.fromTo(
        section,
        { opacity: 0, y: 50 },
        { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }
      );
    },
    once: true,
  });
};

// Text animation with letter splitting
export const animateText = (text: HTMLElement) => {
  // Split the text into words and characters
  const content = text.innerHTML;
  let newContent = "";

  // Simple splitting (a more complex solution might use SplitText plugin)
  content.split(" ").forEach((word, wordIndex) => {
    newContent += `<span class="word word-${wordIndex}" style="display: inline-block; overflow: hidden;">`;

    word.split("").forEach((char, charIndex) => {
      newContent += `<span class="char char-${charIndex}" style="display: inline-block; transform: translateY(100%); opacity: 0;">${char}</span>`;
    });

    newContent += `</span> `;
  });

  text.innerHTML = newContent;

  // Animate the characters
  const chars = text.querySelectorAll(".char");

  gsap.to(chars, {
    y: 0,
    opacity: 1,
    duration: 0.5,
    stagger: 0.02,
    ease: "power3.out",
    scrollTrigger: {
      trigger: text,
      start: "top 80%",
      once: true,
    },
  });
};

// Enhanced initialization for all animations
export const initEnhancedAnimations = () => {
  if (typeof window === "undefined") return;

  // Apply button hover animations to all buttons with the btn class
  const buttons = document.querySelectorAll(".btn, button:not([disabled])");
  buttons.forEach((button) => {
    enhancedButtonHover(button as HTMLElement);
  });

  // Apply card hover animations to all cards
  const cards = document.querySelectorAll(".card");
  cards.forEach((card) => {
    cardHoverEffect(card as HTMLElement);
  });

  // Set up section reveals
  const sections = document.querySelectorAll(".section, section");
  sections.forEach((section) => {
    revealSection(section as HTMLElement);
  });

  // Animate headings
  const headings = document.querySelectorAll(
    "h1.animate-text, h2.animate-text"
  );
  headings.forEach((heading) => {
    animateText(heading as HTMLElement);
  });
};

// Export the hook to initialize animations
export default initEnhancedAnimations;
