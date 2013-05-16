package com.nebuleaf;

import java.util.Iterator;
import java.util.LinkedList;

import com.mongodb.BasicDBObject;
import com.mongodb.DBCursor;
import com.mongodb.DBObject;

public class ChangeTracker {
	
	private DBController ctrl;

	private String tags;
	private String raw;
	private String processed;
	
	public ChangeTracker(DBController ctrl, String tags, String raw, String processed) {
		this.ctrl = ctrl;
		this.tags = tags;
		this.raw = raw;
		this.processed = processed;
	}
	
	public void clean() {
		ctrl.drop(tags);
		ctrl.remove(raw, new BasicDBObject("_temp", true));
		ctrl.updateMulti(processed, new BasicDBObject("_scrubbed", true), new BasicDBObject("$set", new BasicDBObject("_scrubbed", false)));
	}
	
	public void add(LinkedList<Model> items) {
		Iterator<Model> itemsIter = items.iterator();
		
		while (itemsIter.hasNext()) {
			Model item = itemsIter.next();
			add(item);
		}
	}
	
	public void add(Model item) {
		Tag tag;
		DBObject comparisonObj = ctrl.findOne(raw, new BasicDBObject("_checksum", item.getChecksum()).append("_temp", false));
		
		if (item.getChecksum() != null) {
			if (comparisonObj == null) {
				tag = new Tag("new", item.getChecksum());
				tag.saveRaw(ctrl, tags);
				item.setTemporary(true);
				item.saveRaw(ctrl, raw);
			} else {
				if (item.equals(comparisonObj)) {
					tag = new Tag("ok", item.getChecksum());
					tag.saveRaw(ctrl, tags);
				} else {
					tag = new Tag("conflict", item.getChecksum());
					tag.saveRaw(ctrl, tags);
					item.setTemporary(true);
					item.saveRaw(ctrl, raw);
				}
			}
		}
	}
	
	public void finalize() {
		DBCursor cursor = ctrl.findAll(processed);
		
		while (cursor.hasNext()) {
			DBObject processedObj = cursor.next();
			DBObject tagObj = ctrl.findOne(tags, new BasicDBObject("itemKey", processedObj.get("_checksum")));
			
			if (tagObj == null) {
				Tag tag = new Tag("removed", (String) processedObj.get("_checksum"));
				tag.saveRaw(ctrl, tags);
			}
		}
	}
	
	private class Tag extends Model {
		private StringField tag;
		private StringField itemKey;
		private BoolField _current;
		
		public Tag(String tag, String itemKey) {
			this.tag = new StringField("tag");
			this.itemKey = new StringField("itemKey");
			this._current = new BoolField("_current");
			this.tag.set(tag);
			this.itemKey.set(itemKey);
			this._current.set(true);
		}
	}
}
