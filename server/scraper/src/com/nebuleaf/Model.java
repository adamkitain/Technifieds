package com.nebuleaf;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HashSet;
import java.util.Iterator;
import java.util.LinkedList;
import java.util.List;

import org.jvnet.inflector.Noun;

import com.mongodb.BasicDBObject;
import com.mongodb.DBObject;

/**
 * A generic model that holds data and interacts with a database. Serves as a common
 * entry point for documents in a collection as well as a "schema" for those documents.
 * 
 * @author Craig McCown
 *
 */
public abstract class Model {
	private StringField _checksum;
	private BoolField _temp;
	private LinkedList<Field> fields;
	
	public Model() {
		this.fields = new LinkedList<Field>();
		this._temp = new BoolField("_temp");
		this._checksum = new StringField("_checksum");
		fields.add(this._temp);
		fields.add(this._checksum);
	}
	
	/**
	 * Gives the checksum of the model
	 * 
	 * @return The model's checksum
	 */
	public String getChecksum() {
		return this._checksum.get();
	}
	
	/**
	 * Gives whether or not the model is temporary
	 * 
	 * @return Whether the model is temporary
	 */
	public boolean getTemporary() {
		return this._temp.get();
	}
	
	/**
	 * Sets this model's temporary property to true
	 */
	public void setTemporary(Boolean temp) {
		this._temp.set(temp);
	}
	
	/**
	 * Saves the data without unpacking it
	 * 
	 * @param dbCtrl
	 * @param collection
	 */
	public void saveRaw(DBController dbCtrl, String collection) {
		dbCtrl.save(collection, this.toEmbeddedDBObject());
	}
	
	/**
	 * Formats the data and inserts it into a Mongo collection
	 * 
	 * @param dbCtrl The interface through which the model writes to the database.
	 */
	public void save(DBController dbCtrl) {
		save(dbCtrl, Noun.pluralOf(this.getClass().getName().toLowerCase()), this.toEmbeddedDBObject());
	}
	
	/**
	 * Formats the data and inserts it into a Mongo collection
	 * 
	 * @param dbCtrl The interface through which the model writes to the database
	 * @param collection The name of the Mongo collection
	 */
	public void save(DBController dbCtrl, String collection) {
		save(dbCtrl, collection, this.toEmbeddedDBObject());
	}
	
	/**
	 * Recursive helper method that saves DBObjects into a collection. Any objects stored in arrays are stored in their own collection,
	 * and the checksum is used as a mapping key.
	 * 
	 * @param dbCtrl The interface through which the model writes to the database
	 * @param collection The name of the Mongo collection
	 * @param obj The obj to be unpacked and saved
	 */
	private void save(DBController dbCtrl, String collection, DBObject obj) {
		DBObject _obj = obj;
		Iterator<String> keys = _obj.keySet().iterator();
		while (keys.hasNext()) {
			String key = keys.next();
			if (_obj.get(key) instanceof List && ((List) _obj.get(key)).size() > 0 && ((List) _obj.get(key)).get(0) instanceof DBObject) {
				LinkedList<String> checksums = new LinkedList<String>();
				Iterator<DBObject> objs = ((List<DBObject>) _obj.get(key)).iterator();
				while (objs.hasNext()) {
					DBObject __obj = objs.next();
					checksums.add((String) __obj.get("_checksum"));
					save(dbCtrl, key, __obj);
				}
				
				_obj.put(key, checksums);
			}
		}

		dbCtrl.save(collection, _obj);
	}
	
	/**
	 * Tests equality by delegating equality testing to all fields that aren't prefixed by '_'
	 * 
	 * @param obj The object that may or may not be equal to the model
	 * @return Whether or not the model is equal to the database object
	 */
	public boolean equals(DBObject obj) {
		DBObjectWrapper _obj = new DBObjectWrapper(obj);
		Iterator<Field> fieldsIter = this.fields.iterator();
		
		while (fieldsIter.hasNext()) {
			Field f = fieldsIter.next();
			if (f.key().charAt(0) != '_' && !f.equals(_obj.get(f.key()))) {
				return false;
			}
		}
		
		return true;
	}
	
	/**
	 * Converts the object to a BasicDBObject. Models in lists 
	 * 
	 * @return The BasicDBObject representation of the Model
	 */
	public BasicDBObject toEmbeddedDBObject() {
		DBObjectWrapper _obj = new DBObjectWrapper(new BasicDBObject());
		Iterator<Field> fieldsIter = this.fields.iterator();
		
		while (fieldsIter.hasNext()) {
			Field f = fieldsIter.next();
			
			if (f instanceof ModelField && f.get() != null) {
				_obj = _obj.append(f.key(), ((ModelField) f).get().toEmbeddedDBObject());
			} else if (f instanceof ListField && ((ListField) f).get().size() != 0 && ((ListField) f).get().get(0) instanceof Model) {
				Iterator<Model> modelsIter = ((LinkedList<Model>) f.get()).iterator();
				LinkedList<DBObject> dbObjList = new LinkedList<DBObject>();
				while (modelsIter.hasNext()) {
					dbObjList.add(modelsIter.next().toEmbeddedDBObject());
				}			
				_obj = _obj.append(f.key(), dbObjList);
			} else if (f.key().charAt(0) == '_' && f.get() == null) {
			} else {
				_obj = _obj.append(f.key(), f.get());
			}
		}
		
		return (BasicDBObject) _obj.unwrap();
	}
	
