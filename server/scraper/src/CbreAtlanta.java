import java.util.Iterator;

import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;

public class CbreAtlanta extends Cbre {
	private final String URL = "http://www.cbre.us/o/atlanta/teams/atlanta-multihousing-group/Pages/available-properties.aspx";
	private final String BROKER = "CBRE";
	
	public void crawl() throws Exception {
		Document doc = getDOM(URL);
		
		Element container = doc.select("div#mainarea > div.article-body > div.page-text").first();
		assume(container != null, URL, "the div holding all the property information is present");
		
		Elements rows = container.select("tr");
		assume(rows.size() > 1, URL, "the rows holding the individual property information plus the header row are present");
		assume(rows.get(0).select("th").size() == 4, URL, "the first row in the central table is the header row");
		
		Iterator<Element> rowsIter = container.select("tr").iterator();
		burn(rowsIter, 1);
		
		while (rowsIter.hasNext()) {
			Element row = rowsIter.next();
			assume(row.select("th").size() == 1 && row.select("td").size() == 3, URL, "the rows in the central table are in the correct format");
			
			Property p = new Property();
			Address a = new Address();
			
			p.setSite(URL);
			p.setBroker(BROKER);
			p.setAddress(a);
			p.setTitle(normalize(row.select("th").first().text()));
			p.setNumUnits(normalize(row.select("td").first().text()));
			a.setCity(normalize(row.select("td").get(1).text().split(", ")[0]));
			a.setState(row.select("td").get(1).text().split(", ")[1]);
			
			if (row.select("td").get(2).text().matches("(?i)click for website") && row.select("td").get(2).select("a") != null) {
				scrapeIndividualPage(p, a, row.select("td").get(2).select("a").attr("href"));
			}
			
			addModel(p);
		}
	}
}
