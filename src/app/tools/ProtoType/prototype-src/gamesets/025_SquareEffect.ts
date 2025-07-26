// SquareEffect.ts (テーマ変更対応版)
import gsap from "gsap";
import { CustomEase } from "gsap/all";
import { settings } from "../SiteInterface";

// gsapプラグインの登録
gsap.registerPlugin(CustomEase);

/**
 * カラーテーマ変更に対応した正方形エフェクトマネージャー
 */
class SquareEffectManager {
  private squareElements: {
    background: HTMLDivElement; // 太い線のバックグラウンド正方形（MainColor）
    foreground: HTMLDivElement; // 細い線のフォアグラウンド正方形（MainAccent）
  };

  private isInitialized = false;
  private debugMode = false; // デバッグモード

  constructor() {
    // 初期化時に要素を作成
    this.squareElements = {
      background: document.createElement("div"),
      foreground: document.createElement("div"),
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

    const mainColor = settings.colorTheme.colors.MainColor;
    const accentColor = settings.colorTheme.colors.MainAccent;

    // 背景正方形（MainColor）
    this.squareElements.background.style.border = `4px solid ${mainColor}`;

    // 前景正方形（MainAccent）
    this.squareElements.foreground.style.border = `2px solid ${accentColor}`;

    if (this.debugMode) {
      console.log("SquareEffect: 色を更新しました", { mainColor, accentColor });
    }
  }

  /**
   * 正方形エフェクトの初期化
   */
  initialize(): boolean {
    if (this.isInitialized) {
      return true;
    }

    try {
      // テーマカラーを取得
      const mainColor = settings.colorTheme.colors.MainColor;
      const accentColor = settings.colorTheme.colors.MainAccent;

      if (this.debugMode) {
        console.log("SquareEffect: 初期化開始", { mainColor, accentColor });
      }

      // 背景正方形（MainColor - 太めの線）
      this.squareElements.background.id = "square-effect-background";
      this.squareElements.background.style.position = "fixed";
      this.squareElements.background.style.top = "50%";
      this.squareElements.background.style.left = "50%";
      this.squareElements.background.style.width = "50px";
      this.squareElements.background.style.height = "50px";
      this.squareElements.background.style.boxSizing = "border-box";
      this.squareElements.background.style.border = `4px solid ${mainColor}`;
      this.squareElements.background.style.transform =
        "translate(-50%, -50%) rotate(45deg)";
      this.squareElements.background.style.opacity = "0";
      this.squareElements.background.style.pointerEvents = "none";
      this.squareElements.background.style.zIndex = "9000"; // キャンバスの後ろだが、他の要素より前

      // 前景正方形（MainAccent - 細めの線）
      this.squareElements.foreground.id = "square-effect-foreground";
      this.squareElements.foreground.style.position = "fixed";
      this.squareElements.foreground.style.top = "50%";
      this.squareElements.foreground.style.left = "50%";
      this.squareElements.foreground.style.width = "50px";
      this.squareElements.foreground.style.height = "50px";
      this.squareElements.foreground.style.boxSizing = "border-box";
      this.squareElements.foreground.style.border = `2px solid ${accentColor}`;
      this.squareElements.foreground.style.transform =
        "translate(-50%, -50%) rotate(45deg)";
      this.squareElements.foreground.style.opacity = "0";
      this.squareElements.foreground.style.pointerEvents = "none";
      this.squareElements.foreground.style.zIndex = "10000"; // キャンバスの手前

      // DOMに追加
      if (document.body) {
        document.body.appendChild(this.squareElements.background);
        document.body.appendChild(this.squareElements.foreground);
        if (this.debugMode) {
          console.log("SquareEffect: DOM要素を追加しました");
        }
      } else {
        console.error("SquareEffect: document.bodyが存在しません");
        return false;
      }

      this.isInitialized = true;
      if (this.debugMode) {
        console.log("SquareEffect: 初期化完了");
      }
      return true;
    } catch (error) {
      console.error("SquareEffect初期化エラー:", error);
      return false;
    }
  }

  /**
   * 正方形エフェクトの実行
   */
  triggerEffect(): void {
    if (!this.isInitialized) {
      const success = this.initialize();
      if (!success) {
        console.error(
          "SquareEffect: 初期化に失敗したためエフェクトを実行できません",
        );
        return;
      }
    }

    // トリガー時に最新の色を取得して更新
    this.updateColors();

    // 画面サイズを取得
    const viewportWidth = Math.max(
      document.documentElement.clientWidth || 0,
      window.innerWidth || 0,
    );
    const viewportHeight = Math.max(
      document.documentElement.clientHeight || 0,
      window.innerHeight || 0,
    );

    // 対角線の長さを計算（ピタゴラスの定理）
    const maxSize =
      Math.sqrt(
        viewportWidth * viewportWidth + viewportHeight * viewportHeight,
      ) * 1.5;

    if (this.debugMode) {
      console.log(`SquareEffect: エフェクト実行 (最大サイズ: ${maxSize}px)`);
    }

    try {
      // 背景正方形を一度リセットして確実に表示されるようにする
      this.squareElements.background.style.width = "480px";
      this.squareElements.background.style.height = "480px";

      // 前景正方形も同様にリセット
      this.squareElements.foreground.style.width = "420px";
      this.squareElements.foreground.style.height = "420px";

      // わずかなディレイを入れて確実にDOM更新が反映されるようにする
      setTimeout(() => {
        // 背景正方形のアニメーション（少し遅れて開始、ゆっくり拡大）
        gsap.fromTo(
          this.squareElements.background,
          {
            width: "480px",
            height: "480px",
            opacity: 0.8,
          },
          {
            width: `${maxSize}px`,
            height: `${maxSize}px`,
            opacity: 0,
            duration: 1.2,
            ease: "power4.out",
            delay: 0.1,
            onStart: () => {
              if (this.debugMode)
                console.log("SquareEffect: 背景アニメーション開始");
            },
            onComplete: () => {
              if (this.debugMode)
                console.log("SquareEffect: 背景アニメーション完了");
            },
          },
        );

        // 前景正方形のアニメーション（先に開始、速く拡大）
        gsap.fromTo(
          this.squareElements.foreground,
          {
            width: "420px",
            height: "420px",
            opacity: 0.9,
          },
          {
            width: `${maxSize}px`,
            height: `${maxSize}px`,
            opacity: 0,
            duration: 1,
            ease: "power4.out",
            onStart: () => {
              if (this.debugMode)
                console.log("SquareEffect: 前景アニメーション開始");
            },
            onComplete: () => {
              if (this.debugMode)
                console.log("SquareEffect: 前景アニメーション完了");
            },
          },
        );
      }, 10);
    } catch (error) {
      console.error("SquareEffectアニメーションエラー:", error);
    }
  }

  /**
   * デバッグモードを切り替え
   */
  setDebugMode(enabled: boolean): void {
    this.debugMode = enabled;
    console.log(`SquareEffect: デバッグモード ${enabled ? "有効" : "無効"}`);
  }
}

// シングルトンインスタンス
const squareEffectManager = new SquareEffectManager();

// ゲームから呼び出せる関数
export function triggerSquareEffect(): void {
  squareEffectManager.triggerEffect();
}

// 初期化関数
export function initializeSquareEffect(): boolean {
  return squareEffectManager.initialize();
}

// デバッグ用
export function setSquareEffectDebug(enabled: boolean): void {
  squareEffectManager.setDebugMode(enabled);
}
