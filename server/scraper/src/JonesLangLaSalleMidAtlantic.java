public class JonesLangLaSalleMidAtlantic extends JonesLangLaSalle {
    final String URL = "http://www.us.am.joneslanglasalle.com/UnitedStates/EN-US/Pages/mid-atlantic-multifamily-properties.aspx";

    public void crawl() throws Exception {
        scrapeJLL(URL, "div#WebPartWPQ5 > font > table > tbody > tr > td");
    }
}
