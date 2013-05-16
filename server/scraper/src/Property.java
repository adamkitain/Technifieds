import com.nebuleaf.Model;

public class Property extends Model {
	private StringField site;
	private StringField title;
	private StringField broker;
	private ModelField address;
	private StringField numUnits;
	private StringField yearBuilt;
	private ListField contacts;
	private ListField images;
	private StringField status;
	private StringField price;
	private StringField flyer;

	public Property() {
		this.site = new StringField("site");
		this.title = new StringField("title");
		this.broker = new StringField("broker");
		this.address = new ModelField("address");
		this.numUnits = new StringField("numUnits");
		this.yearBuilt = new StringField("yearBuilt");
		this.contacts = new ListField("contacts");
		this.images = new ListField("images");
		this.status = new StringField("propertyStatus");
		this.price = new StringField("price");
		this.flyer = new StringField("flyer");
	}
	
	public void setSite(String site) {
		if (this.title.get() != null) {
			generateChecksum(site + this.title.get());
		}
		this.site.set(site);
	}
	
	public void setTitle(String title) {
		if (this.site.get() != null) {
			generateChecksum(this.site.get() + title);
		}
		this.title.set(title);
	}

	public void setBroker(String broker) {
		this.broker.set(broker);
	}

	public void setAddress(Address address) {
		this.address.set(address);
	}

	public void setNumUnits(String numUnits) {
		this.numUnits.set(numUnits);
	}

	public void setYearBuilt(String yearBuilt) {
		this.yearBuilt.set(yearBuilt);
	}

	public void addContact(Contact contact) {
		this.contacts.add(contact);
	}
	
	public void addImage(Picture image) {
		this.images.add(image);
        this.images.sanitize();
    }
	
	public void setPrice(String price) {
		this.price.set(price);
	}
	
	public void setStatus(String status) {
		this.status.set(status);
	}
	
	public void setFlyer(String flyer) {
		this.flyer.set(flyer);
	}

    public boolean isValid() {
        return this.title.get() != null && this.site.get() != null;
    }
}
