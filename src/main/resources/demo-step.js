txStart(); 

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