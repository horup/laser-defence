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
    }

    showBanner()
    {
        if(AdMob) AdMob.createBanner({
            adId: this.admobid.banner,
            position: AdMob.AD_POSITION.TOP_CENTER,
            autoShow: true });
    }

    hideBanner()
    {
      
    }
}