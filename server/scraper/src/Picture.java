import com.nebuleaf.Model;

public class Picture extends Model {
	private StringField link;
	
	public Picture() {
		link = new StringField("link");
	}
	
	public Picture(String link) {
        generateChecksum(link);
		this.link = new StringField("link");
		this.link.set(link);
	}
	
	public void setLink(String link) {
		generateChecksum(link);
		this.link.set(link);
	}
}
