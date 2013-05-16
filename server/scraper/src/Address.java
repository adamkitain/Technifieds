import com.nebuleaf.Model;

public class Address extends Model {
	private StringField street1;
	private StringField street2;
	private StringField city;
	private StringField state;
	private StringField zip;
	
	public Address() {
		this.street1 = new StringField("street1");
		this.street2 = new StringField("street2");
		this.city = new StringField("city");
		this.state = new StringField("state");
		this.zip = new StringField("zip");
	}
	
	public void setStreet1(String street1) {
		this.street1.set(street1);
	}
	
	public void setStreet2(String street2) {
		this.street2.set(street2);
	}
	
	public void setCity(String city) {
		this.city.set(city);
	}
	
	public void setState(String state) {
		this.state.set(state);
	}
	
	public void setZip(String zip) {
		this.zip.set(zip);
	}
}
