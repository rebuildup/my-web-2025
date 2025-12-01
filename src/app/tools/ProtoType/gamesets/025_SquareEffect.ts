// SquareEffect.ts (テーマ変更対応版)
import gsap from "gsap";
import { CustomEase } from "gsap/all";
import { settings } from "../SiteInterface";

gsap.registerPlugin(CustomEase);

class SquareEffectManager {
  private squareElements: {
    background: HTMLDivElement;
    foreground: HTMLDivElement;
  };
  private isInitialized = false;
  private debugMode = false;

  constructor() {
    if (typeof document === "undefined") {
      throw new Error("SquareEffectManager initialized on server");
    }

    this.squareElements = {
      background: document.createElement("div"),
      foreground: document.createElement("div"),
    };

    this.setupThemeObserver();
  }

  private setupThemeObserver() {
    if (typeof MutationObserver === "undefined" || typeof document === "undefined") return;

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (
          mutation.type === "attributes" &&
          mutation.attributeName === "style" &&
          this.isInitialized
        ) {
          this.updateColors();
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["style"],
    });
  }

  private updateColors() {
    if (!this.isInitialized) return;
    const mainColor = settings.colorTheme.colors.MainColor;
    const accentColor = settings.colorTheme.colors.MainAccent;
    this.squareElements.background.style.border = `4px solid ${mainColor}`;
    this.squareElements.foreground.style.border = `2px solid ${accentColor}`;
  }

  initialize(): boolean {
    if (this.isInitialized) return true;
    if (typeof document === "undefined") return false;

    try {
      const mainColor = settings.colorTheme.colors.MainColor;
      const accentColor = settings.colorTheme.colors.MainAccent;

      this.squareElements.background.id = "square-effect-background";
      this.squareElements.background.style.position = "fixed";
      this.squareElements.background.style.top = "50%";
      this.squareElements.background.style.left = "50%";
      this.squareElements.background.style.width = "50px";
      this.squareElements.background.style.height = "50px";
      this.squareElements.background.style.boxSizing = "border-box";
      this.squareElements.background.style.border = `4px solid ${mainColor}`;
      this.squareElements.background.style.transform = "translate(-50%, -50%) rotate(45deg)";
      this.squareElements.background.style.opacity = "0";
      this.squareElements.background.style.pointerEvents = "none";
      this.squareElements.background.style.zIndex = "9000";

      this.squareElements.foreground.id = "square-effect-foreground";
      this.squareElements.foreground.style.position = "fixed";
      this.squareElements.foreground.style.top = "50%";
      this.squareElements.foreground.style.left = "50%";
      this.squareElements.foreground.style.width = "50px";
      this.squareElements.foreground.style.height = "50px";
      this.squareElements.foreground.style.boxSizing = "border-box";
      this.squareElements.foreground.style.border = `2px solid ${accentColor}`;
      this.squareElements.foreground.style.transform = "translate(-50%, -50%) rotate(45deg)";
      this.squareElements.foreground.style.opacity = "0";
      this.squareElements.foreground.style.pointerEvents = "none";
      this.squareElements.foreground.style.zIndex = "10000";

      if (document.body) {
        document.body.appendChild(this.squareElements.background);
        document.body.appendChild(this.squareElements.foreground);
      } else {
        return false;
      }

      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error("SquareEffect初期化エラー:", error);
      return false;
    }
  }

  triggerEffect(): void {
    if (!this.isInitialized) {
      const success = this.initialize();
      if (!success) return;
    }

    this.updateColors();

    const viewportWidth = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
    const viewportHeight = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);
    const maxSize = Math.sqrt(viewportWidth * viewportWidth + viewportHeight * viewportHeight) * 1.5;

    try {
      this.squareElements.background.style.width = "480px";
      this.squareElements.background.style.height = "480px";
      this.squareElements.foreground.style.width = "420px";
      this.squareElements.foreground.style.height = "420px";

      setTimeout(() => {
        gsap.fromTo(
          this.squareElements.background,
          { width: "480px", height: "480px", opacity: 0.8 },
          {
            width: `${maxSize}px`,
            height: `${maxSize}px`,
            opacity: 0,
            duration: 1.2,
            ease: "power4.out",
            delay: 0.1,
          },
        );

        gsap.fromTo(
          this.squareElements.foreground,
          { width: "420px", height: "420px", opacity: 0.9 },
          {
            width: `${maxSize}px`,
            height: `${maxSize}px`,
            opacity: 0,
            duration: 1,
            ease: "power4.out",
          },
        );
      }, 10);
    } catch (error) {
      console.error("SquareEffectアニメーションエラー:", error);
    }
  }

  setDebugMode(enabled: boolean): void {
    this.debugMode = enabled;
    console.log(`SquareEffect: debug ${enabled ? "on" : "off"}`);
  }
}

let squareEffectManager: SquareEffectManager | null = null;
const ensureManager = () => {
  if (squareEffectManager) return squareEffectManager;
  if (typeof document === "undefined") return null;
  squareEffectManager = new SquareEffectManager();
  return squareEffectManager;
};

export function triggerSquareEffect(): void {
  const mgr = ensureManager();
  mgr?.triggerEffect();
}

export function initializeSquareEffect(): boolean {
  const mgr = ensureManager();
  return mgr ? mgr.initialize() : false;
}

export function setSquareEffectDebug(enabled: boolean): void {
  const mgr = ensureManager();
  mgr?.setDebugMode(enabled);
}
