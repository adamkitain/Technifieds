package com.nebuleaf;

import java.util.HashSet;
import java.util.Iterator;
import java.util.LinkedList;

import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;


/**
 * Crawls through a website and collects data
 * 
 * @author Craig McCown
 *
 */
public abstract class Spider {
	private LinkedList<Model> models;
	
	public Spider() {
		this.models = new LinkedList<Model>();
	}
	
	/**
	 * Scrapes down data and stores it in a Models. Specific implementation is unique to each
	 * website.
	 */
	public abstract void crawl() throws Exception;
	
	/**
	 * Accessor to the list of Models that the crawl method has populated
	 * 
	 * @return A list of Models holding data from the website
	 */
	public LinkedList<Model> getData() {
		return models;
	}
	
	protected Document getDOM(String url) throws Exception {
		System.out.println("Getting static html from " + url);
		return Jsoup
               .connect(url)
               .timeout(30000)
               .header("User-Agent", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_6_8) AppleWebKit/537.31 (KHTML, like Gecko) Chrome/26.0.1410.65 Safari/537.31")
               .get();
	}
	
	/**
	 * Adds a Model instance to the list of Models
	 * 
	 * @param m The Model instance to add
	 */
	protected void addModel(Model m) {
		models.add(m);
	}
	
	/**
	 * Skips any number of nodes in an Iterator
	 * 
	 * @param iterator The iterator
	 * @param amount The number of nodes to skip
	 */
	protected void burn(Iterator<Element> iterator, int amount) {
		for (int i = 0; i < amount; i ++) {
			iterator.next();
		}
	}
	
	/**
	 * Removes duplicate Strings in a LinkedList
	 * 
	 * @param list The LinkedList with duplicates
	 * @return The LinkedList without duplicates
	 */
	protected LinkedList<String> removeDuplicates(LinkedList<String> list) {
		return new LinkedList<String>(new HashSet<String>(list));
	}
	
	/**
	 * Takes all characters not letters, spaces, or digits
	 * 
	 * @param str the string to be normalized
	 * @return the normalized string
	 */
	protected String normalize(String str) {
		return str.replaceAll("[^\\w\\s\\d]", "");
	}
	
	protected void assume(boolean condition, String url, String assumption) throws Exception {
		if (!condition) {
			throw new Exception("Assumption failed at " + url + ": " + assumption + "\n");
		}
	}
}
