import { Prototype } from "../framework";
import { Insights } from "../framework";
import { vec2 } from 'gl-matrix';
import { Shufflebag } from "../framework";

class Missile
{
    inUse = false;
    pos:vec2 = vec2.create();
    speed = 0.1;
    reset()
    {
        this.inUse = false;
    }
}

class Explosion
{
    inUse = false;
    pos:vec2 = vec2.create();
    alpha:number = 1.0;
    reset()
    {
        this.alpha = 1.0;
        this.inUse = false;
    }
}

class Laser
{
    fire = 0;
    rotation:number = 0;
    target = vec2.create();
    pos = vec2.create();
}

export default class G0 extends Prototype
{
    rounds = 0;
    maxScore = 0;
    nextSpawnTime = 1000;
    spawnTime = 1000;
    timer:number = 0;
    state:number = 0;
    missiles:Missile[] = [];
    explosions:Explosion[] = [];
    playerPos:vec2 = vec2.create();
    explosionImg:number;
    shuffle = new Shufflebag(8);
    shuffle2 = new Shufflebag(8);
    laser = new Laser();
    img = 
    {
        beam:0,
        laser:0,
        grass:0,
        laserbase:0
    }

    constructor()
    {
        super();
        let e = this.engine;
        
        e.loadImage(require("./imgs/space.png"));
        e.loadImage(require("./imgs/cloud.png"));
        e.loadImage(require("./imgs/missile.png"));
        e.loadImage(require("./imgs/block.png"));
        this.explosionImg = e.loadImage(require("./imgs/explosion.png"));

        this.img.beam = e.loadImage(require("./imgs/beam.png"));
        this.img.laser = e.loadImage(require("./imgs/laser.png"));
        this.img.grass = e.loadImage(require("./imgs/grass.png"));
        this.img.laserbase = e.loadImage(require("./imgs/laserbase.png"));

        e.clearGrid(-1);
        let max = 100;
        this.missiles = new Array(max);
        this.explosions = new Array(max);
        for (let i = 0; i < max; i++)
        {
            this.missiles[i] = new Missile();
            this.explosions[i] = new Explosion();
        }

        Insights.init("UA-74749034-3");
        Insights.event.send("G0", "Loaded");
    }

    initRound(time:number, delta:number)
    {
        Insights.event.send("G0", "New Round");
        Insights.metric.set(1, this.timer);
        Insights.metric.set(2, this.maxScore);
        Insights.metric.set(3, this.rounds);
        Insights.metric.set(4, time);
        Insights.metric.set(5, this.engine.state.frames);

        let e = this.engine;
        e.state.centerText = "";
        e.clearGrid(0);
        this.timer = 0;
        this.laser.rotation = 0;

        let placeCloud = (sx:number, sy:number)=>
        {
            for (let y = 0; y < 2; y++)
                for (let x = 0; x < 2; x++)
                    e.setCell(x+sx, y+sy, 1, x, y);
        }

        placeCloud(3,3);
        placeCloud(8,4);
        placeCloud(13,2);

        for (let x = 0; x < e.config.grid.width; x++)
        {
            e.setCell(x, 8, this.img.grass);
        }

        this.playerPos.set([2, 16/2]);
        this.missiles.forEach(m=>m.reset());
       
        this.rounds++;
    }

    last = false;

    isClick()
    {
        if (this.last == true && !this.engine.input.mouse.button[0])
        {
            return true;
        }

        return false;
    }

    targeted = false;

