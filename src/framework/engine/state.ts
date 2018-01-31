import { Measurement } from "../index";

export class State
{
    flashing = false;
    flashBlocks = false;
    flashTickStep = 5;
    flashTicks = -1.0;
    centerText = "";
    centerTopText = "";
    leftTopText = "";
    frames = 0;
    animate = new Measurement();
    fps = new Measurement();
    debug = false;
    memory = 0;
    memoryAllocated = 0;
    
    background = "#000000";
}