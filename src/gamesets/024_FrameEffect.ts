// FrameEffect.ts (テーマ変更対応版)
import gsap from "gsap";
import { CustomEase } from "gsap/all";
import { settings } from "../SiteInterface";

// gsapプラグインの登録
gsap.registerPlugin(CustomEase);

/**
 * カラーテーマ変更に対応したフレームエフェクトマネージャー
 */
class FrameEffectManager {
  private frameElements: {
    top: HTMLDivElement;
    right: HTMLDivElement;
    bottom: HTMLDivElement;
    left: HTMLDivElement;
  };
  private isInitialized = false;

  constructor() {
    // 初期化時に要素を作成
    this.frameElements = {
      top: document.createElement("div"),
      right: document.createElement("div"),
      bottom: document.createElement("div"),
      left: document.createElement("div"),
    };

    // テーマ変更を監視するMutationObserverを設定
    this.setupThemeObserver();
  }

  /**
   * テーマ変更を監視してエフェクト色を更新
   */
  private setupThemeObserver() {
    // ルート要素のスタイル変更を監視
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

    // 監視開始
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["style"],
    });
  }

  /**
   * エフェクト要素の色を更新
   */
  private updateColors() {
    if (!this.isInitialized) return;

    const accentColor = settings.colorTheme.colors.MainAccent;

    Object.values(this.frameElements).forEach((el) => {
      el.style.backgroundColor = accentColor;
    });
  }

  /**
   * フレームエフェクトの初期化
   */
  initialize(): boolean {
    if (this.isInitialized) {
      return true;
    }

    try {
      // テーマカラーを取得
      const accentColor = settings.colorTheme.colors.MainAccent;

      // ユニークなIDを各要素に追加
      this.frameElements.top.id = "frame-effect-top";
      this.frameElements.right.id = "frame-effect-right";
      this.frameElements.bottom.id = "frame-effect-bottom";
      this.frameElements.left.id = "frame-effect-left";

      // 共通スタイル
      const applyCommonStyles = (el: HTMLDivElement) => {
        el.style.position = "fixed";
        el.style.backgroundColor = accentColor;
        el.style.pointerEvents = "none";
        el.style.zIndex = "9999";
        el.style.opacity = "0"; // 常に非表示で初期化
        el.style.transformOrigin = "center";
      };

      // 各フレーム要素のスタイル設定
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

      // DOMに追加
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

  /**
   * フレームエフェクトの実行
   */
  triggerEffect(): void {
    if (!this.isInitialized) {
      const success = this.initialize();
      if (!success) {
        return;
      }
    }

    // トリガー時に最新の色を取得して更新
    this.updateColors();

    // 共通のアニメーション設定
    const maxExpansion = 100;
    const duration = 0.8;
    const easing = "power2.out";
    const opacity = 0.8;

    try {
      // 上フレームのアニメーション
      gsap.fromTo(
        this.frameElements.top,
        {
          y: 0,
          opacity: opacity,
          scale: 1,
        },
        {
          y: -maxExpansion,
          opacity: 0,
          scale: 2,
          duration: duration,
          ease: easing,
        },
      );

      // 右フレームのアニメーション
      gsap.fromTo(
        this.frameElements.right,
        {
          x: 0,
          opacity: opacity,
          scale: 1,
        },
        {
          x: maxExpansion,
          opacity: 0,
          scale: 2,
          duration: duration,
          ease: easing,
        },
      );

      // 下フレームのアニメーション
      gsap.fromTo(
        this.frameElements.bottom,
        {
          y: 0,
          opacity: opacity,
          scale: 1,
        },
        {
          y: maxExpansion,
          opacity: 0,
          scale: 2,
          duration: duration,
          ease: easing,
        },
      );

      // 左フレームのアニメーション
      gsap.fromTo(
        this.frameElements.left,
        {
          x: 0,
          opacity: opacity,
          scale: 1,
        },
        {
          x: -maxExpansion,
          opacity: 0,
          scale: 2,
          duration: duration,
          ease: easing,
        },
      );
    } catch (error) {
      console.error("フレームアニメーションエラー:", error);
    }
  }
}

// シングルトンインスタンス
const frameEffectManager = new FrameEffectManager();

// ゲームから呼び出せる関数
export function triggerFrameEffect(): void {
  frameEffectManager.triggerEffect();
}

// 初期化関数
export function initializeFrameEffect(): boolean {
  return frameEffectManager.initialize();
}
