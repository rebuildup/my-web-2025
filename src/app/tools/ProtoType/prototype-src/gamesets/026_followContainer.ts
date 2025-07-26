// mouse_follow_container.ts
import * as PIXI from "pixi.js";
import gsap from "gsap";

/**
 * シーンの要素をコンテナに入れ、マウスの動きに引っ張られるようなアニメーションを実装する関数
 *
 * @param app PIXI.Application インスタンス
 * @param elements コンテナに追加する表示オブジェクトの配列
 * @param options 設定オプション
 * @returns 作成されたコンテナ
 */
export function createMouseFollowContainer(
  app: PIXI.Application,
  elements: any[],
  options: {
    maxDistance?: number; // マウスの動きに対する最大移動距離
    easing?: number; // アニメーションのイージング係数（小さいほど遅く追従）
    returnToCenter?: boolean; // マウス移動が止まったとき中心に戻るか
    returnSpeed?: number; // 中心に戻る速度
  } = {},
): PIXI.Container {
  // デフォルト値の設定
  const maxDistance = options.maxDistance || 50;
  const easing = options.easing || 0.1;
  const returnToCenter =
    options.returnToCenter !== undefined ? options.returnToCenter : true;
  const returnSpeed = options.returnSpeed || 0.05;

  // コンテナの作成
  const container = new PIXI.Container();

  // 渡された要素をコンテナに追加
  elements.forEach((element) => {
    container.addChild(element);
  });

  // コンテナの初期位置を保存
  const originalPosition = {
    x: app.screen.width / 2,
    y: app.screen.height / 2,
  };

  // コンテナの中心を画面の中心に配置
  container.position.set(originalPosition.x, originalPosition.y);

  // マウスの現在位置
  let mousePosition = { x: originalPosition.x, y: originalPosition.y };

  // マウスの動きを検知
  app.stage.eventMode = "static";
  app.stage.on("pointermove", (event) => {
    mousePosition = event.global.clone();
  });

  // アニメーションの更新処理
  let lastTimestamp = 0;
  let isMoving = false;
  let lastMousePosition = { x: mousePosition.x, y: mousePosition.y };

  app.ticker.add(() => {
    // マウスが動いているかチェック
    if (
      lastMousePosition.x !== mousePosition.x ||
      lastMousePosition.y !== mousePosition.y
    ) {
      isMoving = true;
      lastMousePosition = { x: mousePosition.x, y: mousePosition.y };
    } else {
      // マウスが停止したとき
      if (isMoving) {
        lastTimestamp = Date.now();
        isMoving = false;
      }
    }

    // マウスの位置と中心点の差分を計算
    const dx = mousePosition.x - originalPosition.x;
    const dy = mousePosition.y - originalPosition.y;

    // 最大移動距離を制限した目標位置
    const targetX =
      originalPosition.x +
      Math.max(-maxDistance, Math.min(maxDistance, dx * 0.2));
    const targetY =
      originalPosition.y +
      Math.max(-maxDistance, Math.min(maxDistance, dy * 0.2));

    if (returnToCenter && !isMoving && Date.now() - lastTimestamp > 500) {
      // マウスが動いていない状態が続いたら中心に戻る
      container.position.x +=
        (originalPosition.x - container.position.x) * returnSpeed;
      container.position.y +=
        (originalPosition.y - container.position.y) * returnSpeed;
    } else {
      // マウスの動きに追従
      container.position.x += (targetX - container.position.x) * easing;
      container.position.y += (targetY - container.position.y) * easing;
    }
  });

  // コンテナを返す
  return container;
}

/**
 * シーンの要素をコンテナに入れ、アニメーション付きでシーンを表示する
 *
 * @param app PIXI.Application インスタンス
 * @param elements コンテナに追加する表示オブジェクトの配列
 * @param options マウス追従の設定オプション
 * @returns 作成されたコンテナとアニメーション完了を示すPromise
 */
export function openMouseFollowScene(
  app: PIXI.Application,
  elements: any[],
  options: {
    maxDistance?: number;
    easing?: number;
    returnToCenter?: boolean;
    returnSpeed?: number;
    entranceAnimation?: "fade" | "scale" | "slide" | "none";
    animationDuration?: number;
  } = {},
): { container: PIXI.Container; animationPromise: Promise<void> } {
  // アニメーション設定
  const entranceAnimation = options.entranceAnimation || "fade";
  const animationDuration = options.animationDuration || 0.5;

  // コンテナを作成
  const container = createMouseFollowContainer(app, elements, options);
  app.stage.addChild(container);

  // 初期状態を設定
  switch (entranceAnimation) {
    case "fade":
      container.alpha = 0;
      break;
    case "scale":
      container.scale.set(0.5);
      container.alpha = 0;
      break;
    case "slide":
      container.position.y += 100;
      container.alpha = 0;
      break;
    case "none":
    default:
      // アニメーションなし
      break;
  }

  // 入場アニメーションの実行
  const animationPromise = new Promise<void>((resolve) => {
    switch (entranceAnimation) {
      case "fade":
        gsap.to(container, {
          alpha: 1,
          duration: animationDuration,
          ease: "power2.out",
          onComplete: resolve,
        });
        break;
      case "scale":
        gsap.to(container, {
          alpha: 1,
          scale: 1,
          duration: animationDuration,
          ease: "back.out(1.7)",
          onComplete: resolve,
        });
        break;
      case "slide":
        gsap.to(container, {
          alpha: 1,
          y: container.position.y - 100,
          duration: animationDuration,
          ease: "power2.out",
          onComplete: resolve,
        });
        break;
      case "none":
      default:
        resolve();
        break;
    }
  });

  return { container, animationPromise };
}

/**
 * マウス追従コンテナを閉じるアニメーション
 *
 * @param container 閉じるコンテナ
 * @param exitAnimation 出口アニメーションタイプ
 * @param animationDuration アニメーション時間
 * @returns アニメーション完了を示すPromise
 */
export function closeMouseFollowScene(
  container: PIXI.Container,
  exitAnimation: "fade" | "scale" | "slide" | "none" = "fade",
  animationDuration: number = 0.5,
): Promise<void> {
  return new Promise<void>((resolve) => {
    switch (exitAnimation) {
      case "fade":
        gsap.to(container, {
          alpha: 0,
          duration: animationDuration,
          ease: "power2.in",
          onComplete: () => {
            container.parent?.removeChild(container);
            resolve();
          },
        });
        break;
      case "scale":
        gsap.to(container, {
          alpha: 0,
          scale: 0.5,
          duration: animationDuration,
          ease: "back.in(1.7)",
          onComplete: () => {
            container.parent?.removeChild(container);
            resolve();
          },
        });
        break;
      case "slide":
        gsap.to(container, {
          alpha: 0,
          y: container.position.y + 100,
          duration: animationDuration,
          ease: "power2.in",
          onComplete: () => {
            container.parent?.removeChild(container);
            resolve();
          },
        });
        break;
      case "none":
      default:
        container.parent?.removeChild(container);
        resolve();
        break;
    }
  });
}
