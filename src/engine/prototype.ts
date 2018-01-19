import { Engine } from "./engine";


/*
Base class for all prototypes.
Any prototype instance will hook into the canvas and document. 
*/
export abstract class Prototype
{
    private iterations:number = 0;
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
        this.tick(this.iterations);
        this.engine.draw(this.iterations);
        this.iterations++;
    }

    abstract tick(iterations:number);
}