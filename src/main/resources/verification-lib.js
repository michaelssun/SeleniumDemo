var validation = 0;
var sample_id = 308;
if (typeof validation === 'undefined') {
    validation = 1;
    var sample_id = 0;
    var whistler = "http://whistler.deploytealium.com";
}

if (!validation) {
    var whistler = "http://whistler-in.deploytealium.com";
}

var driver = test.openBrowser(),
    selenium = driver.getSelenium(),
    netListen = 750,
    timeout = 120000,
    response, testcfg, tx, step, stepName, stepId, utagJs, jQueryElem, c;

function kbo() {
    // test.log("url: http://e/ !="+driver.getCurrentUrl()+" goTo: http://e/ to exit script");
    // throw "Keeping browser open";
    while (driver.getCurrentUrl() != 'http://e/') {
        test.pause(5000);
    }
}

function txStart() {
    selenium.setTimeout(timeout);
    tx = test.beginTransaction();
    c = test.getHttpClient();
    c.configureSSL("TLSv1",false,false);
    driver.manage().window().maximize();
    if (!validation) {
        response = c.get(whistler + "/maximizeBrowser.php").getBody();
    }
    test.waitForNetworkTrafficToStop(netListen, timeout);
    // test.log("{");
    response = c.get("https://www.deploytealium.com/verify/testInfo.php?sample_id=" + sample_id).getBody();
    logTestCfg(response);
    testcfg = eval("(" + response + ")");
    utagJs = "https://www.deploytealium.com/utag/updateUtag.php?account=" + testcfg.account + "&profile=" + testcfg.profile + "&env=" + testcfg.env + "&sample_id=" + sample_id;
    if (typeof utagFolder !== 'undefined') {
        utagJs += "&folder=" + utagFolder;
    }
    if (typeof audience_stream_verify_id === 'string') {
        utagJs += "&verify_id=" + audience_stream_verify_id;
    }
    //Only rewrite the url if we aren't in validation
    if (!validation) {
        c.rewriteUrl(".*utag\.js.*", utagJs);
    }
    //Remove references to Neustar in the User-Agent Header
    c.addRequestInterceptor(function(req) {
        var headerString = "" + req.getFirstHeader("User-Agent");
        //Find and replace the text
        headerString = headerString.replace(/Neustar WPM/, 'Tealium').replace(/WPM HttpClient/, 'Tealium HttpClient');
        req.setHeader("User-Agent", headerString);
    });
    c.blacklistRequest(".*\/\/.*\/verify\/(begin|end)Step.php.*", 200);
}

function txEnd() {
    test.endTransaction();
    // test.log("\"status\":\"passed\"}");
}

function stepStart(label,type) {
    if(typeof label !== 'undefined' && typeof type !== 'undefined'){
        stepName = label+":::"+type;
    }else{
        throw "You must pass step label and type being name of page_type or event_name";
    }
    step = test.beginStep(stepName, timeout);
    stepId = tx.getStepCount() + 1;
    c.get(whistler + "/verify/beginStep.php?step_num=" + stepId + "&step_name=" + stepName);
}

function verifyUtag(obj) {
    Object.keys(obj).forEach(function(key) {
        step.put(key, obj[key]);
    });
}

function stepEnd() {
    test.waitForNetworkTrafficToStop(netListen, timeout);
    jQueryCheck();
    // logHTML();
    logParseUtag_Data();
    logParseUtag();
    logTrackCalls();
    logPostPreloaderUtag();
    logPerformanceData();
    //Only take a screenshot for every step if you are running an audit
    if (!validation) {
        stepCompleteScreenShot();
    }
    c.get(whistler + "/verify/endStep.php?step_num=" + stepId + "&step_name=" + stepName);
    test.endStep();
}

function logTestCfg(str) {
    testcvg = driver.executeScript("return JSON.stringify(" + str + ");").toString();
    // test.log("\"test_cfg\"" + ":" + testcvg + ",");
}

