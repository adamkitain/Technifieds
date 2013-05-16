import com.nebuleaf.Model;

public class Contact extends Model {
	private StringField name;
	private StringField phone;
	private StringField email;
	
	public Contact() {
		this.name = new StringField("name");
		this.phone = new StringField("phone");
		this.email = new StringField("email");
	}
	
	public void setName(String name) {
		this.name.set(name);
		generateChecksum();
	}
	
	public void setPhone(String phone) {
		this.phone.set(phone);
		generateChecksum();
	}
	
	public void setEmail(String email) {
		this.email.set(email);
		generateChecksum();
	}
	
	private void generateChecksum() {
		generateChecksum(this.name.get() + this.phone.get() + this.email.get());
	}
}
