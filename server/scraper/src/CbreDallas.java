import java.util.Iterator;
import java.util.LinkedList;

import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;


public class CbreDallas extends Cbre {
	private final String URL = "http://www.cbre.us/o/dallas/teams/multihousing/Pages/available-properties.aspx";
	
	public void crawl() throws Exception {
		Document doc = getDOM(URL);
		
		Element container = doc.select("div#mainarea > div.article-body > div.page-text > div.text-content").first();
		assume(container != null, URL, "the div holding all the property information is present");
		
		Elements cells = container.select("table > tbody > tr > td");
		assume(cells.size() > 0, URL, "the rows containing alternating images and data are present");
		
		Iterator<Element> cellsIter = cells.iterator();
		Elements dataCells = new Elements();
		while (cellsIter.hasNext()) {
			Element cell = cellsIter.next();
			if (cell.select("img").size() == 0 && cell.select("a").size() != 0) {
				dataCells.add(cell);
			}
		}
		
		LinkedList<String> links = new LinkedList<String>();
		Iterator<Element> dataIter = dataCells.iterator();
		while(dataIter.hasNext()) {
			Element data = dataIter.next();
			assume(data.select("a").size() == 1, URL, "there is only one link per property");
			
			links.add(data.select("a").attr("href"));
		}
		
		links = removeDuplicates(links);
		Iterator<String> linksIter = links.iterator();
		while(linksIter.hasNext()) {
			Property p = new Property();
			Address a = new Address();
			p.setAddress(a);
			
			scrapeIndividualPage(p, a, linksIter.next());
			
			addModel(p);
		}
	}
}