    mainTick(time:number, delta:number)
    {
        let e = this.engine;
        this.engine.clearSprites();
        let spriteIndex = 0;
        let y = this.engine.input.mouse.pos[1];
        let x = this.engine.input.mouse.pos[0];
        if (y < 1) 
            y = 1; 
        else if (y > 8) 
            y = 8;
        
        let minx = 1;//e.config.grid.width/2;
        if (x < minx) 
            x = minx; 
        else if (x > e.config.grid.width - 1) 
            x = e.config.grid.width - 1;

        let playerSprite = undefined;
        if ((this.isClick() || this.engine.input.mouse.button[0]))
        {
            if (!this.targeted || this.isClick())
            {
                playerSprite = spriteIndex++;
                this.playerPos.set([ x, y]);
                this.engine.setSprite(playerSprite, this.playerPos, 3, 1, Math.PI / 4);
                this.targeted = true;
            }
        }
        else
        {
            this.targeted = false;
        }

        this.missiles.forEach(m=>
        {
            if (m.inUse)
            {
                let missileSprite = spriteIndex++;
                this.engine.setSprite(missileSprite, m.pos, 2);
                m.pos[0] += m.speed * delta;

                if (this.engine.getIntersectingSprite(missileSprite) == playerSprite)
                {
                    m.reset();
                    for (let explosion of this.explosions)
                    {
                        if (!explosion.inUse)
                        {
                            explosion.inUse = true;
                            explosion.pos.set(m.pos);
                            explosion.alpha = 1.0;
                            this.laser.target.set(m.pos);
                            this.laser.fire = 3;
                            break;
                        }
                    }
                }

                if (m.pos[0] > e.config.grid.width)
                {
                    Insights.event.send("G0", "Died", "at " + e.state.centerTopText, this.timer);
                    if (this.maxScore < this.timer)
                    {
                        this.maxScore = this.timer;
                        Insights.metric.set(2, this.maxScore);
                    }
                    m.reset();
                    e.flash(true);
                    this.state = 3;
                }
            }
        });

        this.explosions.forEach(m =>
        {
            if (m.inUse)
            {
                this.engine.setSprite(spriteIndex++, m.pos, this.explosionImg, m.alpha);
                m.alpha -= 6 * delta;
                if (m.alpha < 0)
                {
                    m.reset();
                }
            }
        });

        this.spawnTime -= delta * 1000;
        if (this.spawnTime <= 0)
        {
            let div = 1 + this.timer / 1000 / 30;
            this.nextSpawnTime = 1000 / div;
            this.spawnTime = this.nextSpawnTime;
            if (this.spawnTime < 100)
                this.spawnTime = 100;

            let freeMissiles = this.missiles.filter(m=>!m.inUse);
            if (freeMissiles.length > 0)
            {
                let missile = freeMissiles[0];
                missile.pos.set([0, 1 + this.shuffle.next()]);
                missile.inUse = true;
                missile.speed = 8;
            }

           
        }

        this.timer += delta * 1000;
        let ms = Math.floor(this.timer) % 1000;
        let seconds = Math.floor(this.timer / 1000);
        
        let laserX = e.config.grid.width-2;
        this.laser.pos.set([laserX, 8.5]);
        let v = Math.atan2(this.playerPos[1] - this.laser.pos[1], this.playerPos[0] - this.laser.pos[0]);
        let v2 = Math.atan2(this.laser.target[1] - this.laser.pos[1], this.laser.target[0] - this.laser.pos[0]);
        this.laser.rotation = v;

        e.setSprite(spriteIndex++, this.laser.pos, this.img.laserbase);

        let turret = vec2.clone(this.laser.pos);
        turret[1] -= 1 / 8;
        if (this.laser.fire > 0)
        {
            e.setSprite(spriteIndex++, turret, this.img.beam, 1.0, v2, vec2.clone([0,0.5]));
            this.laser.fire--;
        }
        
        e.setSprite(spriteIndex++, turret, this.img.laser, 1.0, this.laser.rotation);
        e.state.centerTopText = seconds + ":" + (ms < 10 ? "00" + ms : (ms < 100 ? "0" + ms : ms));
    }

    tick(time:number, delta:number)
    {
        let e = this.engine;
        switch(this.state)
        {
            case 0:
            {
                if (time % 1000 < 666)
                    e.state.centerText = "Touch when ready!!";
                else
                    e.state.centerText = "";
                if (this.isClick())
                {
                    this.state = 1;
                    e.flash(true);
                }  
                break;  
            }
            case 1:
            {
               this.initRound(time, delta);
               this.state = 2;
               break;
            }
            case 2:
            {
                this.mainTick(time, delta);

                break;
            }
            case 3:
            {
                e.clearGrid(-1);
                e.clearSprites();
                e.state.centerText = "BOOM! Try again?";
                if (this.isClick())
                {
                    this.state = 1;
                    e.flash(true);
                }  
                break;
            }
        }

        this.last = this.engine.input.mouse.button[0];
    }
}