function logHTMLUtag() {
    var name = "utag_data";
    var utag = "";
    try {
        utag = driver.executeScript("return \
            JSON.stringify( \
                eval('('+ \
                    jQuery('script:contains(utag_data)') \
                    .text() \
                    .replace(/(var)?(\s*)?utag_data(\s*)?=(\s*)?/, '') \
                    .trim() \
                    .replace(/(\s*)?\}(\s*)?\;?$/,'}') \
                    .replace(/^var/,'') \
                    .replace(/(\s*)?(.+[^\ ])(\s*)?\:/g, '\$2\:') \
                +')') \
            );").toString();
        if (typeof utag != "undefined" && utag != "") {
            postLog(name, utag);
        } else {
            postLog(name, "");
        }
    } catch (e) {
        test.log("\"" + name + "\":\"utag_data does not exist in the html source :: '" + e + "' \",");
    }
}

function logParseUtag() {
    var name = "utag.data";
    var utag = "";
    try {
        utag = driver.executeScript("return JSON.stringify(window.utag.data);").toString();
        if (typeof utag != "undefined" && utag != "") {
            postLog(name, utag);
        } else {
            postLog(name, "");
        }
    } catch (e) {
        test.log("\"" + name + "\":\"We think utag.js does not exist in the html source because there is no utag.data :: '" + e + "' \",");
    }
}

function logParseUtag_Data() {
    var name = "utag_data";
    var utag = "";
    try {
        utag = driver.executeScript("return JSON.stringify(window.orig_utag_data);").toString();
        if (utag != "" && utag != "undefined") {
            postLog(name, utag);
        } else {
            postLog(name, "");
        }
    } catch (e) {
        test.log("\"" + name + "\":\"does not exist in the html source\"");
    }
}

function logTrackCalls() {
    try {
        postLog("track_calls", driver.executeScript("return JSON.stringify(track_calls);").toString());
    } catch (e) {
        test.log("Couldn't get track_calls data : " + e);
    }
}

function logPostPreloaderUtag() {
    try {
        postLog("post_preloader_utag_data", driver.executeScript("return JSON.stringify(post_preloader_utag_data);").toString());
    } catch (e) {
        test.log("Couldn't get post_preloader_utag_data data : " + e);
    }
}

function logPerformanceData() {
    try {
        postLog("performance", driver.executeScript("return JSON.stringify(performance.timing);").toString());
    } catch (e) {
        test.log("Couldn't get performance timing data : " + e);
    }
}

function postLog(name, value, qp, attempt) {
    if (!validation) {
        if (typeof qp === 'undefined') {
            qp = "";
        }
        if (typeof attempt === 'undefined') {
            attempt = 0;
        }
        var url = "https://www.deploytealium.com/verify/log.php" + qp;
        var postData = {};
        postData.sample_id = testcfg.sample_id;
        postData.step_num = stepId;
        postData.name = name;
        postData.value = value;
        var attempt_count = 0;
        var resp;
        try {
            var req = c.newPost(url);
            req.addRequestHeader("Content-Type", "application/x-www-form-urlencoded");
            addDefaultHeaders(req);
            req = addRequestParameters(req, postData);
            resp = req.execute();
            // test.log("log status code: " + resp.getStatusCode());
            if (resp.getStatusCode() != 200 && attempt < 3) {
                postLog(name, value, qp, attempt + 1);
            }
        } catch (e) {
            test.log("log attempt "+ (attempt + 1) +" failed: " + e);
            if (attempt < 3) {
                postLog(name, value, qp, attempt++);
            }
        }
        // test.log("log response: " + resp.getBody() + "");
    } else {
        test.log(name + ":" + value);
    }
}

function logHTML() {
    var name = "html_source";
    var html = "";
    try {
        html = driver.executeScript("return encodeURI(document.documentElement.outerHTML);").toString();
        if (html != "" && html != "undefined") {
            postLog(name, html);
        } else {
            postLog(name, "");
        }

    } catch (e) {
        test.log("\"" + name + "\":\"html source save error\",");
    }
}

