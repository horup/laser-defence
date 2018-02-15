declare var admob;

export class Ads
{
    initAdmob(bannerad, interad)
    {
        if (typeof admob != 'undefined')
            admob.initAdmob(bannerad, interad);
        this.showBanner();
    }

    showBanner()
    {
        if (typeof admob != 'undefined')
        {
            admob.showBanner(admob.BannerSize.BANNER, admob.Position.TOP_APP);
        }
    }

    hideBanner()
    {
        if (typeof admob != 'undefined')
        {
            admob.hideBanner();
        }
    }
}