import java.util.Iterator;
import java.util.LinkedList;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;

import com.nebuleaf.Spider;

public class Transwestern extends Spider {
	private final String[] URLS = {
			"http://citysites.transwestern.net/sales_national_new.asp?page=&city=23&pname=&submarket=&address=&ptype=&priceFrom=&priceTo=&sort=",
			"http://citysites.transwestern.net/sales_national_new.asp?page=&city=16&pname=&submarket=&address=&ptype=&priceFrom=&priceTo=&sort=",
			"http://citysites.transwestern.net/sales_national_new.asp?page=&city=21&pname=&submarket=&address=&ptype=&priceFrom=&priceTo=&sort=",
			"http://citysites.transwestern.net/sales_national_new.asp?page=&city=37&pname=&submarket=&address=&ptype=&priceFrom=&priceTo=&sort=",
			"http://citysites.transwestern.net/sales_national_new.asp?page=&city=24&pname=&submarket=&address=&ptype=&priceFrom=&priceTo=&sort=",
			"http://citysites.transwestern.net/sales_national_new.asp?page=&city=31&pname=&submarket=&address=&ptype=&priceFrom=&priceTo=&sort=",
			"http://citysites.transwestern.net/sales_national_new.asp?page=&city=25&pname=&submarket=&address=&ptype=&priceFrom=&priceTo=&sort="
	};
	private final String BROKER = "Transwestern"; 
	
	public void crawl() throws Exception {
		for (int i = 0; i < URLS.length; i ++) {
			Document doc = getDOM(URLS[i]);
			LinkedList<String> pageUrls = new LinkedList<String>();
			
			Element container = doc.select("td[colspan=7]").first();
			assume(container != null, URLS[i], "table containing the page is present");
			assume(container.select("> table").size() == 2, URLS[i], "table containing the page is in the correct format");
			
			Element table = container.select("table").get(1);
			assume(table.select("> tbody > tr").size() > 5, URLS[i], "the rows containing the properties are present, including the 5 rows at the top that don't contain properties");
			assume(table.select("> tbody > tr").get(1).select("td[colspan=6]").size() != 0, URLS[i], "the table data containing the number of pages is present");
			
			int numPages = doc.select("td[colspan=7]").first().select("table").get(1).select("> tbody > tr").get(1).select("td[colspan=6]").first().select("a").size();
			
			for (int j = 1; j <= numPages; j ++) {
				String[] splitUrl = URLS[i].split("(?<=(page=))");
				pageUrls.add(splitUrl[0] + j + splitUrl[1]);
			}
			
			String[] splitUrl = URLS[i].split("(?<=(page=))");
			pageUrls.add(splitUrl[0] + (numPages + 1) + splitUrl[1]);
			
			Iterator<String> pages = pageUrls.iterator();
			
			while(pages.hasNext()) {
				scrapePage(pages.next());
			}		
		}
	}
	
	private void scrapePage(String url) throws Exception {
		Document doc = getDOM(url);
		
		Iterator<Element> rows = doc.select("td[colspan=7]").first().select("table").get(1).select("> tbody > tr").iterator();
		burn(rows, 5);
		
		while (rows.hasNext()) {
			Element row = rows.next();
			
			if (row.select("> td").size() == 6) {
				Pattern pattern;
				Matcher matcher;
				Property p = new Property();
				Address a = new Address();
				
				p.setAddress(a);
				p.setSite(url);
				p.setBroker(BROKER);
				
				assume(row.select("> td").get(1).select("img").size() == 1, url, "there is only one image per property row");
				
				Picture pic = new Picture();
				pic.setLink("http://citysites.transwestern.net" + row.select("img").attr("src"));
				p.addImage(pic);
				
				Element data = row.select("td[width=320]").first();
				assume(data != null, url, "the cell with the title and location is present");
				
				String[] splitData = data.html().split("\\<.+\\>");
				LinkedList<String> dataList = new LinkedList<String>();
				
				for (int i = 0; i < splitData.length; i ++) {
					if (splitData[i].trim().matches("[\\w]+.*")) {
						dataList.add(splitData[i].trim());
					}
				}
				
				Iterator<String> dataIter = dataList.iterator();
				p.setTitle(dataIter.next());
				
				while(dataIter.hasNext()) {
					String str = dataIter.next();
					
					pattern = Pattern.compile("[A-Z][a-z ]+, [A-Z]{2}");
					matcher = pattern.matcher(str);
					if (matcher.find()) {
						a.setCity(matcher.group().split(", ")[0]);
						a.setState(matcher.group().split(", ")[1]);
					}
					
					pattern = Pattern.compile("\\d+ [\\w\\s]+");
					matcher = pattern.matcher(str);
					if (matcher.find()) {
						a.setStreet1(matcher.group());
					}
				}
				
				Contact c = new Contact();
				p.addContact(c);
				
				data = row.select("td[width=166]").first();
				assume(data != null, url, "the cell with the contact information is present");
				
				String emailHref = data.select("a").attr("href");
				
				c.setName(data.select("a").text());
				
				pattern = Pattern.compile("(?i)broker phone: \\d{3}\\.\\d{3}\\.\\d{4}");
				matcher = pattern.matcher(data.text());
				if (matcher.find()) {
					c.setPhone(matcher.group().split(": ")[1]);
				}
				
				pattern = Pattern.compile("mailto:.+");
				matcher = pattern.matcher(emailHref);
				if (matcher.find()) {
					c.setEmail(matcher.group().split(":")[1]);
				}
				
				addModel(p);
			}
		}
	}
}
