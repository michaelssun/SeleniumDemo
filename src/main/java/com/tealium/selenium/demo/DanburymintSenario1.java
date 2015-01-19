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
import org.openqa.selenium.WebElement;
import org.openqa.selenium.remote.Augmenter;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.remote.RemoteWebDriver;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import biz.neustar.wpm.api.WebSocketMessage.Type;

public class DanburymintSenario1 {
	public static final String HUB_URL = "http://localhost:4444/wd/hub";
	public static final String BASE_URL = "http://mbiweb:d3vmb!$201405@resp.danburymint-test.com";
	public static final String XPATH_ELEMENT = "var button=document.evaluate( '__', document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null )";

	static WebDriver driver;

	/*
	 * step1 document.getElementById('blueBoxCode').value='clock'; var
	 * button=document.evaluate('//div[@id=\'blueBoxAjax\']/a[@class=\'button
	 * postfix reversed blue-box-search\']', document, null,
	 * XPathResult.FIRST_ORDERED_NODE_TYPE, null ); button.click();
	 * 
	 * step2 var button=document.evaluate(
	 * '//ul[@id=\'searchResultBlockGrid\']/li[2]//div[@class=\'product-name\']',
	 * document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null );
	 * button.click();
	 * 
	 * step3 var
	 * button=document.evaluate('//div[@id=\'productDetail\']//a[@class=\'large
	 * button icon add-to-cart\']', document, null,
	 * XPathResult.FIRST_ORDERED_NODE_TYPE, null ); button.click();
	 */

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
		
		// wait 10s for the element available in page		
		WebElement element = (new WebDriverWait(driver, 10)).until(ExpectedConditions.visibilityOfElementLocated(By.cssSelector("input#houseName")));
		 
//		js.executeScript("document.getElementById('blueBoxCode').value='clock';");
//		WebElement element = driver.findElement(By.xpath("//div[@id=\'blueBoxAjax\']/a[@class=\'button postfix reversed blue-box-search\']"));
//		element.click();;
		js.executeScript(" document.getElementById('blueBoxCode').value='clock';");
				 
		//js.executeScript("document.evaluate('//div[@id=\'blueBoxAjax\']', document, null, XPathResult.ANY_UNORDERED_NODE_TYPE, null ).singleNodeValue.click();" );
		js.executeScript("document.getElementsByClassName('button postfix reversed blue-box-search')[0].click();" );
		

		we = js.executeScript( "return utag_data;");
		System.out.println("we2=" + we);
		try {
			Thread.sleep(10000);
		} catch (InterruptedException e1) {
			// TODO Auto-generated catch block
			e1.printStackTrace();
		}
//		String step3=XPATH_ELEMENT
//				.replace(
//						"__",
//						"//ul[@id=\'searchResultBlockGrid\']/li[2]//div[@class=\'product-name\']")
//		+ "	button.click();";

		driver.manage().timeouts().implicitlyWait(60, TimeUnit.SECONDS);
		js.executeScript("document.getElementsByClassName('product-name')[1].click();" );
		we = js.executeScript("return utag_data;");
		System.out.println("we3=" + we);


		// ul[@id='searchResultBlockGrid']/li[1]/div[@class='product-list-item']/div[@class='product-list-text']/a/div[@class='product-name']

//		String step4=XPATH_ELEMENT
//				.replace(
//						"__",
//						"//div[@id=\'productDetail\']//a[@class=\'large button icon add-to-cart\']")
//		+ "	button.click();";
//		try {
//			Thread.sleep(10000);
//		} catch (InterruptedException e1) {
//			// TODO Auto-generated catch block
//			e1.printStackTrace();
//		}
		js.executeScript("document.getElementById('quantity').value='3';document.getElementsByClassName('large button icon add-to-cart')[0].click();" );
		we = js.executeScript("return utag_data;");
		System.out.println("we4=" + we);

		
		// driver.findElement(By.xpath("//span[text()='Add to Cart']")).click();
		// we = js.executeScript("return utag_data;");
		// System.out.println("we6=" + we);

		// driver.close();
		// driver.quit();
	}

	public static void takeScreenShot(WebDriver driver, OutputType t)
			throws IOException {
		WebDriver driver1 = new Augmenter().augment(driver);
		File f = ((TakesScreenshot) driver).getScreenshotAs(t);
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
