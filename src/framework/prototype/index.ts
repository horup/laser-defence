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
        this.time = now;
        let delta = frametime / 1000;
        
        this.engine.animate(now, delta, tick);
        console.log(this.engine.animate);
        
        window.requestAnimationFrame(this.animate);
    }

    abstract tick(time:number, delta:number);
}