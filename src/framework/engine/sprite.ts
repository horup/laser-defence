import { vec2 } from "gl-matrix";

export class Sprite
{
    id:number;
    sprite:PIXI.Sprite;
    position:vec2 = vec2.create();

    constructor(id:number, sprite:PIXI.Sprite)
    {
        this.id = id;
        this.sprite = sprite;
        this.clear();
    }

    clear()
    {
        this.sprite.visible = false;
        this.position.set([0,0]);
    }
}