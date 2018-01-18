import { Prototype } from "../engine/index";
import { vec2 } from 'gl-matrix';
export default class G0 extends Prototype
{
    constructor()
    {
        super();
        this.engine.loadImage(require("./imgs/space.png"));
        this.engine.loadImage(require("./imgs/cloud.png"));
        this.engine.loadImage(require("./imgs/missile.png"));
        this.engine.loadImage(require("./imgs/block.png"));

        let e = this.engine;
        e.centerText = "";
        e.clearGrid(0);

        let placeCloud = (sx:number, sy:number)=>
        {
            for (let y = 0; y < 2; y++)
                for (let x = 0; x < 2; x++)
                    e.setCell(x+sx, y+sy, 1, x, y);
        }

        placeCloud(3,3);
        placeCloud(8,4);
        placeCloud(13,2);

        this.initRound();
    }

    playerPos:vec2 = vec2.create();

    initRound()
    {
        this.playerPos.set([0, 0]);
        this.engine.setSprite(0, this.playerPos, 3);
    }

    tick(iterations:number)
    {
        let y = this.engine.input.mouse.pos[1];
        if (y < 0) 
            y = 0; 
        else if (y > 16) 
            y = 16;

        this.playerPos.set([this.engine.input.mouse.pos[0], y]);
        this.engine.setSprite(0, this.playerPos, 3);

      /*  let p = vec2.create();
        let x = iterations % 64 / 4;
        let e = this.engine;
        p[0] = x;
        e.setSprite(0, p);*/
    }
}