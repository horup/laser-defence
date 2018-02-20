import { vec2 } from "gl-matrix";

export enum ThingType
{
    UNKNOWN,
    PLAYER,
    SMALLUFO
}

interface Resetable
{
    valid:boolean;
    reset();
}

export class Thing implements Resetable
{
    type:ThingType = ThingType.UNKNOWN;
    p:vec2 = vec2.create();
    v:vec2 = vec2.create();
    r:number = 1.0;
    valid = false;
    
    reset()
    {
        this.p.set([0,0]);
        this.v.set([0,0]);
        this.r = 1.0;
        this.valid = false;
    }

    static spawn(things:Thing[], x:number, y:number, type:ThingType):Thing
    {
        for (let i = 0; i < things.length; i++)
        {
            let thing = things[i];
            if (!thing.valid)
            {
                thing.valid = true;
                thing.p.set([x,y]);
                return thing;
            }
        }

        return null;
    }
}

export class Container<T extends Resetable>
{
    array:T[];
    constructor(count:number, f:new()=>T)
    {
        this.array = new Array(count);
        for (let i = 0; i < this.array.length; i++)
            this.array[i] = new f;
    }

    spawn()
    {
        for (let i = 0; i < this.array.length; i++)
        {
            let thing = this.array[i];
            if (!thing.valid)
            {
                thing.valid = true;
                return thing;
            }
        }

        return null;
    }

    reset()
    {
        for (let i = 0; i < this.array.length; i++)
        {
            this.array[i].reset();
        }
    }
}

export class Game
{
    maxThings = 100;
    things:Container<Thing>;
    constructor()
    {
        this.things = new Container<Thing>(this.maxThings, Thing);
    }

    newGame()
    {
        this.things.reset();
        let t = this.things.spawn();
        t.p.set([4.5, 14]);
    }
}