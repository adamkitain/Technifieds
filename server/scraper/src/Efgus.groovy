import geb.Browser;

import java.util.Iterator;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.jsoup.nodes.*;
import org.jsoup.select.*;

import com.nebuleaf.Spider;

public class Efgus extends Spider {
	private final String URL = "http://www.efgus.com/properties.html";
	private final String BROKER = "Engler Financial Group";
	
	public void crawl() {
		Browser.drive {
			go URL
			
			assert { title: contains("Engler Financial Group") }
			assert { $("table", width: "782").size() == 1 }
			
			def rows = $("table", width: "782").children("tbody").children().filter(text: contains("PROPERTY"))
			
			for (def i = 0; i < rows.size(); i ++) {
				def cols = rows.getAt(i).find("td").has("p, img")
				
				assert cols.size() == 4
				
				def p = new Property()
				def a = new Address()
				def matcher
				
				p.setAddress(a)
				p.setBroker(BROKER)
				p.setSite(URL)
				p.setTitle(cols.getAt(1).find("p").getAt(0).text());
				a.setCity(cols.getAt(1).find("p").getAt(1).text().split(",")[0]);
				a.setState(cols.getAt(1).find("p").getAt(1).text().split(",")[1]);
				
				Picture pic = new Picture();
				pic.setLink(cols.getAt(0).find("img").@src)
				p.addImage(pic)
				
				matcher = cols.getAt(2).text() =~ "(?i)\\d+ units"
				if (matcher.find()) {
					p.setNumUnits(matcher.group().split(" ")[0])
				}
				
				matcher = cols.getAt(2).text() =~ "(1|2)\\d{3}"
				if (matcher.find()) {
					p.setYearBuilt(matcher.group())
				}
				
				addModel(p);
			}
		}
	}
}
