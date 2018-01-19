import { Engine } from "./engine";


/*
Base class for all prototypes.
Any prototype instance will hook into the canvas and document. 
*/
export abstract class Prototype
{
    canvas:HTMLCanvasElement;
    engine:Engine;
    constructor()
    {
        this.canvas = document.getElementById("canvas") as HTMLCanvasElement;
        this.engine = new Engine(this.canvas.getContext("2d"));
        setTimeout(()=>this.animate());
    }

    private animate()
    {
        window.requestAnimationFrame(()=>this.animate());
        this.engine.animate((iterations)=>this.tick(iterations));
    }

    abstract tick(iterations:number);
}