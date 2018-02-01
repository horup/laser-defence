import { Prototype } from "../framework";
import { Insights } from "../framework";
import { vec2 } from 'gl-matrix';
import { Shufflebag } from "../framework";

class Missile
{
    inUse = false;
    pos:vec2 = vec2.create();
    speed = 0.1;
    reset()
    {
        this.pos[0] = 5;
        this.pos[1] = 3;
        this.inUse = false;
    }
}

export default class G1 extends Prototype
{
    missiles:Missile[] = [];

    constructor()
    {
        super();
        let e = this.engine;
        
        e.loadImage(require("./imgs/missile.png"));
        e.clearGrid(-1);
        let max = 100;
        this.missiles = new Array(max);
        for (let i = 0; i < max; i++)
        {
            this.missiles[i] = new Missile();
            this.missiles[i].reset();
            this.missiles[i].pos[0] = i / max * 9;
            this.missiles[i].pos[1] = i / max;
        }
    }
    first = true;
    tick(time:number, delta:number)
    {
        let index = 0;
        let e = this.engine;
        let speed = 9 * 0.016;
        for (let missile of this.missiles)
        {
            missile.pos[1] += speed;
                e.setSprite(index++, missile.pos, 0);
            
            if (missile.pos[1] > 16)
                missile.pos[1] = 0;
        }

        this.first = false;
    }
}