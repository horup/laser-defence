
export class Sprite
{

}

/*
Cell of a grid.
*/
export class Cell
{
    image:number = -1;
    imgOffsetX:number = 0;
    imgOffsetY:number = 0;
}


/*
Engine takes care of rendering assets provided by a prototype.
*/
export class Engine
{
    private config = 
    {
        grid:
        {
            cellSize:16,
            width:16,
            height:16
        }
    }

    private images:HTMLImageElement[] = [];
    private backgroundColor:string = "#000000";
    private foregroundColor:string = "#FFFFFF";
    private grid:Cell[][];
    private context:CanvasRenderingContext2D;

    public centerText:string = "Engine Initialized...";

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

        c.textAlign = "center";
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

    setGrid(image:number)
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
    canvas:HTMLCanvasElement;
    engine:Engine;
    constructor()
    {
        this.canvas = document.getElementById("canvas") as HTMLCanvasElement;
        this.engine = new Engine(this.canvas.getContext("2d"));
        this.animate();
    }

    private animate()
    {
        window.requestAnimationFrame(()=>this.animate());
        this.engine.draw();
    }

    abstract tick();
}