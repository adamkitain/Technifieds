import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;

import java.util.Iterator;

public class CbreCharlotte extends Cbre {
    public final String URL = "http://www.cbre.us/o/charlotte/teams/multi-housing-group-carolinas/Pages/properties.aspx";

    public void crawl() throws Exception {
        Document doc = getDOM(URL);

        doc = getDOM(doc.select("iframe").first().attr("src"));

        Elements anchors = doc.select("table").first().select("td").select("a");
        Iterator<Element> anchorsIter = anchors.iterator();

        while (anchorsIter.hasNext()) {
            Property p = new Property();
            Address a = new Address();

            p.setAddress(a);

            scrapeIndividualPage(p, a, anchorsIter.next().attr("href"));

            if (p.isValid()) {
                addModel(p);
            }
        }
    }
}
