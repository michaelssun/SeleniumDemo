package com.tealium.selenium.demo;

import java.io.File;
import java.io.IOException;

import biz.neustar.webmetrics.agent.api.WebmetricsControl;
import biz.neustar.webmetrics.agent.api.WebmetricsWebDriver;
import biz.neustar.webmetrics.validator.Main;

public class NeustarTest {
	WebmetricsWebDriver webmetricsWebDriver;
	WebmetricsControl webmetricsControl;

	public NeustarTest() {
		// WebmetricsWebDriver(RemoteWebDriver driver, InterruptibleHttpClient
		// httpClient)
		// webmetricsControl=new WebmetricsControl(globalTestContext,
		// testContext, script, javaScriptExecutor, bundle, userState,
		// downloader, headerWriter)

	}

	static String jspath = "/Users/michaelsun/Documents/dev/workspace_demo/SeleniumDemo/src/main/resources/verification-lib.js";
	// static String jarpath =
	// "/Users/michaelsun/Documents/dev/design/verifier/neustar-local_validator/repo/local-validator-4.18.8.jar";
	static String jarpath = "/Users/michaelsun/Documents/dev/design/verifier/neustar-local_validator/repo";

	public static void main(String[] args) {

		File file = new File(jarpath);

		File[] jars = file.listFiles();
		StringBuilder allJars = new StringBuilder();

		for (File file2 : jars) {
			allJars.append(file2.getAbsolutePath()).append(";");
		}
		try {
			String command = "java -cp " + jarpath + "/*.jar"
					+ " biz.neustar.webmetrics.validator.Main " + jspath;
			String command1 = jarpath + "/../bin/validator " + jspath;
			Process p = Runtime.getRuntime().exec(command1);
			System.out.println("end:: " + command);
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}

}
