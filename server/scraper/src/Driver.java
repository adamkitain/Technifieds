import java.util.Iterator;
import java.util.LinkedList;

import com.nebuleaf.ChangeTracker;
import com.nebuleaf.DBController;
import com.nebuleaf.Model;
import com.nebuleaf.Spider;

public class Driver {
	
	public static void main(String[] args) {
		java.util.logging.Logger.getLogger("com.gargoylesoftware").setLevel(java.util.logging.Level.OFF);
		
		LinkedList<Spider> spiders = new LinkedList<Spider>();
		DBController ctrl;
		
		// connect to db
		ctrl = new DBController("localhost", 27017, "rescour_scraper");
		ctrl.connect();
		
		ctrl.drop("raw");
		
		// set up tracking
//		ChangeTracker tracker = new ChangeTracker(ctrl, "tags", "raw", "properties");
//		tracker.clean();
		
		// add spiders
		spiders.add(new Cushwake());
		spiders.add(new Rock());
		spiders.add(new CapitalAdvisors());
		spiders.add(new Brown());
		spiders.add(new JonesLangLaSalleAtlanta());
        spiders.add(new JonesLangLaSalleMidAtlantic());
		spiders.add(new Hff());
		spiders.add(new CbreAtlanta());
		spiders.add(new CbreAustin());
		spiders.add(new CbreCharlotte());
		spiders.add(new CbreDallas());
		spiders.add(new CbreFortLauderdale());
		spiders.add(new CbreHouston());
		spiders.add(new CbreTampa());
		spiders.add(new Ara());
		
		Iterator<Spider> spidersIter = spiders.iterator();
		
		while (spidersIter.hasNext()) {
			Spider spider = spidersIter.next();
			
			try {
				spider.crawl();
			} catch (Exception e) {
				e.printStackTrace();
			}
			
			LinkedList<Model> data = spider.getData();
			
			Iterator<Model> itemsIter = data.iterator();
			
			while (itemsIter.hasNext()) {
				ctrl.insert("raw", itemsIter.next().toEmbeddedDBObject());
			}
			
//			tracker.add(data);
		}
		
//		tracker.finalize();
	}
}