import java.util.Iterator;

import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;


public class CbreHouston extends Cbre {
	private final String URL = "http://www.cbre.us/o/houston/teams/mhg-re-nj-wb/Pages/available-properties.aspx";
	
	public void crawl() throws Exception {
		Document doc = getDOM(URL);
		
		Element container = doc.select("div#mainarea > div.article-body > div.page-text > div.text-content").first();
		assume(container != null, URL, "the div holding all the property information is present");
		
		Elements rows = container.select("table > tbody > tr");
		assume(rows.size() > 0, URL, "the rows containing data are present");
		
		Iterator<Element> rowsIter = rows.iterator();
		while (rowsIter.hasNext()) {
			Element row = rowsIter.next();
			assume(row.children().size() == 2, URL, "the middle table column has two sides, one for images and one for data");
			
			if (!row.children().get(1).text().contains("SOLD")) {
				Property p = new Property();
				Address a = new Address();
				p.setAddress(a);
				
				Iterator<Element> anchors = row.children().get(1).select("a").iterator();
				Elements titleAnchor = new Elements();
				while(anchors.hasNext()) {
					Element anchor = anchors.next();
					if (anchor.text().length() > 0) {
						titleAnchor.add(anchor);
					}
				}
				
				assume(titleAnchor.size() == 1, URL, "the cell holding the data only has one link");
				
				scrapeIndividualPage(p, a, titleAnchor.first().attr("href"));
				
				addModel(p);
			}
		}
	}
}
