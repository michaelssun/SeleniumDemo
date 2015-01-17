package com.tealium.selenium.demo;

import java.io.*;
import java.net.URL;

import org.apache.commons.io.FileUtils;
import org.openqa.selenium.*;
import org.openqa.selenium.remote.*;

public class ScreenShotRemoteWebDriver extends RemoteWebDriver implements
		TakesScreenshot {
	
	public ScreenShotRemoteWebDriver(URL url, DesiredCapabilities dc) {
		super(url, dc);
	}

	@Override
	public <X> X getScreenshotAs(OutputType<X> target)
			throws WebDriverException {
		if ((Boolean) getCapabilities().getCapability(
				CapabilityType.TAKES_SCREENSHOT)) {
			return target
					.convertFromBase64Png(execute(DriverCommand.SCREENSHOT)
							.getValue().toString());
		}
		return null;
	}
	
	public static void main(String[] args) throws IOException {
		DesiredCapabilities dc = new DesiredCapabilities();
	       dc.setBrowserName("firefox");
	       dc.setCapability(CapabilityType.TAKES_SCREENSHOT, true);
	       ScreenShotRemoteWebDriver rwd = new ScreenShotRemoteWebDriver(new URL(DanburymintSenario1.HUB_URL), dc);
	       
	       rwd.get("http://www.tealium.com");
	       
	       File f = rwd.getScreenshotAs(OutputType.FILE);
	       File o = new File("target/screenshot.png");
	       FileUtils.copyFile(f, o);
	       
	       rwd.quit();
	} 
}
