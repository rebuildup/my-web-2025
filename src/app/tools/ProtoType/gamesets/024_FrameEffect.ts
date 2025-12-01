// FrameEffect.ts (テーマ変更対応版)
import gsap from "gsap";
import { CustomEase } from "gsap/all";
import { settings } from "../SiteInterface";

gsap.registerPlugin(CustomEase);

class FrameEffectManager {
  private frameElements: {
    top: HTMLDivElement;
    right: HTMLDivElement;
    bottom: HTMLDivElement;
    left: HTMLDivElement;
  };
  private isInitialized = false;

  constructor() {
    if (typeof document === "undefined") {
      throw new Error("FrameEffectManager initialized on server");
    }

    this.frameElements = {
      top: document.createElement("div"),
      right: document.createElement("div"),
      bottom: document.createElement("div"),
      left: document.createElement("div"),
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
    const accentColor = settings.colorTheme.colors.MainAccent;
    Object.values(this.frameElements).forEach((el) => {
      el.style.backgroundColor = accentColor;
    });
  }

  initialize(): boolean {
    if (this.isInitialized) return true;
    if (typeof document === "undefined") return false;

    try {
      const accentColor = settings.colorTheme.colors.MainAccent;

      const applyCommonStyles = (el: HTMLDivElement) => {
        el.style.position = "fixed";
        el.style.backgroundColor = accentColor;
        el.style.pointerEvents = "none";
        el.style.zIndex = "9999";
        el.style.opacity = "0";
        el.style.transformOrigin = "center";
      };

      applyCommonStyles(this.frameElements.top);
      this.frameElements.top.style.top = "0";
      this.frameElements.top.style.left = "0";
      this.frameElements.top.style.width = "100%";
      this.frameElements.top.style.height = "10px";

      applyCommonStyles(this.frameElements.right);
      this.frameElements.right.style.top = "0";
      this.frameElements.right.style.right = "0";
      this.frameElements.right.style.width = "10px";
      this.frameElements.right.style.height = "100%";

      applyCommonStyles(this.frameElements.bottom);
      this.frameElements.bottom.style.bottom = "0";
      this.frameElements.bottom.style.left = "0";
      this.frameElements.bottom.style.width = "100%";
      this.frameElements.bottom.style.height = "10px";

      applyCommonStyles(this.frameElements.left);
      this.frameElements.left.style.top = "0";
      this.frameElements.left.style.left = "0";
      this.frameElements.left.style.width = "10px";
      this.frameElements.left.style.height = "100%";

      if (document.body) {
        document.body.appendChild(this.frameElements.top);
        document.body.appendChild(this.frameElements.right);
        document.body.appendChild(this.frameElements.bottom);
        document.body.appendChild(this.frameElements.left);
      } else {
        return false;
      }

      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error("FrameEffect初期化エラー:", error);
      return false;
    }
  }

  triggerEffect(): void {
    if (!this.isInitialized) {
      const success = this.initialize();
      if (!success) return;
    }

    this.updateColors();

    const maxExpansion = 100;
    const duration = 0.8;
    const easing = "power2.out";
    const opacity = 0.8;

    try {
      gsap.fromTo(
        this.frameElements.top,
        { y: 0, opacity: opacity, scale: 1 },
        { y: -maxExpansion, opacity: 0, scale: 2, duration: duration, ease: easing },
      );
      gsap.fromTo(
        this.frameElements.right,
        { x: 0, opacity: opacity, scale: 1 },
        { x: maxExpansion, opacity: 0, scale: 2, duration: duration, ease: easing },
      );
      gsap.fromTo(
        this.frameElements.bottom,
        { y: 0, opacity: opacity, scale: 1 },
        { y: maxExpansion, opacity: 0, scale: 2, duration: duration, ease: easing },
      );
      gsap.fromTo(
        this.frameElements.left,
        { x: 0, opacity: opacity, scale: 1 },
        { x: -maxExpansion, opacity: 0, scale: 2, duration: duration, ease: easing },
      );
    } catch (error) {
      console.error("フレームアニメーションエラー:", error);
    }
  }
}

// シングルトンインスタンスを遅延生成（SSRガード）
let frameEffectManager: FrameEffectManager | null = null;
const ensureManager = () => {
  if (frameEffectManager) return frameEffectManager;
  if (typeof document === "undefined") return null;
  frameEffectManager = new FrameEffectManager();
  return frameEffectManager;
};

export function triggerFrameEffect(): void {
  const mgr = ensureManager();
  mgr?.triggerEffect();
}

export function initializeFrameEffect(): boolean {
  const mgr = ensureManager();
  return mgr ? mgr.initialize() : false;
}
