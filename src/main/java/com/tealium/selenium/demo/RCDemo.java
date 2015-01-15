package com.tealium.selenium.demo;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.firefox.FirefoxDriver;

import com.thoughtworks.selenium.DefaultSelenium;
import com.thoughtworks.selenium.Selenium;

public class RCDemo {
	static void test1() throws InterruptedException {
		String cmd = "/usr/bin/chrome --args --disable-web-security";

		// Instatiate the RC Server
		Selenium selenium = new DefaultSelenium("localhost", 4444, "*firefox",
				"http://www.calculator.net");

		selenium.start(); // Start
		selenium.open("/"); // Open the URL
		selenium.windowMaximize();

		// Click on Link Math Calculator
		selenium.click("xpath=.//*[@id='menu']/div[3]/a");
		Thread.sleep(2500); // Wait for page load

		// Click on Link Percent Calculator
		selenium.click("xpath=.//*[@id='menu']/div[4]/div[3]/a");
		Thread.sleep(4000); // Wait for page load

		// Focus on text Box
		selenium.focus("name=cpar1");
		// enter a value in Text box 1
		selenium.type("css=input[name=\"cpar1\"]", "10");

		// enter a value in Text box 2
		selenium.focus("name=cpar2");
		selenium.type("css=input[name=\"cpar2\"]", "50");

		// Click Calculate button
		selenium.click("xpath=.//*[@id='content']/table/tbody/tr/td[2]/input");

		// verify if the result is 5
		String result = selenium.getText(".//*[@id='content']/p[2]");

		if (result == "5") {
			System.out.println("Pass");
		} else {
			System.out.println("Fail");
		}
	}

	static void test2() throws InterruptedException {
		String expected = "G.Elangovan";

		Selenium selenium = new DefaultSelenium("localhost", 4444, "*firefox",
				"http://www.naukri.com");
		selenium.start();
		selenium.open("/");
		selenium.windowMaximize();
		Thread.sleep(5000);

		selenium.type("id=username", "tester@gmail.com");
		selenium.type("id=password", "password");
		selenium.click("name=Login");

		Thread.sleep(5000);
		String actual = selenium.getText("id=nameDisplaySpan");

		System.out.println("usernmae is: " + actual);

		boolean condition = expected.equals(actual);
		System.out.println(condition);

		selenium.close();
		selenium.stop();
	}

	static void test3() throws InterruptedException {
		Selenium selenium = new DefaultSelenium("localhost", 4444, "*firefox",
				"http://www.eviltester.com");
		selenium.start();
		selenium.open("/selenium/basic_ajax.html");

		// check existing function
		selenium.type("lteq30", "400");
		selenium.fireEvent("lteq30", "blur");
		if ("Enter a value less than 30".equals(selenium.getAlert())) {
			System.out.println("Enter a value less than 30="
					+ (selenium.getAlert()));
		}

		// change the function by running a script to amend the existing
		// reference in the dom to a new anonymous function

		String value = "changed function";
		selenium.runScript("window.checkGT30 = function(value){alert(\""
				+ value + "\");};");
		selenium.type("lteq30", "500");
		selenium.fireEvent("lteq30", "blur");
		if (value.equals(selenium.getAlert())) {
			System.out.println(value + "=" + (selenium.getAlert()));
		}

		selenium.close();
		selenium.stop();
	}

	static void test4() throws InterruptedException {
		Selenium selenium = new DefaultSelenium("localhost", 4444, "*firefox",
				"http://www.eviltester.com");
		try {
			selenium.start();
			selenium.open("/selenium/basic_ajax.html");
			// check existing function
			selenium.type("lteq30", "400");
			String val=selenium.getEval("var v=window.document.getElementById(\"lteq30\");v.value='500'");
			if (val.equals("400")) {
				System.out.println("val="+val);
			}else{
				System.out.println("val1="+val);
			}
			selenium.fireEvent("lteq30", "blur");
			if ("Enter a value less than 30".equals(selenium.getAlert())) {
				System.out.println("Enter a value less than 30="
						+ (selenium.getAlert()));
			}

			// change the function by running a script to amend the existing
			// reference in the dom to a new anonymous function

			String value = "changed function";
			selenium.runScript("window.checkGT30 = function(value){alert(\""
					+ value + "\");};");
			selenium.type("lteq30", "500");
			selenium.fireEvent("lteq30", "blur");
			if (value.equals(selenium.getAlert())) {
				System.out.println(value + "=" + (selenium.getAlert()));
			}

			selenium.close();
			selenium.stop();
		} finally   {
			 if (selenium!=null) {
				selenium.close();
				selenium.stop();
			}
		}
	}
	static void test5() throws InterruptedException {
		Selenium selenium = new DefaultSelenium("localhost", 4444, "*firefox",
				"http://only-testing-blog.blogspot.in");
		selenium.start();
		selenium.open("/2013/11/new-test.html");
		// check existing function
		selenium.runScript("document.getElementsByName('fname')[0].setAttribute('disabled', '');var v=document.getElementsByName('lname')[0]; v.removeAttribute('disabled');v.value='sun';");
		String val=selenium.getEval("var v=document.getElementsByName('lname')[0].value");
		if (val.equals("sun")) {
			System.out.println("val="+val);
		}else{
			System.out.println("val1="+val);
		} 

		selenium.close();
		selenium.stop();
	}
	
	static void test6() throws InterruptedException {
		Selenium selenium = new DefaultSelenium("localhost", 4444, "*firefox",
				"http://www.eviltester.com");
		selenium.start();
		selenium.open("/selenium/basic_ajax.html");
		// check existing function
		selenium.type("lteq30", "400");
		selenium.runScript("var v=window.document.getElementById(\"lteq30\"); if(v.value=='500'){v.value='new value';}else{v.value='old value'}");
		String val=selenium.getEval("var v=window.document.getElementById(\"lteq30\");if(v.value=='300'){v.value='new value';}");
		if (val.equals("400")) {
			System.out.println("val="+val);
		}else{
			System.out.println("val1="+val);
		}

		selenium.close();
		selenium.stop();
	}

	/**
	 * @param args
	 * @throws InterruptedException
	 */
	public static void main(String[] args) throws InterruptedException {
		//test4(); // enforce close browser
		test6();
	}
}