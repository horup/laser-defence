import { vec2 } from "gl-matrix";

export enum ThingType
{
    UNKNOWN,
    PLAYER,
    ENEMY,
    BEAM
}

export enum ThingVariant
{
    UNKNOWN,
    PLAYER,
    SMALLUFO,
    BIGUFO,
    PLAYERBEAM,
    UFOBEAM
}


let nextId = 0;
interface Resetable
{
    valid:boolean;
    reset();
}

export class Thing implements Resetable
{
    id:number;
    owner:number;
    type:ThingType = ThingType.UNKNOWN;
    variant:ThingVariant = ThingVariant.UNKNOWN;
    p:vec2 = vec2.create();
    v:vec2 = vec2.create();
    r:number = 1.0;
    valid = false;

    cooldown = 0;

    constructor()
    {
        this.reset();
    }
    
    reset()
    {
        this.id = nextId++;
        this.owner = null;
        this.p.set([0,0]);
        this.v.set([0,0]);
        this.r = 1.0;
        this.valid = false;
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
    timer = 0;
    maxThings = 100;
    things:Container<Thing>;
    constructor()
    {
        this.things = new Container<Thing>(this.maxThings, Thing);
    }
}