import java.util.Iterator;
import java.util.LinkedList;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;

import com.nebuleaf.Spider;

public class Cushwake extends Spider {
	private final String BASE = "http://apartments.cushwake.com";
	private final String[] URLS = {
			"http://apartments.cushwake.com/property_listings.aspx?office_id=1&sortby=Listing&ascdesc=ASC&count=150",
			"http://apartments.cushwake.com/property_listings.aspx?office_id=4&sortby=Listing&ascdesc=ASC&count=150",
			"http://apartments.cushwake.com/property_listings.aspx?office_id=16&sortby=Listing&ascdesc=ASC&count=150",
			"http://apartments.cushwake.com/property_listings.aspx?office_id=6&sortby=Listing&ascdesc=ASC&count=150",
			"http://apartments.cushwake.com/property_listings.aspx?office_id=7&sortby=Listing&ascdesc=ASC&count=150",
			"http://apartments.cushwake.com/property_listings.aspx?office_id=17&sortby=Listing&ascdesc=ASC&count=150",
			"http://apartments.cushwake.com/property_listings.aspx?office_id=2&sortby=Listing&ascdesc=ASC&count=150",
			"http://apartments.cushwake.com/property_listings.aspx?office_id=12&sortby=Listing&ascdesc=ASC&count=150"
	};
	private final String BROKER = "Cushman & Wakefield";
	
	public void crawl() throws Exception {
		Document doc;
		LinkedList<String> propertyLinks = new LinkedList<String>();
		
		for (int i = 0; i < URLS.length; i ++) {
			doc = getDOM(URLS[i]);
			
			propertyLinks.addAll(getLinksFromListingPage(doc));
		}

		propertyLinks = removeDuplicates(propertyLinks);
		Iterator<String> propertyLinksIter = propertyLinks.iterator();
		while (propertyLinksIter.hasNext()) {
			getInfoFromPropertyPage(propertyLinksIter.next());
		}
	}
	
	private LinkedList<String> getLinksFromListingPage(Document doc) {
		LinkedList<String> propertyLinks = new LinkedList<String>();
		
		Elements anchors = doc.select("a");
		Iterator<Element> anchorsIter = anchors.iterator();
		
		while (anchorsIter.hasNext()) {
			Element anchor = anchorsIter.next();
			
			String href = anchor.attr("href");
			if (anchor.select("img").size() == 1 && href.substring(href.length() - 9).equals("thumbnail")) {
				propertyLinks.add(BASE + href);
			}
		}
		
		return new LinkedList<String>(propertyLinks);
	}
	
	private void getInfoFromPropertyPage(String url) throws Exception {
		Document doc = getDOM(url);
		assume(doc.select("img.thumbnail").size() == 1, url, "the thumbnail image is identified correctly");
		
		Pattern pattern;
		Matcher matcher;
		Property p = new Property();
		Address a = new Address();
		
		p.setSite(url);
		p.setAddress(a);
		p.setBroker(BROKER);
		
		Picture i = new Picture();
		i.setLink(BASE + doc.select("img.thumbnail").attr("src"));
		p.addImage(i);
		
		String text = doc.text();
		pattern = Pattern.compile("RESOURCES");
		matcher = pattern.matcher(text);
		
		if (matcher.find()) {
			text = text.substring(0, matcher.start());
		}
		
		pattern = Pattern.compile("LISTINGS");
		matcher = pattern.matcher(text);
		
		if (matcher.find()) {
			text = text.substring(matcher.end());
		}
		
		pattern = Pattern.compile("[A-Z][a-z]+, [A-Z]{2}");
		matcher = pattern.matcher(text);
		
		if (matcher.find()) {
			String cityAndState = text.substring(matcher.start(), matcher.end());
			a.setCity(cityAndState.split(",")[0]);
			a.setState(cityAndState.split(",")[1]);
			p.setTitle(text.substring(0, matcher.start()));
		}
		
		pattern = Pattern.compile("[\\d]+ Units");
		matcher = pattern.matcher(text);
		
		if (matcher.find()) {
			p.setNumUnits(text.substring(matcher.start(), matcher.end()).split(" ")[0]);
		}
		
		pattern = Pattern.compile("CONTACTS");
		matcher = pattern.matcher(text);
		
		if (matcher.find()) {
			text = text.substring(matcher.end() + 1);
		}
		
		int prevLength = text.length() + 1;
		while (text.length() > 1 && text.length() != prevLength) {
			Contact c = new Contact();
			prevLength = text.length();
			
			
			c.setName(text.split(" ")[0] + " " + text.split(" ")[1]);
			
			pattern = Pattern.compile("\\([\\d]{3}\\) [\\d]{3}-[\\d]{4}");
			matcher = pattern.matcher(text);
			
			if (matcher.find()) {
				c.setPhone(text.substring(matcher.start(), matcher.end()));
			}
			
			pattern = Pattern.compile("([_A-Za-z0-9-]+)(\\.[_A-Za-z0-9-]+)*@[A-Za-z0-9-]+(\\.[A-Za-z0-9-]+)*(\\.[A-Za-z]{2,})");
			matcher = pattern.matcher(text);
			
			if (matcher.find()) {
				c.setEmail(text.substring(matcher.start(), matcher.end()));
				text = text.substring(matcher.end() + 1);
			}
			
			p.addContact(c);
		}
		
		addModel(p);
	}
}
