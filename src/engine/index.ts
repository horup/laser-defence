import {vec2, glMatrix} from 'gl-matrix';

/**Sprite.*/
export class Sprite
{
    id:number;
    image:number = -1;
    position:vec2 = vec2.create();
    imgOffset:vec2 = vec2.create();
    size:vec2 = vec2.create();

    constructor(id:number)
    {
        this.id = id;
        this.clear();
    }

    clear()
    {
        this.position.set([0,0]);
        this.imgOffset.set([0,0]);
        this.size.set([1,1]);
        this.image = -1;
    }
}

/**Cell of a grid.*/
export class Cell
{
    image:number = -1;
    imgOffsetX:number = 0;
    imgOffsetY:number = 0;
}


/**Engine takes care of rendering assets provided by a prototype. */
export class Engine
{
    private config = 
    {
        sprites:
        {
            max:255
        },
        grid:
        {
            cellSize:16,
            width:16,
            height:16
        }
    }

    private debug =
    {
        draw:
        {
            grid:
            {
                bounds:false
            },
            sprite:
            {
                bounds:true
            }
        }
    }

    private sprites:Sprite[] = [];
    private images:HTMLImageElement[] = [];
    private backgroundColor:string = "#000000";
    private foregroundColor:string = "#FFFFFF";
    private grid:Cell[][];
    private context:CanvasRenderingContext2D;

    public centerText:string = "Engine Initialized...";
    public input = 
    {
        mouse:
        {
            pos:vec2.create(),
            button:[false, false, false]
        }
    }


    constructor(c:CanvasRenderingContext2D)
    {
        this.context = c;
        let w = this.config.grid.width;
        let h = this.config.grid.height;
        this.grid = new Array(w);
        for (let i = 0; i < w; i++)
        {
            this.grid[i] = new Array(h);
            for (let j = 0; j < h; j++)
            {
                this.grid[i][j] = new Cell();
            }
        }

        this.sprites = new Array(256);
        for (let i = 0; i < this.sprites.length; i++)
        {
            this.sprites[i] = new Sprite(i);
        }

        c.textAlign = "center";

        document.onmousemove = (ev)=>
        {
            if (this.hasFocus)
            {
                let c = this.context.canvas;
                let clamp = (v, min, max) => v < min ? min : (v > max) ? max : v;
                
                let x = ev.x - c.offsetLeft;
                let y = ev.y - c.offsetTop;

                x = x / this.config.grid.cellSize;
                y = y / this.config.grid.cellSize;

                x = clamp(x, 0, this.config.grid.width);
                y = clamp(y, 0, this.config.grid.height);

                this.input.mouse.pos.set([x,y]);
            
               console.log(JSON.stringify(this.input));
            }
        }

        document.onmousedown = (ev)=>
        {
            if (!this.hasFocus)
            {
                c.canvas.requestPointerLock();
                this.input.mouse.pos[0] = c.canvas.width / this.config.grid.cellSize / 2;
                this.input.mouse.pos[1] = c.canvas.width / this.config.grid.cellSize / 2;
            }
            if (this.hasFocus)
            {
                if (ev.button < this.input.mouse.button.length)
                    this.input.mouse.button[ev.button] = true;
                console.log(JSON.stringify(this.input));
            }
        }

        document.onmouseup = (ev)=>
        {
            if (this.hasFocus)
            {
                if (ev.button < this.input.mouse.button.length)
                    this.input.mouse.button[ev.button] = false;
                console.log(JSON.stringify(this.input));
            }
        }
    }

    get hasFocus()
    {
        return true;
       // return document.pointerLockElement == this.context.canvas;
    }

    setBackground(color:string)
    {
        this.backgroundColor = color;
    }
 
    setCell(x:number, y:number, image:number, imgOffsetX = 0, imgOffsetY = 0)
    {
        let img = this.images[image];
        this.grid[y][x].image = image;
        this.grid[y][x].imgOffsetX = imgOffsetX;
        this.grid[y][x].imgOffsetY = imgOffsetY;
    }

    clearSprites()
    {
        this.sprites.forEach(s=>s.clear);
    }

    setSprite(i:number, pos:vec2, image:number = undefined)
    {
        let sprite = this.sprites[i];
        sprite.position.set(pos);
        if (image != undefined) 
            sprite.image = image;
    }

    /**Clears the grid with the specified image as src */
    clearGrid(image:number)
    {
        this.grid.forEach(h=>h.forEach(cell=>cell.image = image));
    }

    loadImage(src:any):number
    {
        let img = new Image();
        img.src = src;
        this.images.push(img);
        return this.images.length - 1;
    }

    draw()
    {
        let w = this.context.canvas.width;
        let h = this.context.canvas.height;
        let c = this.context;
        c.fillStyle = this.backgroundColor;
        c.fillRect(0, 0, w, h);
        let cellSize = this.config.grid.cellSize;
        for (let y = 0; y < this.grid.length; y++)
        {
            for (let x = 0; x< this.grid[y].length; x++)
            {
                let cell = this.grid[y][x];
                if (cell.image >= 0 && cell.image < this.images.length)
                {
                    let image = this.images[cell.image];
                    c.drawImage(image, cell.imgOffsetX * cellSize, cell.imgOffsetY * cellSize, cellSize, cellSize, x * cellSize, y * cellSize, cellSize, cellSize);
                }
            }
        }

        c.strokeStyle = 'red';
        
        for (let sprite of this.sprites)
        {
            if (sprite.image >= 0 && sprite.image < this.images.length)
            {
                let image = this.images[sprite.image];
                let x = sprite.position[0] * cellSize - Math.floor(image.width / 2);
                let y = sprite.position[1] * cellSize - Math.floor(image.height / 2);
                let sw = image.width / cellSize;
                let sh = image.height / cellSize;
                c.drawImage(image, x, y);
                if (this.debug.draw.sprite.bounds)
                {
                    c.strokeRect(x + 0.5, y + 0.5, image.width - 1, image.height - 1);
                }
            }
        }

        if (this.debug.draw.grid.bounds)
        {
            for (let y = -1; y < h - 1; y+= cellSize)
            {
                c.beginPath();
                c.moveTo(0.5, y+0.5);
                c.lineTo(w+0.5, y+0.5);
                c.stroke();
            }
            for (let x = -1; x < h - 1; x+= cellSize)
            {
                c.beginPath();
                c.moveTo(x+0.5, 0.5);
                c.lineTo(x+0.5, h);
                c.stroke();
            }
        }

        c.fillStyle = this.foregroundColor;
        c.fillText(this.centerText, w/2, h/2);
    }
}

/*
Base class for all prototypes.
Any prototype instance will hook into the canvas and document. 
*/
export abstract class Prototype
{
    private iterations:number = 0;
    canvas:HTMLCanvasElement;
    engine:Engine;
    constructor()
    {
        this.canvas = document.getElementById("canvas") as HTMLCanvasElement;
        this.engine = new Engine(this.canvas.getContext("2d"));
        setTimeout(()=>this.animate());
    }

    private animate()
    {
        window.requestAnimationFrame(()=>this.animate());
        this.tick(this.iterations++)
        this.engine.draw();
    }

    abstract tick(iterations:number);
}