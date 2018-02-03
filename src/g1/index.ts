import { Prototype } from "../framework";
import { Insights } from "../framework";
import { vec2 } from 'gl-matrix';
import { Shufflebag } from "../framework";
/*

let dropped = 0;
let last = 0;
function animate(now:number) 
{
    if (last == 0)
        last = now;
        
    let frametime = now - last;
    if (frametime > 17)
    {
        dropped++;
        document.body.innerText = dropped + " - " + frametime;
    }

    last = now;
    window.requestAnimationFrame(animate);
}

window.requestAnimationFrame(animate);


export default class G1
{

}*/


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
        
        e.loadImage(require("./imgs/1.png"));
        e.loadImage(require("./imgs/2.png"));
        e.loadImage(require("./imgs/3.png"));
        e.loadImage(require("./imgs/4.png"));
        e.loadImage(require("./imgs/5.png"));
        e.loadImage(require("./imgs/6.png"));
        e.loadImage(require("./imgs/7.png"));
        e.loadImage(require("./imgs/8.png"));
        e.loadImage(require("./imgs/9.png"));
        e.loadImage(require("./imgs/10.png"));
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
    c = 0;
    tick(time:number, delta:number)
    {
        let frametime = delta * 1000;
        if (frametime > 20)
        {
            this.c++;
            this.engine.state.centerTopText = this.c + " - " + Math.floor(frametime);
        }

        let index = 0;
        let e = this.engine;
        let speed = 5 * delta;
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