import java.util.Iterator;
import java.util.LinkedList;

import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;


public class CbreFortLauderdale extends Cbre {
	private final String URL = "http://www.cbre.us/o/fortlauderdale/teams/south-florida-multi-housing-group/Pages/current-available-listings-institutional-investme.aspx";
	
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
			if (row.select("img").size() == 0) {
				dataRows.add(row);
			}
		}
		assume(dataRows.size() == rows.size() / 2.0, URL, "the rows in the table alternate between images and data");
		
		LinkedList<String> links = new LinkedList<String>();
		
		Iterator<Element> dataIter = dataRows.iterator();
		while(dataIter.hasNext()) {
			Element dataRow = dataIter.next();
			assume(dataRow.children().size() == 2, URL, "the table uses a two column layout");
			assume(dataRow.children().select("a strong").size() == 1 || dataRow.children().select("a strong").size() == 2, URL, "there is only one title link per cell, and the title is correctly identified");
			assume(dataRow.children().get(0).select("a").first().select("strong").size() == 1, URL, "the first anchor in the left cell is the title");

			links.add(dataRow.children().get(0).select("a").first().attr("href"));
			
			if (dataRow.children().select("a strong").size() == 2) {
				assume(dataRow.children().get(1).select("a").first().select("strong").size() == 1, URL, "the first anchor in the right cell is the title");
				links.add(dataRow.children().get(1).select("a").first().attr("href"));				
			}
			
		}
		
		Iterator<String> linksIter = links.iterator();
		while(linksIter.hasNext()) {
			Property p = new Property();
			Address a = new Address();
			p.setAddress(a);
			
			String link = linksIter.next();
			scrapeIndividualPage(p, a, link);
			
			addModel(p);
		}
	}
	
}
