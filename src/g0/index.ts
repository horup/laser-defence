import { Prototype } from "../engine/index";
import { vec2 } from 'gl-matrix';


let spawnTime = 60;

class Missile
{
    inUse = false;
    pos:vec2 = vec2.create();

    reset()
    {
        this.inUse = false;
    }
}

export default class G0 extends Prototype
{
    missiles:Missile[] = [];
    playerPos:vec2 = vec2.create();
    
    constructor()
    {
        super();
        this.engine.loadImage(require("./imgs/space.png"));
        this.engine.loadImage(require("./imgs/cloud.png"));
        this.engine.loadImage(require("./imgs/missile.png"));
        this.engine.loadImage(require("./imgs/block.png"));

        let e = this.engine;
        e.centerText = "";
        e.clearGrid(0);

        let placeCloud = (sx:number, sy:number)=>
        {
            for (let y = 0; y < 2; y++)
                for (let x = 0; x < 2; x++)
                    e.setCell(x+sx, y+sy, 1, x, y);
        }

        placeCloud(3,3);
        placeCloud(8,4);
        placeCloud(13,2);

        this.missiles = new Array(10);
        for (let i = 0; i < this.missiles.length; i++)
        {
            this.missiles[i] = new Missile();
        }

        this.initRound();
    }

    initRound()
    {
        this.playerPos.set([0, 0]);
        this.engine.setSprite(0, this.playerPos, 3);
        this.missiles.forEach(m=>m.reset());
    }

    tick(iterations:number)
    {
        this.engine.clearSprites();
        let spriteIndex = 0;
        let y = this.engine.input.mouse.pos[1];
        if (y < 1) 
            y = 1; 
        else if (y > 15) 
            y = 15;

        this.playerPos.set([2, y]);
        this.engine.setSprite(spriteIndex++, this.playerPos, 3);

        this.missiles.forEach(m=>
        {
            if (m.inUse)
            {
                let speed = 0.1;
                this.engine.setSprite(spriteIndex++, m.pos, 2);
                m.pos[0] -= 0.1;
            }
        });

        if (iterations % spawnTime == 0)
        {
            let freeMissiles = this.missiles.filter(m=>!m.inUse);
            if (freeMissiles.length > 0)
            {
                let missile = freeMissiles[0];
                missile.pos.set([16, 1 + Math.random() * 15]);
                missile.inUse = true;
            }
        }
    }
}