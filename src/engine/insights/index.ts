class Events
{
    send(category:string, action:string, label?:String, value?:number)
    {
        ga("send", "event", category, action, label, value);
    }
}

class Metrics
{
    set(num:number, value:any)
    {
        ga('set', 'metric' + num, value);
    }
}

export module Insights
{
    export let init = (id:String)=>
    {
        ga('create', id, 'auto');
    }
    
    export let event = new Events();   
    export let metric = new Metrics();
}