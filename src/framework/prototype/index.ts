import { Engine } from "../engine";

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
        this.engine = new Engine((time, delta)=>this.tick(time,delta));
    }

    abstract tick(time:number, delta:number);
}