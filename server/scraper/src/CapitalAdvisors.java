import java.util.Iterator;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;

import com.nebuleaf.Spider;

public class CapitalAdvisors extends Spider {
	private final String URL = "http://is.capadvisors.com/listings.cfm";
	private final String BROKER = "Capital Advisors";
	
	public void crawl() throws Exception {
		Document doc = getDOM(URL);

		Pattern pattern;
		Matcher matcher;
		
		Elements tables = doc.select("td.style24 > table");
		assume(tables.size() > 0, URL, "tables containing property information are present");
		
		Iterator<Element> tablesIter = tables.iterator();

		while (tablesIter.hasNext()) {
			Element table = tablesIter.next().select("> tbody > tr").first();
			assume(table != null, URL, "table row with all the information and the image is present");
			
			Elements cells = table.select("> td");
			assume(cells.size() == 4, URL, "table row with all the information is in the right format");
			assume(cells.get(1).select("a strong").size() == 1, URL, "the title is correctly identified");
			assume(cells.get(3).select("a img").size() == 1, URL, "the fourth cell in the table row with the information has a linked image");
			
			Property p = new Property();
			Address a = new Address();
			
			p.setAddress(a);
			p.setBroker(BROKER);
			p.setSite(URL);
			p.setTitle(cells.get(1).select("a strong").text());
			
			pattern = Pattern.compile("[A-Z][a-z]+, [A-Z]{2}");
			matcher = pattern.matcher(cells.get(1).text());
			if (matcher.find()) {
				a.setCity(matcher.group().split(",")[0]);
				a.setState(matcher.group().split(",")[1]);
			}
			
			pattern = Pattern.compile("Units: \\d+");
			matcher = pattern.matcher(cells.get(2).text());
			if (matcher.find()) {
				p.setNumUnits(matcher.group().split(" ")[1]);
			}
			
			Picture i = new Picture();
			p.addImage(i);
			
			i.setLink(cells.get(3).select("img").attr("src"));
			
			getContacts(p, cells.get(3).select("a").attr("href"));
			
			addModel(p);
		}
	}
	
	private void getContacts(Property p, String url) throws Exception {
		Document doc = getDOM(url);
		
		Elements cells = doc.select("td.style24");
		assume(cells.size() == 3, url, "there are three areas of interest on the page");
		
		Element contactCell = cells.get(2);
		assume(contactCell.text().contains("CONTACT INFORMATION"), url, "the third area of interest on the page contains the contact information");
		
		Pattern pattern;
		Matcher matcher;
		
		String contactString = contactCell.text();
		String[] contacts = contactString.split("(?<=(\\.(com|net|org)))");
		
		for (int i = 0; i < contacts.length; i ++) {
			Contact c = new Contact();
			
			p.addContact(c);
			
			pattern = Pattern.compile("[A-Z][a-z]+ [A-Z][A-Za-z]+");
			matcher = pattern.matcher(contacts[i]);
			if (matcher.find()) {
				c.setName(matcher.group());
			}
			
			pattern = Pattern.compile("\\d{3}-\\d{3}-\\d{4}");
			matcher = pattern.matcher(contacts[i]);
			if (matcher.find()) {
				c.setPhone(matcher.group());
			}
			
			pattern = Pattern.compile("([_A-Za-z0-9-]+)(\\.[_A-Za-z0-9-]+)*@[A-Za-z0-9-]+(\\.[A-Za-z0-9-]+)*(\\.[A-Za-z]{2,})");
			matcher = pattern.matcher(contacts[i]);
			if (matcher.find()) {
				c.setEmail(matcher.group());
			}
		}
	}
}
