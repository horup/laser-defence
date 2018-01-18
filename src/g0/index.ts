import { Prototype } from "../engine/index";
import { vec2 } from 'gl-matrix';
export default class G0 extends Prototype
{
    constructor()
    {
        super();
        let spaceId = this.engine.loadImage(require("./space.png"));
        let cloudId = this.engine.loadImage(require("./cloud.png"));
        let missileId = this.engine.loadImage(require("./missile.png"));

        let e = this.engine;
        e.centerText = "";
        e.setGrid(spaceId);

        let placeCloud = (sx:number, sy:number)=>
        {
            for (let y = 0; y < 2; y++)
                for (let x = 0; x < 2; x++)
                    e.setCell(x+sx, y+sy, cloudId, x, y);
        }

        placeCloud(3,3);

        e.setSprite(0, vec2.create(), missileId);

    }

    tick(iterations:number)
    {
        let p = vec2.create();
        let x = iterations % 64 / 4;
        let e = this.engine;
        p[0] = x;
        e.setSprite(0, p);
    }
}