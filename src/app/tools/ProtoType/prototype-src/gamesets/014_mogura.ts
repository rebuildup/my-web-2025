import * as PIXI from "pixi.js";
import gsap from "gsap";
import { PixiPlugin } from "gsap/PixiPlugin";
import { CustomEase } from "gsap/all";
gsap.registerPlugin(PixiPlugin, CustomEase);
import { replaceHash } from "./001_game_master";

import { settings } from "../SiteInterface";
export function GM_start(app: PIXI.Application): Promise<void> {
  return new Promise(async (resolve) => {
    const GM_start_container = new PIXI.Container();
    const tl = gsap.timeline();
    CustomEase.create("slideOutEase", "M0,0 C1.0,0 0.0,1 1,1");

    {
      const inner_circle = new PIXI.Graphics();
      inner_circle.circle(0, 0, 633).stroke({
        width: 123,
        color: replaceHash(settings.colorTheme.colors.MainColor),
      });
      inner_circle.x = app.screen.width / 2;
      inner_circle.y = app.screen.height / 2;
      inner_circle.alpha = 0;
      tl.to(inner_circle, { alpha: 0.37, duration: 0 }, 0.7);
      tl.to(
        inner_circle.scale,
        {
          x: 0,
          y: 0,
          duration: 0.73,
          ease: CustomEase.create("custom", "M0,0 C0,1 1,0 1,1"),
        },
        0.53
      );
      GM_start_container.addChild(inner_circle);
    }
    {
      const outer_circle = new PIXI.Graphics();
      outer_circle.circle(0, 0, 630).stroke({
        width: 123,
        color: replaceHash(settings.colorTheme.colors.MainColor),
      });
      outer_circle.x = app.screen.width / 2;
      outer_circle.y = app.screen.height / 2;
      outer_circle.alpha = 0;
      GM_start_container.addChild(outer_circle);
      tl.to(outer_circle, { alpha: 1, duration: 0 }, 0.4).to(
        outer_circle,
        { alpha: 0, duration: 0 },
        0.6
      );
    }

    {
      const line_circle = new PIXI.Graphics();
      line_circle.circle(0, 0, 455).stroke({
        width: 12,
        color: replaceHash(settings.colorTheme.colors.MainAccent),
      });
      line_circle.x = app.screen.width / 2;
      line_circle.y = app.screen.height / 2;
      line_circle.alpha = 1;
      tl.to(
        line_circle.scale,
        {
          x: 0.84,
          y: 0.84,
          duration: 1.3,
          ease: CustomEase.create("custom", "M0,0 C0,0.2 0.3,1 1,1"),
        },
        -0.27
      ).to(
        line_circle.scale,
        {
          x: 0,
          y: 0,
          duration: 0.33,
          ease: CustomEase.create("custom", "M0,0 C1,0.06 0.9,0.7 1,1"),
        },
        1.03
      );
      GM_start_container.addChild(line_circle);
    }

    {
      const inner_rect_inst = new PIXI.Graphics();
      inner_rect_inst.rect(-365, -365, 730, 730).stroke({
        width: 120,
        color: replaceHash(settings.colorTheme.colors.MainAccent),
      });
      inner_rect_inst.x = app.screen.width / 2;
      inner_rect_inst.y = app.screen.height / 2;
      inner_rect_inst.rotation = Math.PI / 4;
      inner_rect_inst.alpha = 0;
      tl.fromTo(
        inner_rect_inst,
        { alpha: 0 },
        { alpha: 0.8, duration: 0 },
        0.07
      ).to(inner_rect_inst, { alpha: 0, duration: 0 }, 0.37);
      GM_start_container.addChild(inner_rect_inst);
    }

    {
      const inner_rect = new PIXI.Graphics();
      inner_rect.rect(-365, -365, 730, 730).stroke({
        width: 120,
        color: replaceHash(settings.colorTheme.colors.MainAccent),
      });
      inner_rect.x = app.screen.width / 2;
      inner_rect.y = app.screen.height / 2;
      inner_rect.rotation = Math.PI / 4;
      inner_rect.alpha = 0;
      GM_start_container.addChild(inner_rect);
      tl.fromTo(inner_rect, { alpha: 0 }, { alpha: 0.8, duration: 0 }, 0.37);
      tl.fromTo(
        inner_rect.scale,
        { x: 1, y: 1 },
        {
          x: 0,
          y: 0,
          duration: 0.73,
          ease: CustomEase.create("custom", "M0,0 C0,1 1,0 1,1"),
        },
        0.37
      );
    }

    {
      const outer_rect = new PIXI.Graphics();
      outer_rect.rect(-510, -510, 1020, 1020).stroke({
        width: 123,
        color: replaceHash(settings.colorTheme.colors.MainAccent),
      });
      outer_rect.rotation = Math.PI / 4;
      outer_rect.x = app.screen.width / 2;
      outer_rect.y = app.screen.height / 2;
      outer_rect.alpha = 0;
      GM_start_container.addChild(outer_rect);
      tl.to(outer_rect, { alpha: 1, duration: 0 }, 0.4);
      tl.to(
        outer_rect.scale,
        {
          x: 1.36,
          y: 1.36,
          duration: 0.7,
          ease: CustomEase.create("custom", "M0,0 C0,0.7 0.1,1 1,1"),
        },
        0.4
      ).to(
        outer_rect.scale,
        {
          x: 2.17,
          y: 2.17,
          duration: 0.3,
          ease: CustomEase.create("custom", "M0,0 C0,0.7 0.1,1 1,1"),
        },
        1.03
      );
    }
    {
      const star_inst = new PIXI.Graphics();
      star_inst.x = app.screen.width / 2;
      star_inst.y = app.screen.height / 2;

      star_inst.moveTo(0, -600);
      star_inst
        .quadraticCurveTo(0, 0, 600, 0)
        .quadraticCurveTo(0, 0, 0, 600)
        .quadraticCurveTo(0, 0, -600, 0)
        .quadraticCurveTo(0, 0, 0, -600)
        .fill(replaceHash(settings.colorTheme.colors.MainAccent));

      star_inst.scale = 3;
      GM_start_container.addChild(star_inst);
      setTimeout(() => {
        GM_start_container.removeChild(star_inst);
      }, 167);
    }
    {
      setTimeout(() => {
        const star = new PIXI.Graphics();
        star.x = app.screen.width / 2;
        star.y = app.screen.height / 2;
        star.moveTo(0, -600);
        star
          .quadraticCurveTo(0, 0, 600, 0)
          .quadraticCurveTo(0, 0, 0, 600)
          .quadraticCurveTo(0, 0, -600, 0)
          .quadraticCurveTo(0, 0, 0, -600)
          .fill(replaceHash(settings.colorTheme.colors.MainAccent));
        GM_start_container.addChild(star);
        star.alpha = 1;

        const starTl = gsap.timeline();
        starTl
          .to(
            star.scale,
            {
              x: 0.6,
              y: 0.6,
              duration: 0.1,
              ease: CustomEase.create("custom", "M0,0 C0,1 0.1,1 1,1"),
            },
            0
          )
          .to(
            star.scale,
            {
              x: 0.1,
              y: 0.1,
              duration: 0.47,
              ease: CustomEase.create("custom", "M0,0 C0,1 0.1,1 1,1"),
            },
            0.1
          )
          .to(
            star.scale,
            {
              x: 0,
              y: 0,
              duration: 0.27,
              ease: CustomEase.create("custom", "M0,0 C0,1 0.1,1 1,1"),
            },
            0.63
          );
      }, 433);
    }

    /*
    const waku_inst_rect = new PIXI.Graphics();
    waku_inst_rect.rect(-200, -200, 400, 400).stroke({
      width: 80,
      color: replaceHash(settings.colorTheme.colors.MainAccent),
    });
    waku_inst_rect.x = app.screen.width / 2;
    waku_inst_rect.y = app.screen.height / 2;
    waku_inst_rect.rotation = Math.PI / 4;
    waku_inst_rect.alpha = 0.2;
    GM_start_container.addChild(waku_inst_rect);
    gsap.fromTo(
      waku_inst_rect.scale,
      { x: 2, y: 2 },
      { x: 0.4, y: 0.4, duration: 1, ease: "slideOutEase" }
    );
    gsap.to(waku_inst_rect, {
      alpha: 0,
      duration: 0.05,
      repeat: 3,
      yoyo: true,
      ease: "none",
      delay: 0.5,
    });
    const circle_line = new PIXI.Graphics();
    circle_line.circle(0, 0, 600).stroke({
      width: 60,
      color: replaceHash(settings.colorTheme.colors.MainColor),
    });
    circle_line.x = app.screen.width / 2;
    circle_line.y = app.screen.height / 2;
    circle_line.alpha = 0.5;
    GM_start_container.addChild(circle_line);
    const rect = new PIXI.Graphics();
    rect.rect(-400, -400, 800, 800).stroke({
      width: 120,
      color: replaceHash(settings.colorTheme.colors.MainAccent),
    });
    rect.x = app.screen.width / 2;
    rect.y = app.screen.height / 2;
    rect.rotation = Math.PI / 4;
    rect.alpha = 0.3;
    GM_start_container.addChild(rect);
    const rect_two = new PIXI.Graphics();
    rect_two.rect(-500, -500, 1000, 1000).stroke({
      width: 10,
      color: replaceHash(settings.colorTheme.colors.MainColor),
    });
    rect_two.x = app.screen.width / 2;
    rect_two.y = app.screen.height / 2;
    rect_two.rotation = Math.PI / 4;
    rect_two.alpha = 0.7;
    GM_start_container.addChild(rect_two);

    const rect_three = new PIXI.Graphics();
    rect_three.circle(0, 0, 200).stroke({
      width: 40,
      color: replaceHash(settings.colorTheme.colors.MainAccent),
    });
    rect_three.x = app.screen.width / 2;
    rect_three.y = app.screen.height / 2;
    rect_three.alpha = 0.4;
    GM_start_container.addChild(rect_three);

    const star = new PIXI.Graphics();
    star.x = app.screen.width / 2;
    star.y = app.screen.height / 2;

    star.moveTo(0, -200);
    star
      .quadraticCurveTo(0, 0, 200, 0)
      .quadraticCurveTo(0, 0, 0, 200)
      .quadraticCurveTo(0, 0, -200, 0)
      .quadraticCurveTo(0, 0, 0, -200)
      .fill(replaceHash(settings.colorTheme.colors.MainAccent));
    star.alpha = 0.8;
    GM_start_container.addChild(star);
    const star_two = new PIXI.Graphics();
    star_two.x = app.screen.width / 2 - 300;
    star_two.y = app.screen.height / 2 - 300;

    star_two.moveTo(0, -200);
    star_two
      .quadraticCurveTo(0, 0, 200, 0)
      .quadraticCurveTo(0, 0, 0, 200)
      .quadraticCurveTo(0, 0, -200, 0)
      .quadraticCurveTo(0, 0, 0, -200)
      .stroke({
        width: 4,
        color: replaceHash(settings.colorTheme.colors.MainAccent),
      });
    star_two.alpha = 0.8;
    GM_start_container.addChild(star_two);
    const star_three = new PIXI.Graphics();
    star_three.x = app.screen.width / 2 + 300;
    star_three.y = app.screen.height / 2 - 300;
    star_three.moveTo(0, -200);
    star_three
      .lineTo(58, -58)
      .lineTo(200, 0)
      .lineTo(58, 58)
      .lineTo(0, 200)
      .lineTo(-58, 58)
      .lineTo(-200, 0)
      .lineTo(-58, -58)
      .lineTo(0, -200)
      .fill(replaceHash(settings.colorTheme.colors.MainColor));
    star_three.alpha = 0.8;
    GM_start_container.addChild(star_three);
    
    const scc = new PIXI.Container();
    for (let i = 0; i < 30; i++) {
      const star_four = new PIXI.Graphics();
      star_four.x = i * 60;
      star_four.y = 200;
      star_four.moveTo(0 + 300, -200);
      star_four
        .lineTo(58 + 300, -58)
        .lineTo(200 + 300, 0)
        .lineTo(58 + 300, 58)
        .lineTo(0 + 300, 200)
        .lineTo(-58 + 300, 58)
        .lineTo(-200 + 300, 0)
        .lineTo(-58 + 300, -58)
        .lineTo(0 + 300, -200)
        .stroke({
          width: 8,
          color: replaceHash(settings.colorTheme.colors.MainAccent),
        });
      star_four.alpha = 0.8;
      star_four.scale = 0.2;
      star_four.rotation = (Math.PI / 30) * i;
      scc.addChild(star_four);
    }
    GM_start_container.addChild(scc);
     
   const graphics = new PIXI.Graphics();

    // Set line style: thickness, color and alpha
    graphics.stroke({
      width: 8,
      color: replaceHash(settings.colorTheme.colors.MainAccent),
    });

    // Add the graphics object to the stage
    GM_start_container.addChild(graphics);
    */
    app.stage.addChild(GM_start_container);
    setTimeout(() => {
      app.stage.removeChild(GM_start_container);
      resolve();
    }, 1300);
  });
}
export function closeScene(
  app: PIXI.Application,
  option: number
): Promise<void> {
  return new Promise(async (resolve) => {
    CustomEase.create("slideOutEase", "M0,0 C1.0,0 0.0,1.33 1,1");
    let arr_dir = { top: 0, right: 0, bottom: 0, left: 0 };
    const arr_offset = 400;
    switch (option) {
      case 0:
        arr_dir.right = arr_offset;
        break;
      case 1:
        arr_dir.right = -arr_offset;
        arr_dir.left = -arr_offset;
        break;
      case 2:
        arr_dir.top = arr_offset;
        arr_dir.bottom = arr_offset;
        break;
      case 3:
        arr_dir.top = -arr_offset;
        arr_dir.bottom = -arr_offset;
        break;
    }
    const closeFirst = new PIXI.Graphics();
    closeFirst
      .moveTo(-arr_offset, -arr_offset)
      .lineTo(app.screen.width / 2, -arr_offset + arr_dir.top)
      .lineTo(app.screen.width + arr_offset, -arr_offset)
      .lineTo(
        app.screen.width + arr_dir.right + arr_offset,
        app.screen.height / 2
      )
      .lineTo(app.screen.width + arr_offset, app.screen.height + arr_offset)
      .lineTo(
        app.screen.width / 2,
        app.screen.height + arr_dir.bottom + arr_offset
      )
      .lineTo(-arr_offset, app.screen.height + arr_offset)
      .lineTo(arr_dir.left - arr_offset, app.screen.height / 2)
      .lineTo(-arr_offset, -arr_offset)
      .fill(replaceHash(settings.colorTheme.colors.MainAccent));
    closeFirst.alpha = 0.4;
    closeFirst.position = { x: 0, y: 0 };
    app.stage.addChild(closeFirst);

    const closeSecond = new PIXI.Graphics();
    closeSecond
      .moveTo(-arr_offset, -arr_offset)
      .lineTo(app.screen.width / 2, -arr_offset + arr_dir.top)
      .lineTo(app.screen.width + arr_offset, -arr_offset)
      .lineTo(
        app.screen.width + arr_dir.right + arr_offset,
        app.screen.height / 2
      )
      .lineTo(app.screen.width + arr_offset, app.screen.height + arr_offset)
      .lineTo(
        app.screen.width / 2,
        app.screen.height + arr_dir.bottom + arr_offset
      )
      .lineTo(-arr_offset, app.screen.height + arr_offset)
      .lineTo(arr_dir.left - arr_offset, app.screen.height / 2)
      .lineTo(-arr_offset, -arr_offset)
      .fill(replaceHash(settings.colorTheme.colors.MainAccent));
    closeSecond.alpha = 0.9;
    app.stage.addChild(closeSecond);
    switch (option) {
      case 0:
        gsap.fromTo(
          closeFirst,
          { x: -app.screen.width - arr_offset - arr_offset },
          { x: 0, duration: 1.2, ease: "slideOutEase", delay: 0 }
        );

        gsap.fromTo(
          closeSecond,
          { x: -app.screen.width - arr_offset - arr_offset },
          { x: 0, duration: 1.0, ease: "slideOutEase", delay: 0.2 }
        );
        break;
      case 1:
        gsap.fromTo(
          closeFirst,
          { x: app.screen.width + arr_offset + arr_offset },
          { x: 0, duration: 1.2, ease: "slideOutEase", delay: 0 }
        );

        gsap.fromTo(
          closeSecond,
          { x: app.screen.width + arr_offset + arr_offset },
          { x: 0, duration: 1.0, ease: "slideOutEase", delay: 0.2 }
        );
        break;
      case 2:
        gsap.fromTo(
          closeFirst,
          { y: -app.screen.height - arr_offset - arr_offset },
          { y: 0, duration: 1.2, ease: "slideOutEase", delay: 0 }
        );

        gsap.fromTo(
          closeSecond,
          { y: -app.screen.height - arr_offset - arr_offset },
          { y: 0, duration: 1.0, ease: "slideOutEase", delay: 0.2 }
        );
        break;
      case 3:
        gsap.fromTo(
          closeFirst,
          { y: app.screen.height + arr_offset + arr_offset },
          { y: 0, duration: 1.2, ease: "slideOutEase", delay: 0 }
        );

        gsap.fromTo(
          closeSecond,
          { y: app.screen.height + arr_offset + arr_offset },
          { y: 0, duration: 1.0, ease: "slideOutEase", delay: 0.2 }
        );
        break;
    }

    setTimeout(() => {
      app.stage.removeChild(closeFirst);
      app.stage.removeChild(closeSecond);
      resolve();
    }, 750);
  });
}
export function openScene(
  app: PIXI.Application,
  option: number
): Promise<void> {
  return new Promise(async (resolve) => {
    CustomEase.create("slideOutEase", "M0,0 C1.0,0 0.0,1.33 1,1");
    let arr_dir = { top: 0, right: 0, bottom: 0, left: 0 };
    const arr_offset = 400;
    switch (option) {
      case 0:
        arr_dir.right = arr_offset;
        arr_dir.left = arr_offset;
        break;
      case 1:
        arr_dir.right = -arr_offset;
        arr_dir.left = -arr_offset;
        break;
      case 2:
        arr_dir.top = arr_offset;
        arr_dir.bottom = arr_offset;
        break;
      case 3:
        arr_dir.top = -arr_offset;
        arr_dir.bottom = -arr_offset;
        break;
    }
    const openFirst = new PIXI.Graphics();
    openFirst
      .moveTo(-arr_offset, -arr_offset)
      .lineTo(app.screen.width / 2, -arr_offset + arr_dir.top)
      .lineTo(app.screen.width + arr_offset, -arr_offset)
      .lineTo(
        app.screen.width + arr_dir.right + arr_offset,
        app.screen.height / 2
      )
      .lineTo(app.screen.width + arr_offset, app.screen.height + arr_offset)
      .lineTo(
        app.screen.width / 2,
        app.screen.height + arr_dir.bottom + arr_offset
      )
      .lineTo(-arr_offset, app.screen.height + arr_offset)
      .lineTo(arr_dir.left - arr_offset, app.screen.height / 2)
      .lineTo(-arr_offset, -arr_offset)
      .fill(replaceHash(settings.colorTheme.colors.MainAccent));
    openFirst.position = { x: 0, y: 0 };
    openFirst.alpha = 0.4;
    app.stage.addChild(openFirst);
    const openSecond = new PIXI.Graphics();
    openSecond
      .moveTo(-arr_offset, -arr_offset)
      .lineTo(app.screen.width / 2, -arr_offset + arr_dir.top)
      .lineTo(app.screen.width + arr_offset, -arr_offset)
      .lineTo(
        app.screen.width + arr_dir.right + arr_offset,
        app.screen.height / 2
      )
      .lineTo(app.screen.width + arr_offset, app.screen.height + arr_offset)
      .lineTo(
        app.screen.width / 2,
        app.screen.height + arr_dir.bottom + arr_offset
      )
      .lineTo(-arr_offset, app.screen.height + arr_offset)
      .lineTo(arr_dir.left - arr_offset, app.screen.height / 2)
      .lineTo(-arr_offset, -arr_offset)
      .fill(replaceHash(settings.colorTheme.colors.MainAccent));
    openSecond.alpha = 0.9;
    app.stage.addChild(openSecond);
    switch (option) {
      case 0:
        gsap.fromTo(
          openSecond,
          { x: 0 },
          {
            x: app.screen.width + arr_offset,
            duration: 1.2,
            ease: "slideOutEase",
            delay: 0,
          }
        );
        gsap.fromTo(
          openFirst,
          { x: 0 },
          {
            x: app.screen.width + arr_offset,
            duration: 1.0,
            ease: "slideOutEase",
            delay: 0.2,
          }
        );
        break;
      case 1:
        gsap.fromTo(
          openSecond,
          { x: 0 },
          {
            x: -app.screen.width - arr_offset,
            duration: 1.2,
            ease: "slideOutEase",
            delay: 0,
          }
        );
        gsap.fromTo(
          openFirst,
          { x: 0 },
          {
            x: -app.screen.width - arr_offset,
            duration: 1.0,
            ease: "slideOutEase",
            delay: 0.2,
          }
        );
        break;
      case 2:
        gsap.fromTo(
          openSecond,
          { y: 0 },
          {
            y: app.screen.height + arr_offset,
            duration: 1.2,
            ease: "slideOutEase",
            delay: 0,
          }
        );
        gsap.fromTo(
          openFirst,
          { y: 0 },
          {
            y: app.screen.height + arr_offset,
            duration: 1.0,
            ease: "slideOutEase",
            delay: 0.2,
          }
        );

        break;
      case 3:
        gsap.fromTo(
          openSecond,
          { y: 0 },
          {
            y: -app.screen.height - arr_offset,
            duration: 1.2,
            ease: "slideOutEase",
            delay: 0,
          }
        );
        gsap.fromTo(
          openFirst,
          { y: 0 },
          {
            y: -app.screen.height - arr_offset,
            duration: 1.0,
            ease: "slideOutEase",
            delay: 0.2,
          }
        );
        break;
    }

    setTimeout(() => {
      app.stage.removeChild(openFirst);
      app.stage.removeChild(openSecond);
      resolve();
    }, 1200);
  });
}
export function flashObj(
  app: PIXI.Application,
  Obj: PIXI.Text | PIXI.Graphics
) {
  const FlashMask = new PIXI.Graphics();
  FlashMask.rect(0, 0, Obj.width, Obj.height).fill(
    replaceHash(settings.colorTheme.colors.MainAccent)
  );
  FlashMask.x = Obj.x;
  FlashMask.y = Obj.y;
  app.stage.addChild(FlashMask);

  setTimeout(() => {
    app.stage.removeChild(FlashMask);
  }, 100);
}
export function reaction(
  obj: PIXI.Graphics | PIXI.Text,
  ins_scale: number = 1.05
) {
  gsap.fromTo(
    obj.scale,
    { x: ins_scale, y: ins_scale },
    {
      x: 1,
      y: 1,
      duration: 1,
      ease: CustomEase.create("custom", "M0,0 C0.2,1 0.3,1 1,1"),
    }
  );
}
export function reaction_jump(
  obj: PIXI.Graphics | PIXI.Text,
  absolute_y: number
) {
  gsap.fromTo(
    obj,
    { y: absolute_y - 4 },
    {
      y: absolute_y,
      duration: 1,
      ease: CustomEase.create("custom", "M0,0 C0.2,1 0.3,1 1,1"),
    }
  );
}

