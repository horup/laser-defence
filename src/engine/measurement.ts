export class Measurement
{
    min = 0;
    max = 0;
    current = 0;
    avg = 0;
    count = 0;

    past:number[] = new Array(100);
    constructor()
    {
        for (let i = 0; i < this.past.length; i++)
            this.past[i] = 0;
    }
    measure(newvalue:number)
    {
        for (let i = this.past.length - 1; i >= 0; i--)
            this.past[i] = this.past[i - 1];
        this.past[0] = newvalue;
        this.count++;
        this.current = newvalue;
        this.max = this.max < this.current ? this.current : this.max;
        this.min = this.current < this.min || this.min == 0 ? this.current : this.min; 
        this.count++;
        this.avg = 0;
        let c = this.count < this.past.length ? this.count : this.past.length;
        for (let i = 0; i < c; i++)
            this.avg += this.past[i];
        this.avg /= c;
    }
}