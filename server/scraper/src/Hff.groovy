import com.nebuleaf.Spider;
import geb.*

public class Hff extends Spider {
	def URLS = [
		"http://www.hfflp.com/PropertiesOnMarket/PropertySearchResults.aspx?PGID=1&ST=AR",
		"http://www.hfflp.com/PropertiesOnMarket/PropertySearchResults.aspx?PGID=1&ST=DC",
		"http://www.hfflp.com/PropertiesOnMarket/PropertySearchResults.aspx?PGID=1&ST=FL",
		"http://www.hfflp.com/PropertiesOnMarket/PropertySearchResults.aspx?PGID=1&ST=TX",
		"http://www.hfflp.com/PropertiesOnMarket/PropertySearchResults.aspx?PGID=1&ST=NC",
		"http://www.hfflp.com/PropertiesOnMarket/PropertySearchResults.aspx?PGID=1&ST=SC",
		"http://www.hfflp.com/PropertiesOnMarket/PropertySearchResults.aspx?PGID=1&ST=KY",
		"http://www.hfflp.com/PropertiesOnMarket/PropertySearchResults.aspx?PGID=1&ST=AL",
		"http://www.hfflp.com/PropertiesOnMarket/PropertySearchResults.aspx?PGID=1&ST=MS",
		"http://www.hfflp.com/PropertiesOnMarket/PropertySearchResults.aspx?PGID=1&ST=LA",
		"http://www.hfflp.com/PropertiesOnMarket/PropertySearchResults.aspx?PGID=1&ST=TN",
		"http://www.hfflp.com/PropertiesOnMarket/PropertySearchResults.aspx?PGID=1&ST=VA",
		"http://www.hfflp.com/PropertiesOnMarket/PropertySearchResults.aspx?PGID=1&ST=GA"
	]
	private final String BROKER = "HFF"

	public void crawl() {
		Browser.drive {
			def links = []
			def matcher
			
			for (def i = 0; i < URLS.size(); i ++) {
				go URLS[i]
				
				try {
					waitFor { $("div.Tombstone") }
				} catch (e) {
					continue;
				}
				
				def tombstones = $("div.Tombstone")

				for (def j = 0; j < tombstones.size(); j ++) {
					def clickFunc = tombstones.getAt(j).find("div.Button").@onclick
					matcher = clickFunc =~ "\\(\\w+\\)"
					if (matcher.find()) {
						links.add("http://hfflp.com/PropertiesOnMarket/ListingDetail.aspx?LID=" + matcher.group().replaceAll("[()]", ""))
					}
				}
			}
			
			for (def i = 0; i < links.size(); i ++) {
				def p = new Property()
				def a = new Address()
				p.setAddress(a)

				go links[i]
				
				waitFor { $("div.Listing") }
				
				def address = $("div.Address")
				p.setSite(links[i])
				p.setBroker(BROKER)
				p.setTitle(address.find("span.Name").text())
				
				Picture pic = new Picture();
				pic.setLink($("div.OverviewImage img").@src)
				p.addImage(pic);
				
				def photoGalleryNav = $("a", text: contains(~/(?i)photo gallery/))
				if (photoGalleryNav.size() == 1) {
					def imageCode = photoGalleryNav.getAt(0).@href
					imageCode = imageCode =~ "Photo_Gallery_\\d+"
					def propertyCode = links[i] =~ "LID=\\d+"
					
					if (propertyCode.find() && imageCode.find()) {
						propertyCode = propertyCode.group().split("=")[1]
						imageCode = imageCode.group().split("_")[2]
						
						for (def j = 1; j <= 10; j ++) {
							p.addImage(new Picture("http://hfflp.com/Documents/Listings/Listing_" + propertyCode + "/GalleryPhotos_" + imageCode + "/pg" + j + ".jpg"))
						}
					}
				}
				
				def execSumm = $("div.ExecSmry").find("img")
				
				if (execSumm.size() == 1) {
					def params = execSumm.@onclick
					params = params =~ "\\(.+,\\s?\\d+,\\s?\\d+\\)"
					if (params.find()) {
						params = params.group().replaceAll("[\\(\\)\'\\s]", "")
						params = params.split(",")
						
						p.setFlyer("http://www.hfflp.com/GetDocument.aspx?ID=" + params[1] + "&FN=" + params[0] + "&DT=" + params[2])
					}
				}
				
				def status = $("div.Status")
				
				if (status.size() == 1) {
					p.setStatus(status.text())
				}
				
				def splitAddress = address.find("span").not(".Name").text().split("(?=([A-Z][a-z]+, [A-Z]{2}))")
				
				assert splitAddress.size() == 2
				
				a.setStreet1(splitAddress[0])
				
				matcher = splitAddress[1] =~ "[A-Z][a-z]+, [A-Z]{2}"
				if (matcher.find()) {					
					a.setCity(matcher.group().split(",")[0])
					a.setState(matcher.group().split(",")[1])
				}
				
				matcher = splitAddress[1] =~ "\\d{5}"
				if (matcher.find()) {
					a.setZip(matcher.group())
				}
				
				def overview = $("div.OverviewTable table").getAt(0)
				
				matcher = overview.text() =~ "(?i)size: \\d+"
				if (matcher.find()) {
					p.setNumUnits(matcher.group().split(" ")[1])
				}
				
				matcher = overview.text() =~ "(?i)built: \\d{4}"
				if (matcher.find()) {
					p.setYearBuilt(matcher.group().split(" ")[1])
				}
				
				def contacts = getDOM(links[i]).select("div#divContacts_0 table").first().select("td");

				for (def j = 0; j < contacts.size(); j ++) {
					def c = new Contact()
					p.addContact(c)

                    c.setName(contacts.get(j).select("b").text())

					matcher = contacts.get(j).select("a").attr("href") =~ "\\('\\w+@\\w+\\.(com|net|org)'\\)"
					if (matcher.find()) {
						c.setEmail(matcher.group().replaceAll("[()']", ""))
					}

                    matcher = contacts.get(j).text() =~ "\\(\\d{3}\\)\\s*\\d{3}-\\d{4}"
                    if (matcher.find()) {
                        c.setPhone(matcher.group())
                    }

				}
				
				addModel(p)
			}
		}
	}
}