export function wig_Type(app: PIXI.Application) {
  const CONFIG = {
    // 位置ズレの範囲
    POSITION_JITTER_MIN: -100,
    POSITION_JITTER_MAX: 100,
    // フォントサイズの範囲
    FONT_SIZE_MIN: 160,
    FONT_SIZE_MAX: 350,
    // 透明度の範囲
    OPACITY_MIN: 0.2,
    OPACITY_MAX: 0.6,
    // アニメーション間隔（ミリ秒）
    UPDATE_INTERVAL_MIN: 1600,
    UPDATE_INTERVAL_MAX: 2000,
    // 円の設定
    CIRCLE_RADIUS_MIN: 900, // 最小半径（中心を避けるため）
    CIRCLE_RADIUS_MAX: 900, // 最大半径
    // 余白（画面端からの距離）
    MARGIN: 100,
  };

  const letters = ["P", "r", "o", "t", "o", "T", "y", "p", "e"];
  const textContainer = new PIXI.Container();
  const textObjs: any = [];

  // 各文字の設定と円状配置
  function setupText() {
    const numLetters = letters.length;

    // 円状に配置するための角度計算
    const angleStep = (2 * Math.PI) / numLetters;

    // 画面サイズに基づいて円の最大半径を調整
    const maxPossibleRadius = Math.min(
      app.screen.width / 2 - CONFIG.MARGIN,
      app.screen.height / 2 - CONFIG.MARGIN
    );

    // 設定した最大半径が画面に収まらない場合は調整
    const effectiveMaxRadius = Math.min(
      maxPossibleRadius,
      CONFIG.CIRCLE_RADIUS_MAX
    );

    // 各文字を円周上に配置
    letters.forEach((letter, index) => {
      // ランダムなフォントサイズ
      const randomFontSize = Math.floor(
        CONFIG.FONT_SIZE_MIN +
          Math.random() * (CONFIG.FONT_SIZE_MAX - CONFIG.FONT_SIZE_MIN + 1)
      );

      const textStyle = new PIXI.TextStyle({
        fontFamily: "Arial",
        fontSize: randomFontSize,
        fontWeight: "bold",
        fill: replaceHash(settings.colorTheme.colors.MainColor),
      });

      const textObj = new PIXI.Text(letter, textStyle);

      // 円周上の位置を計算（角度に基づく）
      const angle = index * angleStep;

      // ランダムな半径（最小半径〜最大半径）
      const radiusRange = effectiveMaxRadius - CONFIG.CIRCLE_RADIUS_MIN;
      const radius = CONFIG.CIRCLE_RADIUS_MIN + Math.random() * radiusRange;

      // 円周上の位置を計算
      const x = app.screen.width / 2 + Math.cos(angle) * radius;
      const y = app.screen.height / 2 + Math.sin(angle) * radius;

      textObj.x = x;
      textObj.y = y;
      textObj.anchor.set(0.5);

      // 回転の原点を設定
      textObj.pivot.x = 0;
      textObj.pivot.y = textObj.height / 2;

      // ランダムな初期回転
      textObj.rotation = Math.random() * 0.8 - 0.4;

      // ランダムな透明度
      textObj.alpha =
        CONFIG.OPACITY_MIN +
        Math.random() * (CONFIG.OPACITY_MAX - CONFIG.OPACITY_MIN);

      textContainer.addChild(textObj);
      textObjs.push(textObj);
    });

    app.stage.addChild(textContainer);
  }

  // アニメーションの設定
  function setupAnimation() {
    // 各文字の初期位置を保存
    textObjs.forEach((textObj: any) => {
      textObj.originalX = textObj.x;
      textObj.originalY = textObj.y;
      // 初回のアニメーション開始（各文字ごとにわずかな遅延をつける）
      setTimeout(() => {
        animateLetter(textObj);
      }, Math.random() * 500); // 0〜500msのランダムな遅延で開始
    });
  }

  // 文字をランダムに動かす関数（滑らかなアニメーションなし、即座に位置変更）
  function animateLetter(textObj: any) {
    // ランダムな新しい位置を生成
    const jitterX =
      CONFIG.POSITION_JITTER_MIN +
      Math.random() * (CONFIG.POSITION_JITTER_MAX - CONFIG.POSITION_JITTER_MIN);
    const jitterY =
      CONFIG.POSITION_JITTER_MIN +
      Math.random() * (CONFIG.POSITION_JITTER_MAX - CONFIG.POSITION_JITTER_MIN);

    const newX = textObj.originalX + jitterX;
    const newY = textObj.originalY + jitterY;
    const newRotation = Math.random() * 0.3 - 0.15; // -0.15〜0.15のランダムな回転

    // ランダムなフォントサイズ
    const newFontSize = Math.floor(
      CONFIG.FONT_SIZE_MIN +
        Math.random() * (CONFIG.FONT_SIZE_MAX - CONFIG.FONT_SIZE_MIN + 1)
    );

    // ランダムな透明度
    const newAlpha =
      CONFIG.OPACITY_MIN +
      Math.random() * (CONFIG.OPACITY_MAX - CONFIG.OPACITY_MIN);

    // 即座に位置を変更（アニメーションなし）
    textObj.x = newX;
    textObj.y = newY;
    textObj.rotation = newRotation;
    textObj.alpha = newAlpha;

    // フォントサイズの変更（テキストスタイルを更新）
    textObj.style.fontSize = newFontSize;

    // ランダムな時間間隔で次の位置変更をスケジュール
    const nextUpdateTime =
      CONFIG.UPDATE_INTERVAL_MIN +
      Math.random() * (CONFIG.UPDATE_INTERVAL_MAX - CONFIG.UPDATE_INTERVAL_MIN);

    // 次の位置更新をスケジュール
    setTimeout(() => {
      animateLetter(textObj);
    }, nextUpdateTime);
  }

  // リサイズイベント処理
  window.addEventListener("resize", () => {
    // リサイズ時には再配置が理想的だが、
    // 簡易的な対応として画面中心を基準点として維持
    textContainer.position.set(app.screen.width / 2, app.screen.height / 2);
  });

  // 初期化
  setupText();
  setupAnimation();
}

