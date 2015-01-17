package com.tealium.selenium.demo;

import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Map;

import javax.script.Bindings;
import javax.script.ScriptContext;
import javax.script.ScriptEngine;
import javax.script.ScriptEngineManager;
import javax.script.ScriptException;

public class NashornDemo {
	private static final String JAVA_SCRIPT = "JavaScript";
	private static final String MOZILLA_RHINO = "Mozilla Rhino";
	private static final String APPLE_SCRIPT_ENGINE = "AppleScriptEngine";
	private static final String ZXCVBN_PATH = "/META-INF/resources/webjars/zxcvbn/1.0/zxcvbn.js";
	private static final String JS_LIB = "verification-lib.js";
	private static final String JS_STEPS = "demo-steps.js";

	private final ScriptEngine engine;

	public NashornDemo() {
		// 1.
		ScriptEngineManager manager = new ScriptEngineManager();
		engine = manager.getEngineByName(JAVA_SCRIPT);

		// 2.
		Bindings engineScope = engine.getBindings(ScriptContext.ENGINE_SCOPE);
		engineScope.put("window", engineScope);

		// 3.
		try {
			engine.eval(new InputStreamReader(NashornDemo.class.getClassLoader().getResourceAsStream(JS_LIB)));
		} catch (ScriptException e) {
			throw new RuntimeException(e);
		}
	}

	public Object eval(String command) {
		try {
			// 4.

			Object obj = engine.eval(command);

			// 5.
			return obj;
		} catch (ScriptException e) {
			throw new RuntimeException(e);
		}
	}

	public static List<String> readContent(String templatePath)
			throws IOException {
		Path path = Paths.get(templatePath);
		return Files.readAllLines(path, StandardCharsets.UTF_8);
	}
	
	private static void demo() throws IOException{
		NashornDemo nashornDemo=new NashornDemo();
		List<String> commands=readContent(JS_STEPS);
		int count=1;
		for (String string : commands) {
			System.out.println("step"+count+++" ="+nashornDemo.eval(string));
		}
	}
	
	public static void test() throws ScriptException{
		 // create a script engine manager
        ScriptEngineManager factory = new ScriptEngineManager();
        // create a JavaScript engine
        ScriptEngine engine = factory.getEngineByName(JAVA_SCRIPT);
        // evaluate JavaScript code from String
        engine.eval("print('Hello, World')");
	}
	
	public static void main(String[] args) throws IOException, ScriptException {
		//test();
		demo();
	}

}
