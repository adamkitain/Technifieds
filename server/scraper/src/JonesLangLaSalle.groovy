import com.nebuleaf.Spider
import geb.Browser

abstract class JonesLangLaSalle extends Spider {
	public void scrapeJLL(url, selection) {
        def broker = "Jones Lang LaSalle";

		Browser.drive {
		    go url

		    waitFor { $("div#WebPartWPQ1") }

			def container = $("body");
			def imgs = container.find(selection).has("img");
			def data = container.find(selection).has("a");
			
			assert { imgs.size() == data.size() }
			
			for (def i = 0; i < data.size(); i ++) {	
				def img = imgs.getAt(i)
				def text = data.getAt(i)	
				assert { text.find("b, strong") }
					
				def p = new Property()
				def a = new Address()
				def matcher
				
				p.setAddress(a)
				p.setBroker(broker)
				p.setSite(url)
				p.setTitle(text.find("b, strong").text())
				
				Picture pic = new Picture()
				pic.setLink(img.find("img").@src)
				p.addImage(pic);

                def flyerLink = text.find("a")

                assert { flyerLink.size() == 1 }

                p.setFlyer(flyerLink.@href);

				
				matcher = text.text() =~ "[A-Z][a-z]+, [A-Z]{2}"
				if (matcher.find()) {
					a.setCity(matcher[0].split(",")[0])
					a.setState(matcher[0].split(",")[1])
				}
				
				matcher = text.text() =~ "\\d[\\d]{3}"
				if (matcher.find()) {
					p.setYearBuilt(matcher[0])
				}
				
				matcher = text.text() =~ "(?i)[\\d]+ units"
				if (matcher.find()) {
					p.setNumUnits(matcher[0].split(" ")[0])
				}
				
				addModel(p)
			}
		}
	}
}