function stepScreenShot(selector, attempt) {
    if (validation) {
        return true;
    }
    if (typeof attempt === 'undefined') {
        attempt = 0;
    }
    var url = "";
    if (typeof selector === 'undefined') {
        url = whistler + "/takeScreenShot.php?step_num=" + stepId + "&sample_id=" + testcfg.sample_id + "&show_target=0&step_state=before&account=" + testcfg.account;
    } else if (selector.match(/^jQuery|\$/)) {
        var elemCoord = eval("(" + driver.executeScript("return JSON.stringify(window.c_elemPosition(" + selector + "));") + ")");
        url = whistler + "/takeScreenShot.php?step_num=" + stepId + "&xCoord=" + elemCoord.center_x + "&yCoord=" + elemCoord.center_y + "&sample_id=" + testcfg.sample_id + "&show_target=1&step_state=before&account=" + testcfg.account;
    } else {
        //Assuming an xpath statement was passed in
        var e = getElement(selector);
        var x = (e.getSize().width / 2) + e.getLocation().getX();
        var y = (e.getSize().height / 2) + e.getLocation().getY();
        url = whistler + "/takeScreenShot.php?step_num=" + stepId + "&xCoord=" + x + "&yCoord=" + y + "&sample_id=" + testcfg.sample_id + "&show_target=1&step_state=before&account=" + testcfg.account;
    }
    // postLog("url", url);
    // response = c.get(url).getBody();
    var resp;
    try {
        resp = c.get(url);
        // test.log("SS status code: " + resp.getStatusCode());
        if (resp.getStatusCode() != 200 && attempt < 3) {
            stepScreenShot(element, attempt + 1);
        } else {
            postLog("screenshot_before", resp.getBody());
        }
    } catch (e) {
        test.log("SS attempt " + (attempt + 1) + " failed: " + e);
        if (attempt < 3) {
            stepScreenShot(element, attempt++);
        }
    }
}

function stepCompleteScreenShot(attempt) {
    if (validation) {
        return true;
    }
    if (typeof attempt === 'undefined') {
        attempt = 0;
    }
    var url = whistler + "/takeScreenShot.php?step_num=" + stepId + "&sample_id=" + testcfg.sample_id + "&show_target=0&step_state=after&account=" + testcfg.account;
    // response = c.get(url).getBody();
    var resp;
    try {
        resp = c.get(url);
        // test.log("SS status code: " + resp.getStatusCode());
        if (resp.getStatusCode() != 200 && attempt < 3) {
            stepCompleteScreenShot(attempt + 1);
        } else {
            postLog("screenshot_after", resp.getBody());
        }
    } catch (e) {
        test.log("SS attempt " + (attempt + 1) + " failed: " + e);
        if (attempt < 3) {
            stepScreenShot(element, attempt++);
        }
    }
}

function logTime(str) {
    test.log("\"time-" + str + ":\"" + driver.executeScript("return new Date();").toString() + "\"");
}

function jQueryCheck() {
    driver.executeScript("if(!window.jQuery){if(typeof $ !== 'undefined'){window.hasDollar = 1;} var jq = document.createElement('script'); jq.type = 'text/javascript'; jq.src = '//ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js'; document.getElementsByTagName('head')[0].appendChild(jq);}");
    test.waitForNetworkTrafficToStop(netListen, timeout);
    driver.executeScript("if(window.hasDollor === 1){$.noConflict();}");
    driver.executeScript("window.c_elemPosition = function(link){ var offset = link.offset(); var pos = {}; try{ pos.top = offset.top; pos.left = offset.left; pos.bottom = pos.top + link.outerHeight(); pos.right = pos.left + link.outerWidth(); pos.center_y = Math.round((pos.top/2)+(pos.bottom/2)); pos.center_x = Math.round((pos.left/2)+(pos.right/2)); return pos || {}} catch(e){return pos || {}}}");
}

function open(url) {
    try {
        driver.get(url);
        test.waitForNetworkTrafficToStop(netListen, timeout);
        jQueryCheck();
    } catch (e) {
        throw "trying to open on " + url + " at step " + tx.getStepCount() + " and got error: " + e
    }
}

