import G from "./g1/index";
import { Ads } from "./framework/ads/index";
require("./style.css");
declare var cordova;

if (typeof(cordova) == "object")
{
    let onDeviceReady = ()=>
    {
        new G();
    }

    document.addEventListener("deviceready", onDeviceReady, false);
}
else
{
    document.addEventListener("DOMContentLoaded", ()=>
    {
        new G(); 
    });
}
