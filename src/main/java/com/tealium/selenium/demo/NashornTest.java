package com.tealium.selenium.demo;

import javax.script.*;

public class NashornTest {
	public static void main(String args[]) {
		ScriptEngineManager manager = new ScriptEngineManager();
		for (ScriptEngineFactory f : manager.getEngineFactories()) {
			printBasicInfo(f);
			System.out.println();
		}
 
		ScriptEngine nashorn = manager.getEngineByName("nashorn");
		if(nashorn != null) {
			System.out.println("Nashorn is present.");
		}
		else {
			System.out.println("Nashorn is not present.");
		}
	}
 
	public static void printBasicInfo(ScriptEngineFactory factory) {
		System.out.println("engine name=" + factory.getEngineName());
		System.out.println("engine version=" + factory.getEngineVersion());
		System.out.println("language name=" + factory.getLanguageName());
		System.out.println("extensions=" + factory.getExtensions());
		System.out.println("language version=" + factory.getLanguageVersion());
		System.out.println("names=" + factory.getNames());
		System.out.println("mime types=" + factory.getMimeTypes());
	}
}