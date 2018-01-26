import { Engine } from "../engine";


/*
Base class for all prototypes.
Any prototype instance will hook into the canvas and document. 
*/
export abstract class Prototype
{
    engine:Engine;
    constructor()
    {
        this.engine = new Engine();
        setTimeout(()=>this.animate());
    }

    private animate()
    {
        window.requestAnimationFrame(()=>this.animate());
        this.engine.animate((iterations)=>this.tick(iterations));
    }

    abstract tick(iterations:number);
}