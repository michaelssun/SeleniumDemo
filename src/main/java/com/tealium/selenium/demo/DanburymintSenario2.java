package com.tealium.selenium.demo;

import java.io.File;
import java.io.IOException;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.concurrent.TimeUnit;

import org.apache.commons.io.FileUtils;
import org.openqa.selenium.By;
import org.openqa.selenium.Dimension;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.OutputType;
import org.openqa.selenium.TakesScreenshot;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.remote.Augmenter;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.remote.RemoteWebDriver;

public class DanburymintSenario2 {
	public static final String HUB_URL = "http://localhost:4444/wd/hub";
	public static final String BASE_URL = "http://mbiweb:d3vmb!$201405@resp.danburymint-test.com";

	static WebDriver driver;

	public static void verifySenario1() throws MalformedURLException {
		DesiredCapabilities capability = DesiredCapabilities.firefox();
		// DesiredCapabilities capability =
		// DesiredCapabilities.internetExplorer();
		driver = new RemoteWebDriver(new URL(HUB_URL), capability);

		// driver = new FirefoxDriver(); //for local check

		driver.manage().timeouts().implicitlyWait(20, TimeUnit.SECONDS);
		driver.manage().timeouts().pageLoadTimeout(30, TimeUnit.SECONDS);
		driver.manage().window().setSize(new Dimension(1920, 1080));

		driver.get(BASE_URL);

		JavascriptExecutor js = (JavascriptExecutor) driver;

		Object we = js.executeScript("return utag.data;");
		System.out.println("we=" + we);
		we = js.executeScript("return utag_data;");
		System.out.println("we1=" + we);
		driver.findElement(By.xpath("//footer//div[contains(@class, 'row')]//a[text()='Jewelry']")).click();

		we = js.executeScript("return utag_data;");
		System.out.println("we2=" + we);

		driver.get(BASE_URL+"/Jewelry/cat/Women-s-Jewelry_1-512");

		we = js.executeScript("return utag_data;");
		System.out.println("we3=" + we);

		try {
			takeScreenShot(driver, OutputType.FILE);
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		//ul[@id='searchResultBlockGrid']/li[1]/div[@class='product-list-item']/div[@class='product-list-text']/a/div[@class='product-name']
		
		driver.findElement(By.xpath("//ul[@id='searchResultBlockGrid']/li[1]//div[@class='product-name']")).click();
		we = js.executeScript("var utag_data=['Saab', 'Volvo', 'BMW'];return utag_data;");
		System.out.println("we4=" + we);
		
		js.executeScript("jQuery(\'span:contains(\"Add to Cart\")\').click()");
		we = js.executeScript("return JSON.stringify(utag_data);");
		System.out.println("we5=" + we);

//		driver.findElement(By.xpath("//span[text()='Add to Cart']")).click();
//		we = js.executeScript("return utag_data;");
//		System.out.println("we6=" + we);
		
//		driver.close();
//		driver.quit();
	}
	
	public static void takeScreenShot(WebDriver driver,OutputType t) throws IOException{
		WebDriver driver1          = new Augmenter().augment( driver );
		File f=( (TakesScreenshot)driver ).getScreenshotAs(t); 
	       File o = new File("target/screenshot.png");
	       FileUtils.copyFile(f, o);
	}

	public static void main(String[] args) {
		try {
			verifySenario1();
		} catch (MalformedURLException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}

}
