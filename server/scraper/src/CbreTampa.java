import java.util.Iterator;
import java.util.LinkedList;

import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;


public class CbreTampa extends Cbre {
	private final String URL = "http://www.cbre.us/o/tampa/teams/tampa-multi-housing-group/Pages/featured-properties.aspx";
	
	public void crawl() throws Exception {
		Document doc = getDOM(URL);
		
		Element container = doc.select("div#mainarea > div.article-body > div.page-text > div.text-content").first();
		assume(container != null, URL, "the div holding all the property information is present");
		
		Elements rows = container.select("table > tbody > tr");
		assume(rows.size() > 0, URL, "the rows containing alternating images and data are present");
		
		Iterator<Element> rowsIter = rows.iterator();
		Elements dataRows = new Elements();
		while (rowsIter.hasNext()) {
			Element row = rowsIter.next();
			if (row.select("img").size() != 0 && row.select("a").size() != 0) {
				dataRows.add(row);
			}
		}

		Iterator<Element> dataIter = dataRows.iterator();
		while(dataIter.hasNext()) {
			Element data = dataIter.next();
			assume(data.select("a").size() == 1, URL, "there is only one link per property row");
			
			Property p = new Property();
			Address a = new Address();
			p.setAddress(a);
			
			scrapeIndividualPage(p, a, data.select("a").attr("href"));
			
			addModel(p);
		}
	}
}
