import * as PIXI from "pixi.js";
import { wig_Type } from "./014_mogura";
//import { closeScene, GM_start, openScene } from "./014_mogura";
let opt = 0;
export function debug_repeat(app: PIXI.Application): Promise<void> {
  return new Promise<void>(async (resolve) => {
    app.stage.removeChildren();
    opt = opt >= 3 ? 0 : opt + 1;
    //await openScene(app, opt);
    //await GM_start(app);
    //await closeScene(app, opt);
    wig_Type(app);
    setTimeout(() => {
      resolve();
    }, 10000);
  });
}
