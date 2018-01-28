import { Engine } from "../engine";


/*
Base class for all prototypes.
Any prototype instance will hook into the canvas and document. 
*/
export abstract class Prototype
{
    private time = 0;
    engine:Engine;
    constructor()
    {
        this.engine = new Engine();
        window.requestAnimationFrame(this.animate);
    }

    private animate = (now:any)=>
    {
        let tick = (time,deta)=>this.tick(time,delta);
        let frametime = now - this.time;
        if (frametime > 500)
            frametime = 500;
        else if (frametime < 2)
            frametime = 2;
        this.time += frametime;
        let delta = frametime / 1000;
        
        this.engine.animate(this.time, delta, tick);
        
        window.requestAnimationFrame(this.animate);
    }

    abstract tick(time:number, delta:number);
}