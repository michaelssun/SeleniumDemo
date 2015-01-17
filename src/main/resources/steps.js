username="mbiweb"
password="d3vmb!$201405"
url: http://resp.danburymint-test.com
// start the homepage
	
//step1 - search clocks
document.getElementById('blueBoxCode').value='clock';
document.getElementsByClassName('button postfix reversed blue-box-search')[0].click();

//step2 - click a clock product
document.getElementsByClassName('product-name')[1].click();
//step3 - add 3 clocks to cart
document.getElementById('quantity').value='3';
document.getElementsByClassName('large button icon add-to-cart')[0].click();


