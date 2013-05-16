import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;

import java.util.Iterator;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class CbreAustin extends Cbre {
    public final String URL = "http://www.cbre.us/o/austin/teams/mhg-austin-sa/Pages/current-listings.aspx";

    public void crawl() throws Exception {
        Document doc = getDOM(URL);

        Elements content = doc.select("div.text-content");

        assume(content.size() == 1, URL, "the div containing the content tables is correctly identified");

        Elements tables = content.select("> table");
        Iterator<Element> tablesIter = tables.iterator();

        while (tablesIter.hasNext()) {
            Element table = tablesIter.next();

            Elements rows = table.select("> tbody > tr");
            Iterator<Element> rowsIter = rows.iterator();

            burn(rowsIter, 1);

            while (rowsIter.hasNext()) {
                Element row = rowsIter.next();

                if (row.select("a").size() == 1) {
                    Property p = new Property();
                    Address a = new Address();
                    p.setAddress(a);

                    getListingInfo(p, a, row);

                    Elements pageLink = row.select("a");

                    scrapeIndividualPage(p, a, pageLink.first().attr("href"));

                    addModel(p);
                } else if (row.select("a").size() == 2) {
                    Elements paragraphs = row.select("p");
                    Elements anchors = row.select("a");

                    assume(paragraphs.size() == 2, URL, "the listings are separated into paragraph tags");
                    assume(anchors.size() == 2, URL, "there are two anchors, one for each listing");

                    Property p1 = new Property();
                    Address a1 = new Address();
                    p1.setAddress(a1);

                    Property p2 = new Property();
                    Address a2 = new Address();
                    p2.setAddress(a2);

                    getListingInfo(p1, a1, paragraphs.first());
                    getListingInfo(p2, a2, paragraphs.last());

                    scrapeIndividualPage(p1, a1, anchors.first().attr("href"));
                    scrapeIndividualPage(p2, a2, anchors.last().attr("href"));

                    addModel(p1);
                    addModel(p2);
                }
            }
        }
    }

    private void getListingInfo(Property p, Address a, Element e) throws Exception {
        Pattern pattern;
        Matcher matcher;

        Elements titleAndStatus = e.select("strong");

        assume(titleAndStatus.size() >= 2, URL, "there are at least two strong elements in each tr: title first and status last");

        p.setStatus(titleAndStatus.last().text());
        p.setTitle(titleAndStatus.first().text());

        System.out.println(titleAndStatus.first().text());

        String[] separatedByLineBreaks = e.html().split("<br\\s?/>");

        for (int i = 0; i < separatedByLineBreaks.length; i ++) {
            if (separatedByLineBreaks[i].contains("Built")) {
                pattern = Pattern.compile("[12]\\d{3}");
                matcher = pattern.matcher(separatedByLineBreaks[i]);

                if (matcher.find()) {
                    p.setYearBuilt(matcher.group());
                }
            } else if (separatedByLineBreaks[i].contains("Units")) {
                pattern = Pattern.compile("\\d+");
                matcher = pattern.matcher(separatedByLineBreaks[i]);

                if (matcher.find()) {
                    p.setNumUnits(matcher.group());
                }
            }
        }
    }
}
