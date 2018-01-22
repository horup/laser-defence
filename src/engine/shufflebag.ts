export class Shufflebag
{
    private currentItem = 0;
    private currentPosition = 0;
    private pos = 0;
    private data:number[];
    constructor(capacity:number)
    {
        this.data = new Array(capacity);
        for (let i = 0; i < this.data.length; i++)
        {
            this.data[i] = i;
        }
    }

    next()
    {
        if (this.currentPosition < 1)
        {
            this.currentPosition = this.data.length - 1;
            this.currentItem = this.data[0];
            return this.currentItem;
        }

        this.pos = Math.floor(Math.random() * this.currentPosition);
        this.currentItem = this.data[this.pos];
        this.data[this.pos] = this.data[this.currentPosition];
        this.data[this.currentPosition] = this.currentItem;
        this.currentPosition--;

        return this.currentItem;
    }
}