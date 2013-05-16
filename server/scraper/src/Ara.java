import java.util.HashMap;
import java.util.Iterator;
import java.util.LinkedList;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.jsoup.Connection.Method;
import org.jsoup.Jsoup;
import org.jsoup.Connection;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;

import com.nebuleaf.Spider;

public class Ara extends Spider {
	public final String URL = "http://listings.arausa.com/";
	public final String BROKER = "ARA";

	public void crawl() throws Exception {
		Document doc = getDOM(URL);
		LinkedList<String> urls = new LinkedList<String>();

        int numPages = findNumPages(doc);
		String firstHalf = "http://listings.arausa.com/index.cfm?doPage=";
		String secondHalf = "&doOrder=ltOrder&doOrder2nd=&doDir=ASC&doOffice=0&goOffice=0&doType=All&doState=All";
		
		for (int i = 1; i <= numPages; i ++) {
			urls.add(firstHalf + i + secondHalf);
		}
		
		Iterator<String> urlsIter = urls.iterator();
		while (urlsIter.hasNext()) {
			String url = urlsIter.next();
			Elements listings = getListings(url);
			Iterator<Element> listingsIter = listings.iterator();
			
			while (listingsIter.hasNext()) {
				Element listing = listingsIter.next();
				
				if (isInValidState(listing)) {
					Property p = new Property();
					Address a = new Address();
					p.setAddress(a);
					p.setSite(url);
					p.setBroker(BROKER);
					handleListing(listing, p, a);
				}
			}
		}
	}
	
	private int findNumPages(Document doc) throws Exception {
		Pattern pattern;
		Matcher matcher;
		
		Element pages = doc.select("span.pages-count").first();
		String numPages = null;
		
		assume(pages != null, URL, "can't find number of pages");
		
		pattern = Pattern.compile("Page 1 of \\d+");
		matcher = pattern.matcher(pages.text());
		if (matcher.find()) {
			String[] tokens = matcher.group().split(" ");
			numPages = tokens[tokens.length - 1];
		} else {
			throw new Exception("Couldn't find pages on " + URL);
		}
		
		return Integer.parseInt(numPages);
	}
	
	private Elements getListings(String url) throws Exception {
		return getDOM(url).select("ul.results-list > li");
	}
	
	private boolean isInValidState(Element listing) {
		String[] states = {
			"FL",
			"GA",
			"AL",
			"MS",
			"LA",
			"TX",
			"TN",
			"SC",
			"NC",
			"VA",
			"KY",
			"AK"
		};
		
		String text = listing.select("address").text();
		Pattern pattern = Pattern.compile("\\w+, [A-Z]{2}");
		Matcher matcher = pattern.matcher(text);
		
		if (matcher.find()) {
			String state = matcher.group().split(" ")[1];
			for (int i = 0; i < states.length; i ++) {
				if (state.equals(states[i])) {
					return true;
				}
			}
		}
		
		return false;
	}
	
	private void handleListing(Element listing, Property p, Address a) throws Exception {
		Pattern pattern;
		Matcher matcher;
		
		Elements title = listing.select("h2");
		
		assume(title.size() == 1, URL, "the title is correctly identified");
		
		p.setTitle(title.first().text());
		
		Elements thumb = listing.select("img");
		
		assume(thumb.size() == 1, URL, "there is only one image per listing");
		
		Picture img = new Picture();
		img.setLink(thumb.first().attr("src"));
		p.addImage(img);
		
		Element address = listing.select("address").first();
		
		assume(address != null, URL, "an address element is present");
		
		pattern = Pattern.compile("\\w+, [A-Z]{2}");
		matcher = pattern.matcher(address.text());
		
		if (matcher.find()) {
			String[] cityState = matcher.group().split(", ");
			a.setCity(cityState[0]);
			a.setState(cityState[1]);
		}
		
		Elements status = listing.select("h3");
		
		assume(status.size() < 2, URL, "the property status is correctly identified");
		
		if (status.first() != null) {
			p.setStatus(status.text());
		}
		
		Element description = listing.select("dl.description").first();
		
		assume(description != null, URL, "the description on right side of the listing element is present");
		
		Elements descriptionKeys = description.select("dt");
		Elements descriptionValues = description.select("dd");
		
		assume(descriptionKeys.size() == descriptionValues.size(), URL, "the number of titles in the description table is equal to the number of values");
		
		Iterator<Element> descriptionKeysIter = descriptionKeys.iterator();
		Iterator<Element> descriptionValuesIter = descriptionValues.iterator();
		
		while (descriptionKeysIter.hasNext()) {
			Element descriptionKey = descriptionKeysIter.next();
			Element descriptionValue = descriptionValuesIter.next();
			
			if (descriptionKey.text().toLowerCase().contains("price")) {
				p.setPrice(descriptionValue.text());
			} else if (descriptionKey.text().toLowerCase().contains("units")) {
				p.setNumUnits(descriptionValue.text());
			} else if (descriptionKey.text().toLowerCase().contains("yoc")) {
				p.setYearBuilt(descriptionValue.text());
			}
		}
		
		Elements links = listing.select("a");
		
		assume(links.size() > 0, URL, "there is at least one link attached to the listing");
		
		scrapeIndividualPage(links.first().attr("href"), p, a);

		addModel(p);
    }
	
