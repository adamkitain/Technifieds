import geb.*;
import com.nebuleaf.Spider;

public class Rock extends Spider {
	private final String URL = "http://rockapartmentadvisors.com/properties-available-larger.html";
	private final String BROKER = "Rock Apartment Advisors";

	public void crawl() {
		Browser.drive {
			go URL
			
			assert { title: startsWith("Rock Apartment Advisors") }
			
			def tables = $("table")
			assert { tables.size() > 0 }
			
			for (def i = 0; i < tables.size(); i ++) {
				def table = tables.getAt(i)
				def data = table.find("td")
				assert { data.size() == 4 }
				assert { data.getAt(0).children().size() == 0 }
				assert { data.getAt(1).find("img").size() != 0 }				
				
				def p = new Property()
				def a = new Address()
				def matcher
				
				p.setAddress(a);
				p.setSite(URL);
				p.setBroker(BROKER);
				p.setTitle(data.getAt(0).text())
				
				Picture pic = new Picture();
				pic.setLink(data.getAt(1).find("img").@src)
				p.addImage(pic)
				
				matcher = data.getAt(2).text() =~ "[A-Z][a-z]+, [A-Z]{2}"
				if (matcher.find()) {
					a.setCity(matcher.group().split(",")[0]);
					a.setState(matcher.group().split(",")[1]);
				}
				
				matcher = data.getAt(2).text() =~ "(?i)\\d+ units"
				if (matcher.find()) {
					p.setNumUnits(matcher.group().split(" ")[0])
				}
				
				addModel(p)
			}
		}
	}
	
}