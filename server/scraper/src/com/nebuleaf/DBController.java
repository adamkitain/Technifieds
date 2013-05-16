package com.nebuleaf;

import java.net.UnknownHostException;

import com.mongodb.*;

/**
 * Provides a layer of abstraction over the MongoDB driver for Java
 * 
 * @author Craig McCown
 *
 */
public class DBController {

	private MongoClient client;
	private DB db;
	private String dbName;
	
	/**
	 * Constructs a new MongoDB controller with configuration options
	 * 
	 * @param address The IP address that the Mongo server is running on
	 * @param port The port that the Mongo server is running on
	 * @param dbName The name of the Mongo database
	 */
	public DBController(String address, int port, String dbName) {
		try {
			this.client = new MongoClient(address, port);
			this.dbName = dbName;
		} catch (UnknownHostException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}
	
	/**
	 * Connects to the Mongo server
	 */
	public void connect() {
		System.out.println("connecting to DB " + dbName);
		db = client.getDB(dbName);
	}

	/**
	 * Inserts a document
	 * 
	 * @param collName The name of the collection
	 * @param object The object to be inserted
	 */
	public void insert(String collName, DBObject object) {
		System.out.println("inserting item " + object + " into collection " + collName);
		DBCollection coll = db.getCollection(collName);
		coll.insert(object);
	}
	
	/**
	 * Updates a document and inserts it if it doesn't exist (based on _id)
	 * 
	 * @param collName The name of the collection
	 * @param object The object to be saved
	 */
	public void save(String collName, DBObject object) {
		System.out.println("saving item " + object + " into collection " + collName);
		DBCollection coll = db.getCollection(collName);
		coll.findAndModify(new BasicDBObject("_id", object.get("_id")), null, null, false, object, false, true);
	}
	
	/**
	 * Updates a document
	 * 
	 * @param collName The name of the collection
	 * @param query The query matching the document to be updated
	 * @param newObj The Mongo update object (for instance: new BasicDBObject("$set", new BasicDBObject("key", "value")) )
	 */
	public void update(String collName, DBObject query, DBObject newObj) {
		System.out.println("updating item " + query + " with item " + newObj + " in collection " + collName);
		DBCollection coll = db.getCollection(collName);
		coll.findAndModify(query, newObj);
	}
	
	/**
	 * Updates many documents
	 * 
	 * @param collName The name of the collection
	 * @param query The query matching the document to be updated
	 * @param newObj The Mongo update object (for instance: new BasicDBObject("$set", new BasicDBObject("key", "value")) )
	 */
	public void updateMulti(String collName, DBObject query, DBObject newObj) {
		System.out.println("updating items " + query + " with item " + newObj + " in collection " + collName);
		DBCollection coll = db.getCollection(collName);
		coll.update(query, newObj, false, true);
	}
	
	/**
	 * Finds all documents in a collection
	 * 
	 * @param collName The name of the collection
	 * @return The documents in the collection
	 */
	public DBCursor findAll(String collName) {
		System.out.println("finding all documents in collection " + collName);
		DBCollection coll = db.getCollection(collName);
		return coll.find();
	}
	
	/**
	 * Finds the first document matching the query
	 * 
	 * @param collName The name of the collection
	 * @param query The query
	 * @return The object if found, or null if not
	 */
	public DBObject findOne(String collName, DBObject query) {
		System.out.println("finding the first document matching item " + query + " in collection " + collName);
		DBCollection coll = db.getCollection(collName);
		DBCursor queryResult = coll.find(query);
		return queryResult.size() > 0 ? queryResult.next() : null;
	}
	
	/**
	 * Removes a single document
	 * 
	 * @param collName The name of the collection
	 * @param query The query matching the document to be removed
	 */
	public void remove(String collName, DBObject query) {
		DBCollection coll = db.getCollection(collName);
		System.out.println("removing item from DB");
		coll.remove(query);
	}
	
	/**
	 * Drops a collection
	 * 
	 * @param collName The name of the collection
	 */
	public void drop(String collName) {
		DBCollection coll = db.getCollection(collName);
		coll.drop();
	}
}
