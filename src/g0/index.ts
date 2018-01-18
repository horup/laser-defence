import { Prototype } from "../engine/index";

export default class G0 extends Prototype
{
    constructor()
    {
        super();
        let spaceId = this.engine.loadImage(require("./space.png"));
        let cloudId = this.engine.loadImage(require("./cloud.png"));

        let e = this.engine;
        e.centerText = "";
        e.setGrid(spaceId);

        let placeCloud = (sx:number, sy:number)=>
        {
            for (let y = 0; y < 2; y++)
                for (let x = 0; x < 2; x++)
                    e.setCell(x+sx, y+sy, cloudId, x, y);
        }

        placeCloud(3,3);


    }

    tick()
    {
        
    }
}