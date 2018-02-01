import { Engine } from "../engine";

let animate = null;
let tick = null;
/*
Base class for all prototypes.
Any prototype instance will hook into the canvas and document. 
*/
export abstract class Prototype
{
    private me:Prototype;
    private time = 0;
    engine:Engine;

    constructor()
    {
        this.me = this;
        this.engine = new Engine();
        animate = this.animate.bind(this);
        window.requestAnimationFrame(animate);
        tick = (tick, delta)=>this.tick(tick, delta);
    }

    private animate(now:any)
    {
        let frametime = now - this.time;
        if (frametime > 500)
            frametime = 500;
        else if (frametime < 2)
            frametime = 2;
        this.time += frametime;
        let delta = frametime / 1000;
        this.engine.animate(this.time, delta, tick);
        
        window.requestAnimationFrame(animate);
    }

    abstract tick(time:number, delta:number);
}