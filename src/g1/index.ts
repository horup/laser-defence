import { Prototype } from "../framework";
import { Insights } from "../framework";
import { vec2 } from 'gl-matrix';
import { Shufflebag } from "../framework";
import { Game } from "./game";

export default class G1 extends Prototype
{
    game:Game;
    constructor()
    {
        super();
        let e = this.engine;
        this.game = new Game();

        e.loadImage(require("./imgs/ship.png"));
        e.loadImage(require("./imgs/smallufo.png"));
      /*  e.setSprite(0, vec2.clone([3,3]), 1);
        e.setSprite(1, vec2.clone([6,4]), 1);
        e.setSprite(2, vec2.clone([8,3]), 1);


        e.setSprite(3, vec2.clone([5,15]), 0);

        e.setCenterText("READY");*/

        this.game.newGame();
    }

    tick(time:number, delta:number)
    {
        let e = this.engine;
        e.clearSprites();
        let spriteIndex = 0;
        for (let thing of this.game.things.array)
        {
            if (thing.valid)
            {
                e.setSprite(spriteIndex++, thing.p, 0);
            }
        }
    }
}