	private void scrapeIndividualPage(String url, Property p, Address a) throws Exception {
		p.setSite(url);
		Pattern pattern;
		Matcher matcher;

        Document doc = getDOM(url);

        if (doc.select("input#inITEmail").size() == 1) {
            doc = accessSecurePage(url);
        }
		
		Elements contactSidebar = doc.select("ul.contacts-list");
				
		assume(contactSidebar.size() == 1, url, "the contacts sidebar exists and has been correctly identified");
		
		Elements contacts = contactSidebar.first().children();
		Iterator<Element> contactsIter = contacts.iterator();
		
		while(contactsIter.hasNext()) {
			Element contact = contactsIter.next();
			if (isContact(contact)) {
				Contact c = new Contact();
				p.addContact(c);
				
				c.setName(contact.select("> strong").text());
				c.setPhone(contact.select("> span").text());
				
				Elements icons = contact.select("> ul > li");
				
				assume(icons.size() == 2, url, "there are only two icons under the contact");
				
				c.setEmail(icons.get(1).text());
			}
		}
		
		Element content = doc.select("article#content").first();
		
		assume(content != null, url, "the content area is present");

		Elements images = content.select("img");
		if (images.size() > 0) {
			Iterator<Element> imagesIter = images.iterator();
			while (imagesIter.hasNext()) {
				Picture image = new Picture();
				p.addImage(image);
				image.setLink(imagesIter.next().attr("src"));
			}
		}
		
		pattern = Pattern.compile("\\d{1,5} [\\w\\s]+\\w+, [A-Z]{2},? \\d{5}");
		matcher = pattern.matcher(content.text());
		
		if (matcher.find()) {
			String[] streetZip = matcher.group().split("\\w+, [A-Z]{2}");
			a.setStreet1(streetZip[0]);
			a.setZip(streetZip[1]);
		} else {
			pattern = Pattern.compile(", [A-Z]{2},? \\d{5}");
			matcher = pattern.matcher(content.text());
			
			if (matcher.find()) {
				String[] zip = matcher.group().split(" ");
				a.setZip(zip[zip.length - 1]);
			}
		}
	}
	
	private Document accessSecurePage(String url) throws Exception {
        String _url = "http://arausa.listinglab.com//" + url.split("/")[3] + "/index.cfm?doLDPage=1";
        Map<String, String> cookies;
        HashMap<String, String> data;

        cookies =
            Jsoup
                .connect(_url)
                .method(Method.GET)
                .header("User-Agent", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_6_8) AppleWebKit/537.31 (KHTML, like Gecko) Chrome/26.0.1410.65 Safari/537.31")
                .timeout(30000)
                .execute()
                .cookies();


		data = new HashMap<String, String>();
        data.put("initFname", "Chaunce");
        data.put("initLname", "Worth");
        data.put("initCompany", "abc Company");
        data.put("initTitle", "");
        data.put("initStreet", "123 Main street");
        data.put("initStreet2", "");
        data.put("initCity", "Atlanta");
        data.put("initState", "GA");
        data.put("initZip", "30309");
        data.put("initCountry", "");
        data.put("initPhone_work", "770-555-9901");
        data.put("initPhone_fax", "770-555-9902");
        data.put("initPhone_cell", "");
        data.put("initWebSite", "");
        data.put("initInvestor", "2");
        data.put("initEmail", "chaunce.worth@gmail.com");
        data.put("initID", "529090");
        data.put("doStep", "3");
        data.put("doEnter", "1");
        data.put("doLoginSubmit", "Continue");


        Connection connection =
            Jsoup
                .connect(_url)
                .method(Method.POST)
                .header("User-Agent", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_6_8) AppleWebKit/537.31 (KHTML, like Gecko) Chrome/26.0.1410.65 Safari/537.31")
                .header("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8")
                .header("Connection", "keep-alive")
                .header("Content-Type", "application/x-www-form-urlencoded")
                .header("Content-Length", "362")
                .data(data)
                .cookies(cookies)
                .timeout(30000);

        return Jsoup.parse(connection.execute().body());
	}

	private boolean isContact(Element contact) {
		return (contact.select("strong").size() == 1) && (contact.select("span").size() == 1) && (contact.select("ul").size() == 1) && (contact.children().size() == 3);
	}
}
