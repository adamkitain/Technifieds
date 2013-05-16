public class JonesLangLaSalleAtlanta extends JonesLangLaSalle {
    private final String URL = "http://www.us.am.joneslanglasalle.com/UnitedStates/EN-US/Pages/southeast-multifamily-properties.aspx";

    public void crawl() throws Exception {
        scrapeJLL(URL, "div#WebPartWPQ1 > table > tbody > tr > td");
    }
}
