package com.tealium.selenium.demo;

import javax.script.Bindings;
import javax.script.ScriptContext;
import javax.script.ScriptEngine;
import javax.script.ScriptEngineManager;

public class NashornDemo {
	private static final String ZXCVBN_PATH = "/META-INF/resources/webjars/zxcvbn/1.0/zxcvbn.js";
	 
	  private final ScriptEngine engine;
	 
	  public NashornDemo() {
	    // 1.
	    ScriptEngineManager manager = new ScriptEngineManager();
	    engine = manager.getEngineByName("nashorn");
	 
	    // 2.
	    Bindings engineScope = engine.getBindings(ScriptContext.ENGINE_SCOPE);
	    engineScope.put("window", engineScope);
	 
	    // 3.
	    try {
	      engine.eval(getResourceContents(ZXCVBN_PATH));
	    } catch (ScriptException e) {
	      throw new RuntimeException(e);
	    }
	  }
	 
	  public Strength check(String pw) {
	    try {
	      // 4.
	      Map<String, Object> result;
	      result = (Map<String, Object>) engine.eval("zxcvbn('" + pw + "');");
	 
	      // 5.
	      return new Strength(
	        ((Double) result.get("entropy")).intValue(),
	        (int) result.get("score"),
	        ((Double) result.get("crack_time")).intValue()
	      );
	    } catch (ScriptException e) {
	      throw new RuntimeException(e);
	    }
	  }
	 
}
