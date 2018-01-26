import { Config } from "./config";
import { Pixi } from "./pixi";
import { Input } from "./input";
import { State } from "./state";
import { vec2 } from "gl-matrix";
import * as SAT from "sat";

export class Engine
{
    config:Config;
    pixi:Pixi;
    input:Input;
    state:State;
    
    constructor(config:Config = new Config())
    {
        this.config = config;
        this.pixi = new Pixi(this.config);
        this.input = new Input(this.config, this.pixi.app.view);
        this.state = new State();
    }

    flash(blocking?:boolean)
    {
        let s = this.state;
        s.flashing = true;
        s.flashBlocks = blocking == true ? true : false;
        s.flashTickStep = 4.5;
        s.flashTicks = -1.0;
    }

    setBackground(color:string)
    {
        this.state.background = color;
    }

    getIntersectingSprite(id:number):number
    {
        let box1 = new SAT.Box();
        let box2 = new SAT.Box();
        let sprite = this.pixi.sprites[id];
        for (let i = 0; i < this.pixi.sprites.length; i++)
        {
            let candidate = this.pixi.sprites[i];
            if (i != id && candidate.sprite.visible)
            {
                let cellSize = this.config.grid.cellSize;
                box1.pos.x = sprite.position[0];
                box1.pos.y = sprite.position[1];
                box1.w  = sprite.sprite.width / cellSize;
                box1.h = sprite.sprite.height / cellSize;
               
                box2.pos.x = candidate.position[0];
                box2.pos.y = candidate.position[1];
                box2.w = candidate.sprite.width / cellSize;
                box2.h = candidate.sprite.height / cellSize;

                let p1 = box1.toPolygon();
                let p2 = box2.toPolygon();

                if (SAT.testPolygonPolygon(p1, p2))
                    return i;
            }
        }

        return -1;
    }

    setCell(x:number, y:number, image:number, offsetX = 0, offsetY = 0)
    {
        let cell = this.pixi.grid[y][x];
        if (image >= 0)
        {
            let cellSize = this.config.grid.cellSize;
            this.pixi.grid[y][x].sprite.visible = true;
            let tex = this.pixi.textures[image];
            let sprite = cell.sprite;
            sprite.texture = new PIXI.Texture(tex.baseTexture, new PIXI.Rectangle(offsetX * cellSize, offsetY * cellSize, cellSize, cellSize));

        }
        else
        {
            cell.sprite.visible = false;
        }
    }

    clearSprites()
    {
        this.pixi.sprites.forEach(s=>s.clear());
    }

    setSprite(i:number, pos:vec2, image:number = undefined, alpha:number = undefined, rotation:number = undefined, anchor:vec2 = this.config.sprite.anchor)
    {
        let sprite = this.pixi.sprites[i];
        sprite.position.set(pos);
        if (image != undefined)
        {
            if (image >= 0)
            {
                let tex = this.pixi.textures[image];
                sprite.sprite.anchor.x = anchor[0];
                sprite.sprite.anchor.y = anchor[1];
                sprite.sprite.texture = tex;
                sprite.sprite.visible = true;
                let a = alpha != undefined ? alpha : 1.0;
                rotation = rotation != undefined ? rotation : 0.0;
                sprite.sprite.rotation = rotation;
                sprite.sprite.alpha = a;
            }
            else
            {
                sprite.clear();
            }
        }
    }

    /**Clears the grid with the specified image as src */
    clearGrid(image:number)
    {
        for (let y = 0; y < this.pixi.grid.length; y++)
        {
            for (let x = 0; x < this.pixi.grid[y].length; x++)
            {
                this.setCell(x, y, image);
            }
        }
    }

    clearText()
    {
        this.state.centerText = "";
        this.state.centerTopText = "";
    }

    loadImage(src:any):number
    {
        let texture = PIXI.Texture.fromImage(src);
        this.pixi.textures.push(texture);
        return this.pixi.textures.length - 1;
    }

    animate(time:number, delta:number, tick:(time:number, delta:number)=>any)
    {
        let s = this.state;
        s.frames++;
        s.fps.measure(1000/delta/1000);

        let canvasWidth = this.pixi.app.view.width;
        let canvasHeight = this.pixi.app.view.height;
        let gridWidth = this.config.grid.width;
        let gridHeight = this.config.grid.height;
        let cellSize = this.config.grid.cellSize;
        let w = gridWidth * cellSize;
        let h = gridHeight * cellSize;
        let ratioWidth = canvasWidth / w;
        let ratioHeight = canvasHeight / h;
        let ratio = ratioWidth;
        this.pixi.stages.grid.setTransform(0,0, ratio, ratio);

        this.pixi.app.stage.alpha = 1.0;
        if (!s.flashing || !s.flashBlocks)
            tick(time, delta);

        this.pixi.texts.top.text = this.state.centerTopText;
        this.pixi.texts.middle.text = this.state.centerText;


        this.pixi.sprites.forEach(s=>
        {
            if (s.sprite.visible)
            {
                s.sprite.x = s.position[0] * cellSize;
                s.sprite.y = s.position[1] * cellSize;
            }
        });

        if (s.flashing)
        {
            let old = s.flashTicks;
            let alpha =  Math.abs(s.flashTicks);
            this.pixi.app.stage.alpha = alpha;
            s.flashTicks += s.flashTickStep * delta;
            if (Math.sign(old) != Math.sign(s.flashTicks))
            {
                alpha = 0.0;
                tick(time, delta);
            }
            if (s.flashTicks > 1.0)
            {
                s.flashing = false;
            }
        }

        if (s.debug)
        {
            if (s.frames % 10 == 0)
            {
                let debug = "";
                debug += s.fps.avg.toFixed(2) + "\n";
                debug += Math.floor(time) + "\n";
                debug += delta.toFixed(5) + "\n";
                this.pixi.texts.debug.text = debug;
            }
        }
        else
        {
            this.pixi.texts.debug.text = "";
        }
    }

}