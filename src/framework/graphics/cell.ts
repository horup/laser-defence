export class Cell
{
    imgOffsetX:number = 0;
    imgOffsetY:number = 0;
    sprite:PIXI.Sprite = null;
    constructor(sprite:PIXI.Sprite)
    {
        this.sprite = sprite;
    }
}