function jclick(selector, ss) {
    jQueryElem = "jQuery('" + selector.replace(/'/g,"\\'") + "')";
    try {
        jQueryCheck();
        if (typeof ss !== 'undefined') {
            stepScreenShot(jQueryElem);
        }
        driver.executeScript(jQueryElem + "[0].click();");
        test.waitForNetworkTrafficToStop(netListen, timeout);
        jQueryCheck();
    } catch (e) {
        throw "trying to click on " + jQueryElem + " at step " + tx.getStepCount() + " and got error: " + e
    }
}

function getElement(selector){
    var element;
    try{
        if(selector.match(/^\//)){
            element = driver.findElement(By.xpath(selector));
        }else if(selector.match(/^id=/)){
            element = driver.findElement(By.id(selector.match(/^id=(.*)/)[1]));
        }else if(selector.match(/^name=/)){
            element = driver.findElement(By.name(selector.match(/^name=(.*)/)[1]));
        }else if(selector.match(/^class=/)){
            element = driver.findElement(By.className(selector.match(/^class=(.*)/)[1]));
        }else{
            element = driver.findElement(By.cssSelector(selector));
        }
    }catch(e){
        log(e + " :: Selector = " + selector);
        return false;
    }
    return element;
}

function click(selector, ss) {
    if (typeof ss !== 'undefined') {
        stepScreenShot(selector);
    }
    getElement(selector).click();
}

function type(selector, str) {
    getElement(selector).clear();
    getElement(selector).sendKeys(str);
}

function select(selector, value) {
    var element = new Select(getElement(selector));
    if (typeof value == 'number') {
        element.selectByIndex(value);
        return true;
    }
    if (value.match(/value=/)) {
        element.selectByValue(value.replace(/value=/, ''));
        return true;
    }
    element.selectByVisibleText(value);
}

function waitTraffic(listen, maxtime) {
    if (!listen) {
        listen = netListen;
    }
    if (!maxtime) {
        maxtime = timeout;
    }
    test.waitForNetworkTrafficToStop(listen, maxtime);
}

function switchFrame(frame) {
    if (typeof frame === "undefined") {
        //Switch back to the main window
        driver.switchTo().defaultContent();
    }else if(typeof frame === "string") {
        //User is trying to switch based on a selector
        driver.switchTo().frame(getElement(frame));
    }else{
        //User passed an interger or a web element
        driver.switchTo().frame(frame);
    }
}

function isVisible(xpath) {
    if (selenium.isElementPresent(xpath)) {
        return selenium.isVisible(xpath);
    } else {
        return false;
    }
}

function jQueryAny(str) {
    try {
        jQueryCheck();
        driver.executeScript(str);
        jQueryCheck();
    } catch (e) {
        throw "trying to execute jQuery " + str + " at step " + tx.getStepCount() + " and got error: " + e
    }
}

function $x(str){
    return str;
}

function log(str){
    test.log(str);
}

function pause(ms){
    test.pause(ms);
}

function randomNumberRange(minVal, maxVal) {
    if (!maxVal) {
        maxVal = minVal
    };
    var randVal = minVal + (Math.random() * (1 + maxVal - minVal));
    return Math.floor(randVal);
}

function makeSleepFunction(min, max) {
    if (!validation) {
        test.pause(randomNumberRange(min, max) * 1000);
    } else {
        test.pause(250);
    }
}

function randomString(string_length) {
    var chars = "ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
    var randomstring = '';
    for (var i = 0; i < string_length; i++) {
        var rnum = Math.floor(Math.random() * chars.length);
        randomstring += chars.substring(rnum, rnum + 1);
    }
    return randomstring;
}

function randomNum(string_length) {
    var ints = "1234567890";
    var randomstring = '';
    for (var i = 0; i < string_length; i++) {
        var rnum = Math.floor(Math.random() * ints.length);
        randomstring += ints.substring(rnum, rnum + 1);
    }
    return randomstring;
}

function randomValue(string_length) {
    var values = "ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz0123456789";
    var randomstring = '';
    for (var i = 0; i < string_length; i++) {
        var rnum = Math.floor(Math.random() * values.length);
        randomstring += values.substring(rnum, rnum + 1);
    }
    return randomstring;
}

function arrayShuffle(theArray) {
    var len = theArray.length;
    var i = len;
    while (i--) {
        var p = parseInt(Math.random() * len);
        var t = theArray[i];
        theArray[i] = theArray[p];
        theArray[p] = t;
    }
};

function randomElement(xpath) {
    var count = selenium.getXpathCount(xpath) * 1;
    var pick = randomNumberRange(1, count);
    test.log("Pick:" + pick + ";Count:" + count);
    return "xpath=(" + xpath + ")[" + pick + "]";
}

function updateUserAgent(string) {
    c.addRequestInterceptor(function(req) {
        req.setHeader("User-Agent", string);
    });
}

function fixedWidth(number, lengthDesired) {
    var asStr = '' + number;
    while (asStr.length < lengthDesired) {
        asStr = '0' + asStr;
    }
    return asStr;
}

function formatString(str) {
    var args = arguments;
    return str.replace(/{(\d+)}/g, function(match, number) {
        number = parseInt(number);
        return typeof args[number + 1] != 'undefined' ? args[number + 1] : match;
    });
}

function pickRandomObject(selectFrom, distribution) {
    if (!distribution) {
        var index = Math.floor(Math.random() * selectFrom.length);
        return selectFrom[index];
    }
    var total = 0;
    for (var i = 0; i < distribution.length; i++) {
        total += distribution[i];
    }
    var sample = Math.floor(Math.random() * total);
    for (var i = 0; i < distribution.length; i++) {
        if (sample < distribution[i]) {
            return selectFrom[i];
        }
        sample -= distribution[i];
    }
    throw "Invalid Distribution";
}

function verifyContentRegex(resp, regexSuccess, regexError, str) {
    var respInfo = resp.getInfo();
    var throwStr = str ? str : (respInfo.getUrl() + '').replace(/\?.*/, '?...');
    if (!resp.getBody()) {
        throw formatString("Java Error: '{0}' at '{1}'", resp.getErrorMessage(), throwStr);
    }
    if (regexError) {
        var splitRegexErrors = regexError.split("|");
        for (var i = 0; i < splitRegexErrors.length; i++) {
            var contentMatchErrorRegex = test.findRegexMatches(resp.getBody(), '(' + splitRegexErrors[i] + ')');
            if (contentMatchErrorRegex.length > 0) {
                throw formatString("Content Error: '{0}' found,HTTP '{1}{2}' at{3}", splitRegexErrors[i], respInfo.getStatusCode(), respInfo.getReasonPhrase(), throwStr);
            }
        }
    }
    if (typeof regexSuccess == "number") {
        if (respInfo.getStatusCode() != regexSuccess) {
            throw formatString("Status Error: '{0}' not found,HTTP '{1}{2}' at{3}", regexSuccess, respInfo.getStatusCode(), respInfo.getReasonPhrase(), throwStr);
        }
    } else {
        var contentMatchSuccessRegex = test.findRegexMatches(resp.getBody(), formatString("({0})", regexSuccess));
        if (contentMatchSuccessRegex.length == 0) {
            if (test.isValidation()) {
                test.log(resp.getBody());
            } else {
                tx.put("ErrorBody", resp.getBody());
            }
            throw formatString("Content Error: '{0}' not found,HTTP '{1}{2}' at{3}", regexSuccess, respInfo.getStatusCode(), respInfo.getReasonPhrase(), throwStr);
        }
        return contentMatchSuccessRegex;
    }
}

function concurrentDownload(httpClient, executor, url) {
    if (url.match(/\.js\??/i)) {
        var fullPageItemsResponse = executor.execute();
        for (var r = 0; r < fullPageItemsResponse.length; r++) {
            if (fullPageItemsResponse[r].getInfo().getUrl().match(/\.css\??/)) {
                getFullPageItems(httpClient, fullPageItemsResponse[r]);
            }
        }
        var req = httpClient.newGet(url);
        addDefaultHeaders(req);
        req.execute();
    } else {
        var req = httpClient.newGet(url);
        addDefaultHeaders(req);
        executor.addHttpRequest(req);
    }
}
var cachedItems = {};

function getFullPageItems(httpClient, resp) {
    var concurrentHttpExecutor = test.createConcurrentHttpExecutor();
    var responseBody = resp.getBody() + "";
    var parsedPaged = responseBody.replace(/\/\*[\s\S]*?\*\//gm, "").replace(/(^|\s)\/\/.*?$/gm, "").replace(/<!--[\s\S]*?-->/gm, "");
    var fullPageItems = parsedPaged.match(/<img[^<>]*src=['"]([^"'<>]*)|<link[^<>]*href=['"]([^'"<>]*)|<script[^<>]*src=['"]([^'"<>]*)|background-image:\s?url\((.*?)\)/gim);
    if (fullPageItems) {
        for (var i = 0; i < fullPageItems.length; i++) {
            if (fullPageItems[i].match(/rel=['"]canonical['"]|\+|\/\/localhost|\/\/127\.0\.0/)) {
                continue;
            }
            var itemUrl = fullPageItems[i].replace(/<img[^<>]*src=['"]([^'"<>]*)|<link[^<>]*href=['"]([^'"<>]*)|<script[^<>]*src=['"]([^'"<>]*)|background-image:\s?url\((.*?)\)/gim, '$1$2$3$4').replace(/['"]/g, '');
            if (itemUrl == "" || itemUrl.match(/^https?:\s/) || itemUrl.match(/[{}\[\]]/) || itemUrl.match(/\s/)) {
                continue;
            }
            itemUrl = ensureAbsolutePath(resp, itemUrl);
            if (!cachedItems[itemUrl] && isAllowedToDownload(itemUrl)) {
                concurrentDownload(httpClient, concurrentHttpExecutor, itemUrl);
                cachedItems[itemUrl] = 1;
            }
        }
        var fullPageItemsResponse = concurrentHttpExecutor.execute();
        for (var r = 0; r < fullPageItemsResponse.length; r++) {
            if (fullPageItemsResponse[r].getInfo().getUrl().match(/\.css\??/)) {
                getFullPageItems(httpClient, fullPageItemsResponse[r]);
            }
        }
    }
}

function isAllowedToDownload(url) {
    if (typeof fullPageWhitelist != "undefined") {
        for (var i = 0; i < fullPageWhitelist.length; i++) {
            if (url.match(fullPageWhitelist[i])) {
                return 1;
            }
        }
        return 0;
    }
    if (typeof fullPageBlacklist != "undefined") {
        for (var i = 0; i < fullPageBlacklist.length; i++) {
            if (url.match(fullPageBlacklist[i])) {
                return 0;
            }
        }
        return 1;
    }
    return 1;
}

function addDefaultHeaders(req) {
    req.addRequestHeaders({
        'Connection': 'keep-alive',
        'Accept': 'text/html,application/xhtml+xml,application/xml,application/json;q=0.9,\*/\*;q=0.8',
        'Accept-Encoding': 'gzip',
        'Accept-Charset': 'ISO-8859-1,utf-8;q=0.7,*;q=0.3'
    });
}

function setupHttpClient() {
    c.setFollowRedirects(false);
    var timeout = 120000;
    c.setSocketOperationTimeout(timeout);
    c.setConnectionTimeout(timeout);
}

function ensureAbsolutePath(resp, url) {
    if (url.indexOf("\/\/") === 0) {
        url = resp.getInfo().getProtocol() + ":" + url;
    }
    if (url.indexOf(' ') === 0) {
        url = url.replace(/^ /, '');
    }
    if (url.match(/^\.\/\.\./)) {
        url = url.replace(/^\.\//, '');
    }
    if (url.match(/^\.\./)) {
        url = resp.getInfo().getUrl().match("(https?:\/\/[^?]*)\/")[1].match("(https?:\/\/[^?]*)\/")[1] + url.match("(\/.*)$")[1];
    }
    if (url.indexOf('/') === 0) {
        url = resp.getInfo().getUrl().match("(https?:\/\/[^/]*)")[1] + url;
    }
    if (!url.match(/^h/i)) {
        url = resp.getInfo().getUrl().match("(https?:\/\/[^?]*\/)")[1] + url;
    }
    if (url.match(/([^:]\/\/)/i)) {
        url = url.replace(/([^:])(\/\/)/g, '$1/');
    }
    return url;
}

function followRedirect(resp) {
    var redirectLoop = 0;
    while (!resp.getErrorMessage() && resp.getHeader("Location")) {
        if (redirectLoop >= 10) {
            throw "Redirect Loop detected: Exceeded 10 Loops";
        }
        var url = decodeURIComponent(resp.getHeader("Location"));
        if (url.indexOf('/') === 0) {
            url = resp.getInfo().getUrl().match("(https?://[^/]*)")[0] + url;
        }
        var req = c.newGet(url);
        addDefaultHeaders(req);
        resp = req.execute();
        redirectLoop++;
    }
    return resp;
}

function addRequestParameters(req, body) {
    Object.keys(body).forEach(function(key) {
        if (Array.isArray(body[key])) {
            for (var i = 0; i < body[key].length; i++) {
                req.addRequestParameter(decodeURIComponent(key), decodeURIComponent(body[key][i]).replace(/\+/g, " "));
            }
        } else {
            if (key === '__VIEWSTATE' || key === '__EVENTVALIDATION') {
                req.addRequestParameter(decodeURIComponent(key), decodeURIComponent(body[key]));
            } else {
                if (key === 'wpmAddFileUpload') {
                    if (body[key]['Content-Type']) {
                        req.addFileUpload(body[key].name, body[key].file, body[key]['Content-Type']);
                    } else {
                        req.addFileUpload(body[key].name, body[key].file);
                    }
                } else if (key === 'rawRequest') {
                    req.setRequestBody(body[key]);
                } else {
                    req.addRequestParameter(decodeURIComponent(key), decodeURIComponent(body[key]).replace(/\+/g, " "));
                }
            }
        }
    });
    return req;
}

function requestor(url, method, searchstring, errorstring, body, headers, str) {
    var req;
    method = method.toLowerCase();
    if (method.match('get')) {
        req = c.newGet(url);
    } else if (method.match('post')) {
        req = c.newPost(url);
        if (method.match('multipart')) {
            req.makeMultiPart();
        } else {
            req.addRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        }
    } else if (method.match('delete')) {
        req = c.newDelete(url);
    } else if (method.match('put')) {
        req = c.newPut(url);
    } else if (method.match('head')) {
        req = c.newHead(url);
    } else if (method.match('options')) {
        req = c.newOptions(url);
    }
    if (!headers) {
        addDefaultHeaders(req);
    } else {
        req.addRequestHeaders(headers);
    }
    if (body) {
        req = addRequestParameters(req, body);
    }
    var resp = req.execute();
    resp = followRedirect(resp);
    verifyContentRegex(resp, searchstring, errorstring, str);
    getFullPageItems(c, resp);
    return resp;
}
var methodGet = function(url, searchstring, errorstring, headers, str) {
    return requestor(url, 'get', searchstring, errorstring, '', headers, str);
};
var methodPost = function(url, body, searchstring, errorstring, headers, str) {
    return requestor(url, 'post', searchstring, errorstring, body, headers, str);
};
var methodPostMultiPart = function(url, body, searchstring, errorstring, headers, str) {
    return requestor(url, 'postmultipart', searchstring, errorstring, body, headers, str);
};
var soapRequest = function(url, body, headers) {
    if (!headers['Content-Type']) {
        headers['Content-Type'] = 'text/xml;charset=utf-8';
    }
    body = {
        'rawRequest': body
    };
    return requestor(url, 'post', 200, '', body, headers);
};

function randomDriverElement(xpath, element, visible) {
    if (typeof visible == "undefined") {
        visible = 1;
    }
    var elementsArray;
    if (element) {
        elementsArray = element.findElements(By.xpath(xpath)).toArray();
    } else {
        elementsArray = driver.findElements(By.xpath(xpath)).toArray();
    }
    arrayShuffle(elementsArray);
    test.log("Available links: " + elementsArray.length);
    for (var i = 0; i < elementsArray.length; i++) {
        if (visible) {
            if (elementsArray[i].isDisplayed()) {
                test.log("Random href: " + elementsArray[i].getAttribute("href"));
                return elementsArray[i];
            }
        } else {
            return elementsArray[i];
        }
    }
    throw "No links are displayed to click on";
}

function dateTimeFormat(format, secondsInput) {
    if (!format) {
        return "No Format Specified";
    }
    var months = "January_February_March_April_May_June_July_August_September_October_November_December".split("_");
    var monthsAbbr = "Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec".split("_");
    var days = "Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday".split("_");
    var daysAbbr = "Sun_Mon_Tue_Wed_Thu_Fri_Sat".split("_");
    var d;
    if (secondsInput) {
        d = new Date(secondsInput);
    } else {
        d = new Date();
    }
    format = format.replace('%MMMM', months[d.getMonth()])
                .replace('%MMM', monthsAbbr[d.getMonth()])
                .replace('%MM', fixedWidth(d.getMonth() + 1, 2))
                .replace('%M', d.getMonth() + 1)
                .replace('%DDDD', days[d.getDay()])
                .replace('%DDD', daysAbbr[d.getDay()])
                .replace('%DD', fixedWidth(d.getDate(), 2))
                .replace('%D', d.getDate())
                .replace('%YYYY', d.getFullYear())
                .replace('%YY', d.getFullYear().toString().substring(2))
                .replace('%hh', fixedWidth(d.getHours(), 2))
                .replace('%h', d.getHours())
                .replace('%mm', fixedWidth(d.getMinutes(), 2))
                .replace('%m', d.getMinutes())
                .replace('%ss', fixedWidth(d.getSeconds(), 2))
                .replace('%s', d.getSeconds())
                .replace('%ms', d.getMilliseconds())
                .replace('%S', d.getTime());
    return format;
}

function formatMS(time) {
    var m = Math.floor(time / 60000);
    var s = (time %= 60000) / 1000;
    var str = "";
    if (m) {
        str += m + " minute(s)and ";
    }
    str += s + " seconds";
    return str;
}

function getMethods(obj) {
    var result = [];
    for (var id in obj) {
        try {
            if (typeof(obj[id]) == "function") {
                result.push(id + ": " + obj[id].toString());
            }
        } catch (err) {
            result.push(id + ": inaccessible");
        }
    }
    return result;
}

/*JSON Stringify Function*/
JSON.stringify = JSON.stringify || function(obj) {
    var t = typeof(obj);
    if (t != "object" || obj === null) {
        return String(obj);
    } else {
        var n, v, json = [],
            arr = (obj && obj.constructor == Array);
        for (n in obj) {
            v = obj[n];
            t = typeof(v);
            if (t == "string") v = '"' + v + '"';
            else if (t == "object" && v !== null) v = JSON.stringify(v);
            json.push((arr ? "" : '"' + n + '":') + String(v));
        }
        return (arr ? "[" : "{") + String(json) + (arr ? "]" : "}");
    }
};txStart();

updateUserAgent("sosta/5.0");

stepStart('Go To Homepage', 'home');
	open('http://ipv.neimanmarcus.com/category/poc/tms/tealiumIndex.html');
stepEnd();

stepStart('Go To Category Page', 'category');
	open('http://ipv.neimanmarcus.com/category/poc/tms/tealiumCategory.html');
stepEnd();

stepStart('Go To Suite Page', 'suite');
	open('http://ipv.neimanmarcus.com/category/poc/tms/tealiumSuite.html');
stepEnd();

stepStart('Go To Product Page', 'product');
	open('http://ipv.neimanmarcus.com/category/poc/tms/tealiumProduct.html');
stepEnd();

txEnd();