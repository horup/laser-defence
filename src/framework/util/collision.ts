import { vec2 } from "gl-matrix";

interface Rect
{
    p:vec2;
    r:number;
}

export module Collision
{
    export function getCollision(thing:Rect, things:Rect[])
    {
        for (let i = 0; i < things.length; i++)
        {
            if (thing == things[i])
                continue;
                
            let lx1 = thing.p[0] - thing.r / 2;
            let ly1 = thing.p[1] - thing.r / 2;
            let rx1 = lx1 + thing.r;
            let ry1 = ly1 + thing.r;
            
            let lx2 = things[i].p[0] - things[i].r / 2;
            let ly2 = things[i].p[1]  - things[i].r / 2;
            let rx2 = lx2 + things[i].r;
            let ry2 = ly2 + things[i].r;
            
            if (lx1 > rx2 || lx2 > rx1)
                continue;
            if (ly1 > ry2 || ly2 > ry1)
                continue;

            return i;
        }

        return null;
    }
}