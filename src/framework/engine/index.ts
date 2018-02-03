import { Config } from "./config";
import { Pixi } from "./pixi";
import { Input } from "./input";
import { State } from "./state";
import { vec2 } from "gl-matrix";
import * as SAT from "sat";

export class Engine
{
    tick:(time, delta)=>any;
    config:Config;
    pixi:Pixi;
    input:Input;
    state:State;
    
    constructor(tick:(time, delta)=>any, config:Config = new Config())
    {
        this.tick = tick;
        this.config = config;
        PIXI.ticker.shared.autoStart = false;
        PIXI.ticker.shared.stop();
        this.pixi = new Pixi(this.config);
        this.input = new Input(this.config, this.pixi.app.view);
        this.state = new State();
        requestAnimationFrame((now)=>this.animate(now));
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
        let sprite = this.pixi.sprites[id];
        for (let i = 0; i < this.pixi.sprites.length; i++)
        {
            let candidate = this.pixi.sprites[i];
            if (i != id && candidate.sprite.visible)
            {
                let cellSize = this.config.grid.cellSize;
                let lx1 = sprite.position[0];
                let ly1 = sprite.position[1];
                let rx1 = lx1 + sprite.sprite.width / cellSize;
                let ry1 = ly1 + sprite.sprite.height / cellSize;
             
                let lx2 = candidate.position[0];
                let ly2 = candidate.position[1];
                let rx2 = lx2 + candidate.sprite.width / cellSize;
                let ry2 = ly2 + candidate.sprite.height / cellSize;
                
                if (lx1 > rx2 || lx2 > rx1)
                    continue;
                if (ly1 > ry2 || ly2 > ry1)
                    continue;

                return i;
            }
        }

        return -1;
    }

    textureCache:
    {
        [image:number]:
        {
            [x:number]:
            {
                [y:number]:PIXI.Texture
            }
        }
    } = {};
    
    private getTexture(image:number, x:number, y:number)
    {
        let c = this.textureCache;
        if (c[image] != null && c[image][x] != null && c[image][y] != null)
            return c[image][x][y];

        return null;
    }

    private setTexture(image:number, x:number, y:number)
    {
        let c = this.textureCache;
        if (c[image] == null)
            c[image] = {};

        if (c[image][x] == null)
            c[image][x] = {};
        
        let tex = this.pixi.textures[image];
        let cellSize = this.config.grid.cellSize;
        c[image][x][y] = new PIXI.Texture(tex.baseTexture, new PIXI.Rectangle(x * cellSize, y * cellSize, cellSize, cellSize));
        return c[image][x][y];
    }

    setCell(x:number, y:number, image:number, offsetX = 0, offsetY = 0)
    {
        let cell = this.pixi.grid[y][x];
        if (image >= 0)
        {
            let cellSize = this.config.grid.cellSize;
            this.pixi.grid[y][x].sprite.visible = true;
            let sprite = cell.sprite;
            let tex:PIXI.Texture = this.getTexture(image, offsetX, offsetY);
            if (tex == null)
                tex = this.setTexture(image, offsetX, offsetY);
            let c = this.textureCache;
            
            sprite.texture = tex;
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

    time = 0;
    animate(now:number)
    {
        //if (Math.random() < 0.5)
        {
            let frametime = Math.floor(now - this.time);
            this.time = now;
            let delta = frametime / 1000;
            this.update(this.time, delta);
            this.pixi.app.ticker.update(now);
        }
        requestAnimationFrame((now)=>this.animate(now));
    }

    update(time:number, delta:number)
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
            this.tick(time, delta);

        this.pixi.texts.top.text = this.state.centerTopText;
        this.pixi.texts.middle.text = this.state.centerText;
        this.pixi.texts.left.text = this.state.leftTopText;


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
                this.tick(time, delta);
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