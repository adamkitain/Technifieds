import java.util.Iterator;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;

import com.nebuleaf.Spider;

public class Brown extends Spider {
	private final String URL = "http://www.brownrealtyadvisors.com/current_listings.cfm";
	private final String BROKER = "Brown Realty Advisors";

	public void crawl() throws Exception {
		Document doc = getDOM(URL);

		Element mainTable = doc.select("table[width=490]").first();
		assume(mainTable != null, URL, "center column table holding properties is present");
		
		Elements rows = mainTable.select("> tbody > tr");
		assume(rows.size() > 0, URL, "rows containing property information are present");
		
		Pattern pattern;
		Matcher matcher;
		
		Iterator<Element> rowsIter = rows.iterator();
		
		while(rowsIter.hasNext()) {
			Element row = rowsIter.next();
			Elements cells = row.select("> td");

			if (cells.size() == 6) {
				assume (cells.get(1).select("a img").size() == 1, URL, "second cell in property row has an image with a link to an individual page");
				assume (cells.get(2).select("a").size() == 1, URL, "third cell in property row has property information");
				assume (cells.get(4).select("strong").size() > 0, URL, "fifth cell in property row has property information");
				
				Property p = new Property();
				Address a = new Address();
				
				p.setAddress(a);
				p.setSite(URL);
				p.setBroker(BROKER);
				
				scrapeIndividualPage(p, cells.get(1).select("a").attr("href"));
				
				Element titleCityState = cells.get(2);
				p.setTitle(titleCityState.select("a").text());
				
				pattern = Pattern.compile("[A-Z][a-z]+, [A-Z]{2}");
				matcher = pattern.matcher(titleCityState.text());
				if (matcher.find()) {
					a.setCity(matcher.group().split(",")[0]);
					a.setState(matcher.group().split(",")[1]);
				}
				
				pattern = Pattern.compile("Units: \\d+");
				matcher = pattern.matcher(cells.get(4).text());
				if (matcher.find()) {
					p.setNumUnits(matcher.group().split(":")[1]);
				}
				
				addModel(p);
			}
		}
	}
	
	private void scrapeIndividualPage(Property p, String url) throws Exception {
		Document doc = getDOM(url);
		
		Pattern pattern;
		Matcher matcher;
		
		Element container = doc.select("table#content").first();
		assume(container != null, url, "table holding login form, contacts, and images is present");
		
		Elements tables = container.select("table.mainBody");
		assume(tables.get(1).select("font.contact").size() == 1, url, "contacts on right sidebar is present");
		assume(tables.get(2).select("img").size() > 0, url, "images on right sidebar are present");		
		
		String[] contacts = tables.get(1).html().split("(?=(<strong))");
		
		for (int i = 1; i < contacts.length; i ++) {
			Contact c = new Contact();
			
			p.addContact(c);
			
			String contactStr = contacts[i].split("target")[0];
			
			pattern = Pattern.compile("[A-Z][a-z]+ [A-Z][A-Za-z]+");
			matcher = pattern.matcher(contactStr);
			if (matcher.find()) {
				c.setName(matcher.group());
			}
			
			pattern = Pattern.compile("\\d{3}-\\d{3}-\\d{4}");
			matcher = pattern.matcher(contactStr);
			if (matcher.find()) {
				c.setPhone(matcher.group());
			}
			
			pattern = Pattern.compile("mailto:.+\"");
			matcher = pattern.matcher(contactStr);
			if (matcher.find()) {
				String email = matcher.group().split(":")[1];
				c.setEmail(email.substring(0, email.length() - 1));
			}
		}
		
		Iterator<Element> imagesIter = tables.get(2).select("img").iterator();
		
		while(imagesIter.hasNext()) {
			Picture i = new Picture();
			
			String link = imagesIter.next().attr("src");
			i.setLink(link.split("Thumb")[0] + link.split("Thumb")[1]);
			
			p.addImage(i);
		}
	}
}
