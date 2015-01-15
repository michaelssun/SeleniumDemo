package com.tealium.selenium.demo;

import java.net.MalformedURLException;
import java.net.URL;
import java.util.concurrent.TimeUnit;

import org.openqa.selenium.Dimension;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.remote.RemoteWebDriver;

public class RemoteWebDriverDemo {
	private static final String HUB_URL = "http://localhost:4444/wd/hub";
	static WebDriver driver;
	
	public static void test1() throws MalformedURLException{
	   DesiredCapabilities capability = DesiredCapabilities.firefox();
	//	  DesiredCapabilities capability = DesiredCapabilities.internetExplorer();

		  driver = new RemoteWebDriver(new URL(HUB_URL), capability);


		//  driver = new FirefoxDriver();  //for local check

		  driver.manage().timeouts().implicitlyWait(20, TimeUnit.SECONDS);
		  driver.manage().timeouts().pageLoadTimeout(30, TimeUnit.SECONDS);
		  driver.manage().window().setSize(new Dimension(1920, 1080));
		  driver.quit();
	}
	
	public static void main(String[] args) throws MalformedURLException {
		test1();
	}
	

}
