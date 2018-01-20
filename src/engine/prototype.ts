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
        window.onresize = ()=>this.resize();
        this.resize();
    }

    private resize()
    {
        let w = window.innerWidth;
        let h = window.innerHeight;
        if (w < h)
            h = w;
        else
            w = h;

            console.log(w + "," + h);

            w = 512;
            h= 512;
      //  this.canvas.style.width = w + 'px';
      //  this.canvas.style.height = h + 'px';
      this.canvas.width = w;
      this.canvas.height = h;
    }

    private animate()
    {
        window.requestAnimationFrame(()=>this.animate());
        this.engine.animate((iterations)=>this.tick(iterations));
    }

    abstract tick(iterations:number);
}