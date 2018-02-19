declare var AdMob;
export class Ads
{
    admobid;
    initAdmob(bannerad, interad)
    {
        this.admobid = {
            banner: bannerad,
            interstitial:  interad
          };

        this.showBanner();
    }

    showBanner()
    {
        if(typeof AdMob !== 'undefined') AdMob.createBanner({
            adId: this.admobid.banner,
            adSize:'SMART_BANNER',
            overlap:true,
            position: AdMob.AD_POSITION.TOP_CENTER,
            autoShow: true });
    }

    hideBanner()
    {
      
    }
}