	/**
	 * Generates a checksum using an input seed
	 * 
	 * @return The MD5 hash of the seed
	 */
	protected void generateChecksum(String seed) {
		seed = seed.replaceAll("[^a-zA-Z\\d]", "").replaceAll("(null)", "").toLowerCase();
		MessageDigest md5 = null;
		
		try {
			md5 = MessageDigest.getInstance("MD5");
		} catch (NoSuchAlgorithmException e) {
			e.printStackTrace();
		}
		
		byte[] bytes = md5.digest(seed.getBytes());
		
	    StringBuilder sb = new StringBuilder(bytes.length*2);
	    for(byte b: bytes) {
	    	sb.append(Integer.toHexString(b+0x800).substring(1));
	    }
		
		this._checksum.set(sb.toString());
	}

	/**
	 * Extends the functionality of DBObjects to use dot notation for gets and appends
	 * 
	 * @author Craig McCown
	 *
	 */
	protected class DBObjectWrapper {
		private DBObject obj;
		
		public DBObjectWrapper(DBObject obj) {
			this.obj = obj;
		}
		
		public Object get(String key) {
			DBObject _obj = this.obj;
			String[] path = key.split("\\.");
			
			for (int i = 0; i < path.length - 1; i ++) {
				_obj = (BasicDBObject) obj.get(path[i]);
			}
			
			return _obj.get(path[path.length - 1]);
		}
		
		public DBObjectWrapper append(String key, Object value) {
			BasicDBObject objCopy = new BasicDBObject(this.obj.toMap());
			BasicDBObject _obj = objCopy;
			String[] path = key.split("\\.");
			
			for (int i = 0; i < path.length - 1; i ++) {
				if (_obj.get(path[i]) == null) {
					objCopy.append(path[i], new BasicDBObject());
				} else if (!(_obj.get(path[i]) instanceof BasicDBObject)) {
					return this;
				}
				_obj = (BasicDBObject) _obj.get(path[i]);
			}
			
			_obj.append(path[path.length - 1], value);
			this.obj = objCopy;
			return this;
		}
		
		public DBObject unwrap() {
			return this.obj;
		}
	}
	
	/**
	 * Holds instance data for Models and handles operations such as comparisons
	 * 
	 * @author Craig McCown
	 *
	 * @param <T> The type of data that the field holds
	 */
	protected abstract class Field<T> {
		private T data;
		private String key;
		
		public Field(String key) {
			this.key = key;
			fields.add(this);
		}
		
		public T get() {
			return this.data;
		}

		public void set(T data) {
			this.data = data;
		}
		
		public String key() {
			return key;
		}
		
		@Override
		public abstract boolean equals(Object o);
	}
	
	/**
	 * Holds String data
	 * 
	 * @author Craig McCown
	 *
	 */
	protected class StringField extends Field<String> {
		private boolean isIdentifier;
		
		public StringField(String key) {
			super(key);
			isIdentifier = false;
		}
		
		public boolean equals(Object o) {
			if (this.get() == null) {
				if (o == null || o == "") {
					return true;
				} else {
					return false;
				}
			} else {
				return this.get().equals(o);
			}
		}
	}
	
	/**
	 * Holds List data
	 * 
	 * @author Craig McCown
	 *
	 */
	protected class ListField extends Field<List> {
		public ListField(String key) {
			super(key);
			super.set(new LinkedList());
		}
		
		public boolean equals(Object o) {
			if (o instanceof List) {
				if (((List) o).size() == this.get().size()) {
					if (this.get().size() != 0) {
						if (this.get().get(0) instanceof Model) {
							if (((List) o).get(0) instanceof DBObject) {
								for (int i = 0; i < this.get().size(); i ++) {
									if (!((Model) this.get().get(i)).equals((DBObject) ((List) o).get(i))) {
										return false;
									}
								}
								return true;
							} else {
								return false;
							}
						} else {
							for (int i = 0; i < this.get().size(); i ++) {
								if (!this.get().get(i).equals(((List) o).get(i))) {
									return false;
								}
							}
							return true;
						}
					} else {
						return true;
					}
				} else {
					return false;
				}
			} else {
				return false;
			}
		}

        public void sanitize() {
            if (this.get().size() > 0 && this.get().get(0) instanceof Model) {
                List<Model> data = this.get();
                HashSet<String> checksums = new HashSet<String>();

                for(int i = 0; i < data.size(); i ++) {
                    if (checksums.contains(data.get(i).getChecksum())) {
                        data.remove(i);
                    } else {
                        checksums.add(data.get(i).getChecksum());
                    }
                }
            }
        }
		
		public void add(Object o) {
			List list = super.get();
			list.add(o);
			super.set(list);
		}
	}
	
	/**
	 * Holds Model data
	 * 
	 * @author Craig McCown
	 *
	 */
	protected class ModelField extends Field<Model> {
		public ModelField(String key) {
			super(key);
		}
		
		public boolean equals(Object o) {
			if (this.get() == null) {
				if (o == null) {
					return true;
				} else {
					return false;
				}
			} else {
				if (o instanceof DBObject) {
					return this.get().equals((DBObject) o);
				} else {
					return false;
				}
			}
		}
	}
	
	/**
	 * Holds boolean data
	 * 
	 * @author Craig McCown
	 *
	 */
	protected class BoolField extends Field<Boolean> {
		public BoolField(String key) {
			super(key);
		}

		public boolean equals(Object o) {
			if (this.get() == null) {
				if (o == null) {
					return true;
				} else {
					return false;
				}
			} else {
				return o.equals(super.get());
			}
		}
		
		public void setTrue() {
			super.set(true);
		}
		
		public void setFalse() {
			super.set(false);
		}
		
		public void toggle() {
			super.set(!super.get());
		}
	}
}
