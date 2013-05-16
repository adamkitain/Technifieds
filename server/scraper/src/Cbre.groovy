import geb.Browser;

import java.awt.Image;
import java.util.Iterator;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;

import com.nebuleaf.Spider;


public abstract class Cbre extends Spider {
	protected void scrapeIndividualPage(Property p, Address a, String url) throws Exception {
		Document doc = getDOM(url);

        p.setBroker("CBRE");
        p.setSite(url);
		
		if (!isMarketplacePage(url)) {
			return;
		} else if (isErrorPage(url)) {
			return;
		}
		
		assume(doc.select("img").size() > 0, url, "images are present");
		assume(doc.select("#divOfferedBy").size() == 1, url, "contact div is present");
		assume(doc.select("div.contentPageRight > div.propertyLegend > table").size() == 1, url, "the table with the details next to the image slider is present");
		
		Pattern pattern;
		Matcher matcher;
		
		Iterator<Element> imgs = doc.select("img").iterator();
		while (imgs.hasNext()) {
			Picture i = new Picture();
			i.setLink(imgs.next().attr("src"))
			p.addImage(i);
		}
		
		Iterator<Element> details = doc.select("div.contentPageRight > div.propertyLegend > table > tbody > tr").iterator();
		while (details.hasNext()) {
            Element detail = details.next();
            assume(detail.children().size() == 2, url, "the rows in the details table are in the correct format");

			if (detail.children().get(0).text().trim().matches("(?i)units")) {
				pattern = Pattern.compile("\\d+");
				matcher = pattern.matcher(detail.children().get(1).text());
				if (matcher.find()) {
					p.setNumUnits(matcher.group());
				}
			}
		}
		
		Iterator<Element> contacts = doc.select("#divOfferedBy > p").iterator();
		while (contacts.hasNext()) {
			Contact c = new Contact();
			p.addContact(c);
			
			Element contact = contacts.next();
			assume(contact.select("strong").size() == 1, url, "the contact name is correctly identified");
			assume(contact.select("a").size() == 1, url, "the contact name is correctly identified");
			
			c.setName(contact.select("strong").text());
			c.setEmail(contact.select("a").text());
			
			pattern = Pattern.compile("\\d{3}-\\d{3}-\\d{4}");
			matcher = pattern.matcher(contact.text());
			if (matcher.find()) {
				c.setPhone(matcher.group());
			}
		}
		
		Element address = doc.select("div.headerProperty").first();
		assume(address.select("h1").size() == 1, url, "the title at the top of the page is correctly identified");
		assume(address.select("span").size() == 5, url, "the text at the top with the address information is in the correct format");
		
		p.setTitle(address.select("h1").text());
		a.setStreet1(address.select("div").get(1).text());
		a.setCity(address.select("div").get(2).select("span").get(0).text());
		a.setState(address.select("div").get(2).select("span").get(1).text());
		a.setZip(address.select("div").get(2).select("span").get(2).text());
	}
	
	private boolean isErrorPage(url) {
		def error = false
		
		Browser.drive {
			go url
			
			waitFor { $("div.message.error") }
			
			if ($("div.message.error").@style == null) {
				error = true
			}
		}
		
		return error
	}
	
	private boolean isMarketplacePage(url) {
		def market = true
		
		Browser.drive {
			go url
			
			if (!$("title").text().contains("Marketplace")) {
				market = false
			} 
		}
		
		return market
	}
}
