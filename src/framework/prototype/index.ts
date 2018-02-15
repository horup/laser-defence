import { Engine } from "../engine";
import { Ads } from "../ads/index";

/*
Base class for all prototypes.
Any prototype instance will hook into the canvas and document. 
*/
export abstract class Prototype
{
    private me:Prototype;
    private time = 0;
    engine:Engine;
    ads:Ads;

    constructor()
    {
        this.me = this;
        this.engine = new Engine((time, delta)=>this.tick(time,delta));
        this.ads = new Ads();
    }

    abstract tick(time:number, delta:number);
}