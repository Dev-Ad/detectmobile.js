/**
 * @class detectmobile
 * @singleton
 * 
 * detectmobile.js - simple mobile redirects with Javascript.
 * 
 * This **detectmobile** object contains all configuration variables and methods for 
 * this micro-framework.
 * 
 * {@link detectmobile#process} is the entry point for the processing.
 * 
 * Feel free to monkey-patch any functions to make this object suitable for your needs.
 * 
 * For more information [visit Github project page](https://github.com/miohtama/detectmobile.js)
 * 
 * 
 * @author Mikko Ohtamaa, Jussi Toivola
 *
 */
var detectmobile = {
	
	/**
	 * @type Fuction
	 * 
	 * Function callback(mode, url) which is called when the mobile browser arrives
	 * to the website and must be redirected.
	 * 
	 * This function must return a new URL where {@link detectmobile#performRedirect} will send this browser. 
	 * 
	 */
	redirectCallback : null,

	/**
	 * @type String
	 * 
	 * Redirect target where mobile browsers coming to the website land.
	 * 
	 * Example:
	 * 
	 *       detectmobile.defaultMobileURL = "http://m.site.somewhere.else";
	 * 
	 * Usually the website homepage. For dynamic URL mappings
	 * define {@link detectmobile#redirectCallback} function.
	 */
	
	defaultMobileURL : null,
	
	/**
	 * @type Array
	 * 
	 * If any of hostname domain parts matches this list assume we are on a mobile site. 
	 * 
	 * By default detect **m.site.com** and **site.mobi**.
	 * 
	 *
	 */
	mobileSiteDomainIdentifiers : ["m", "mobi"],
		   
	/**
	 * @type Number
	 * 
	 * How wide the screen must be in the pixels for the browser
	 * to be considered be a mobile browser. 
	 * 
	 * The default behavior is to put screens < 960 to the mobile site.
	 * 
	 */
	thresholdWidthInPixels : 970, // iPhone 4 is 960
	
	/**
	 * @type String
	 * 
	 * The cookie name set when we force the mobile browser to stick on the website.
	 */
	cookieName : "detectmobilesticky",
	
	/**
	 * @type String
	 * 
	 * HTTP GET query parameter name used to detect forcing the web mode.
	 */
	forceWebParameter : "force-web",

	/**
	 * @type String
	 * 
	 * Use this HTTP GET query parameter name to make browsers come back from the forced web site to the mobile site.
	 */
	forceMobileParameter : "force-mobile",
	
	
	/**
	 * @type Array
	 * 
	 * Domain names which are stripped from the beginning of the host name when mobile redirect is done.
	 * 
	 * E.g. to prevent giving a name "m.www.site.com".
	 */
	stripDomains : ["www", "www2", "www3", "m", "mobi"],


	/**
	 * @type Array
	 * 
	 * Array of Mobile Devices for detection
	 * 
	 * To add any Device use in front: detectmobile.mobileDevice.push( ['searchString', 'Name', '(n,d or u'] )
	 * options: n = Not Mobile, d = Default (incl. Screen Resolution), u = Unique - alway Mobile )
	 */
	mobileDevices : new Array(
		
		['mobileexplorer',	'Mobile Explorer',	'd'],
		['palmsource',		'Palm',				'd'],
		['palmscape',		'Palmscape',		'd'],

		//-> Phones
		['motorola',		'Motorola',			'd'],
		['nokia',			'Nokia',			'd'],
		['palm',			'Palm',				'd'],
		
		['iphone',			"Apple iPhone",		'u'],
		['ipad',			"Apple iPad",		'n'],
		['ipod',			"Apple iPod Touch",	'u'],
		
		['sony',			"Sony Ericsson",	'd'],
		['ericsson',		"Sony Ericsson",	'd'],
		['blackberry',		"BlackBerry",		'd'],
		['lg',				"LG",				'd'],
		['htc',				"HTC",				'd'],
		['samsung',			"Samsung",			'd'],
		['sharp',			"Sharp",			'd'],
		['alcatel',			"Alcatel",			'd'],
		['mot-',			"Motorola",			'd'],
		['zte',				"ZTE",				'd'],
		
		//->Mobile Specials
		['gt-i9300',                    "Samsung Galaxy S3",            'u'],

		//-> OS
		['symbian',			"Symbian",			'd'],
		['SymbianOS',		"SymbianOS",		'd'],
		['elaine',			"Palm",				'd'],
		['palm', 			"Palm",				'd'],
		['series60', 		"Symbian S60",		'd'],

		//-> Browsers
		['netfront',		"Netfront Browser",	'd'],
		['openwave',		"Openwave Browser",	'd'],
		['mobilexplorer',	"Mobile Explorer",	'd'],
		['operamini',		"Opera Mini",		'd'],
		['opera mini', 		"Opera Mini",		'd'],

		//-> Other
		['vodafone',		"Vodafone",			'd'],
		['o2',				"O2",				'd'],

		//-> Fallback
		['mobile',			"Generic",			'u'],
		['wireless',		"Generic",			'd'],
		['j2me',			"Generic",			'd'],
		['midp',			"Generic",			'd'],
		['cldc',			"Generic",			'd'],
		['up.link',			"Generic",			'd'],
		['up.browser',		"Generic",			'd'],
		['smartphone',		"Generic",			'd'],
		['cellphone',		"Generic",			'd']

	),


	//////////////////////////                  
				 
	/**
	 * Handle mobile redirection logic.
	 * 
	 * 
	 * Perform a redirect to a mobile site if needed.
	 * Set sticky cookies for website if necessary URL parameters are present.
	 * 
	 */ 
	process : function() {      
	
		var currentURL = window.location.href;
		
		var parameters = this.splitURLParameters(currentURL);
		
		var oldCookie = this.readCookie(this.cookieName);
		
		if(this.forceWebParameter in parameters) {
		   this.createCookie(this.cookieName, "true");
		   // No longer redirects to mobile
		   return;
		}
				
		// Then check if we need to stick on the web site
		// based on cookie
		if(oldCookie) {
		if (this.forceMobileParameter in parameters) {
		this.eraseCookie(this.cookieName);
		} else {
		return;
		}
		}
		
		// Check if we are already on the mobile domain
		// - no action needed
		if(this.isOnMobileSite()) {
			return;     
		}
				
		// If we are not on the mobile site then we must be on the web site...
		
		// Do the feature detection or check the forced mobile site link
		if(this.detectMobile() || (this.forceMobileParameter in parameters)) {
			 // Based on the feature deteciton this looks like we are on the mobile site
			 var url = this.getRedirectTarget("mobile", currentURL);
			 this.performRedirect(url);
		}
		
	},
	
	
	/**
	 * Rewrite URL for moving from the website to a mobile site or vice versa.
	 * 
	 * If detectmobile has no callback() set, just redirect to the 
	 * site root using defaultWebURL or defaultMobileURL
	 * 
	 * @param {String} mode "web" or "mobile"
	 * 
	 * @param {String} url The current URL 
	 */
	getRedirectTarget : function(mode, url) {
		
		var newURL = null;
		
		if(this.redirectCallback) {
			   newURL = this.redirectCallback(mode, url);
		} else {
			   if(mode == "mobile") {
					   newURL = this.defaultMobileURL;
			   } 
		}
		
		if(!newURL) {
			   throw "Cannot redirect to " + mode + " because target URL cannot be resolved by detectmobile.js";
		}
		
		return newURL;
	},
	
	/**
	 * Do redirect to a new page using Javascript
	 * 
	 * @param {Object} url
	 */
	performRedirect : function(url) {
		
		if(url == window.location.href) {
			// Force reload
			window.location.reload();
			return;
		}
		
		window.location = url;
		
	},
	
	/**
	 * Helper function to rewrite domain name to URLs.
	 * 
	 * E.g. site.com -> m.site.com
	 * 
	 * Port part is not touched in the domain name: site.com:8080 -> m.site.com:8080. 
	 * 
	 * @param {String} url Full http/https URL
	 * 
	 * @param {String} newDomain New domain name to be injected, with optional 
	 * 
	 * @param {Boolean} prefix Append newDomain to the beginning of the domain name with dot separation, instead of replacing the old domain
	 * 
	 * @param {Boolean} strip true to remove all domain prefixes on the host name before constructing the final URL
	 * 
	 * @return {String} URL where domain part has been replaced by newDomain
	 */
	replaceDomainName : function(url, newDomain, prefix, strip) {
		var i;
	
	if(url.substring(0, 4) != "http") {
				throw "Only absolute http/https URLs supported";
		}
				
		var split = url.split("/");
		
		if(split.length <2) {
				throw "Cannot understand:" + url;
		}
		
		// http [0] / [1] / domain : port [2] /
		var host = split[2];
				
		hostparts = host.split(":");
		
	var hostname = hostparts[0];
	
	for(i=0; i<this.stripDomains.length; i++) {
		   var s = this.stripDomains[i];	
		   if(hostname.indexOf(s + ".") == 0) {
				   hostname = hostname.substring(s.length + 1);
			   break;
		   }
	}
	
		if(prefix) {
				newDomain = newDomain + "." + hostname;
		} 
		
		if(hostparts.length > 1) {
				hostparts = [newDomain, hostparts[1]]
		} else {
				hostparts = [newDomain];
		}
		
		var host = hostparts.join(":");
		
		var newsplit = [ split[0], split[1], host ];
		
		for(var i=3; i<split.length; i++) {
				newsplit.push(split[i]);
		}
		
		return newsplit.join("/");
						
	},
 
	  
	/** Add new URL variables safely with or without existing '?' character */
	addURLParameter : function(aURL, aNewVar){
		var args = mobilize.getUrlVars(aURL);
		var newurl = aURL.split("?",1)[0];
		newurl += "?";
		
		var items = [];
		for(var i = 0; i < args.length; i++) {
			var a = args[i];
			var value = args[a];
			items.push(a + "=" + value);
		}
		
		items.push(aNewVar);
		
		newurl += items.join("&");
		return newurl;
	},
	/** 
	 * Read URL parameters to dict.
	 * 
	 * See: http://jquery-howto.blogspot.com/2009/09/get-url-parameters-values-with-jquery.html
	 */
	splitURLParameters : function (aURL) {
		if(!this._urlvars) {
			this._urlvars = {};
		}
		if(!aURL) {
			aURL = window.location.href;
		}
		
		// Cache window.location.href call results
		if(this._urlvars[aURL]) {
			return this._urlvars[aURL];
		}
		
		var vars = [], hash;

		if(aURL.indexOf("#") >= 0 ){
			aURL = aURL.slice(0,aURL.indexOf("#"));
		}
		var hashes = aURL.slice(aURL.indexOf('?') + 1).split('&');
		
		for(var i = 0; i < hashes.length; i++)
		{
			hash = hashes[i].split('=');
			vars.push(hash[0]);
			vars[hash[0]] = hash[1];
		}
		
		this._urlvars[aURL] = vars;
		return vars;
	},
	
	

	/**
	 * Create a new cookie 
	 * 
	 * @see http://www.quirksmode.org/js/cookies.html     
	 */
	createCookie : function(name,value,days) {
		var expires = "";
		
		if (days) {
			var date = new Date();
			date.setTime(date.getTime()+(days*24*60*60*1000));
			expires = "; expires="+date.toGMTString();
		}
		document.cookie = name+"="+value+expires+"; path=/";
	},
	
	/**
	 * Get a cookie value by name 
	 * 
	 * @see http://www.quirksmode.org/js/cookies.html     
	 */
	readCookie : function(name) {
		var nameEQ = name + "=";
		var ca = document.cookie.split(';');
		for(var i=0;i < ca.length;i++) {
			var c = ca[i];
			while (c.charAt(0)===' ') {
				c = c.substring(1,c.length);
			}
			if (c.indexOf(nameEQ) === 0) {
				return c.substring(nameEQ.length,c.length);
			}
		}
		return null;
	},
	
	/**
	 * Remove cookie by name
	 *  
	 * See: http://www.quirksmode.org/js/cookies.html
	 * 
	 * @param {String} name Cookie name
	 */
	eraseCookie : function(name) {
		this.createCookie(name,"",-1);
	},
	

	/** 
	 * Core logic of detecting a mobile browser.
	 * 
	 * Use user agent capabilities available in Javascript to
	 * make a heurestic decision whether this browser is mobilish
	 * or not.
	 * 
	 * I.e. check the screen size. 
	 *
	 * @return True if the current browser is a mobile browser
	 */ 
	detectMobile: function(){
		var dimensions  = this.getScreenDimensions();
		var deviceLength = this.mobileDevices.length;

		// Screen can be in landscape or portrait mode
		// We want to use the longer dimension (width in landscape)
		var length = Math.max(dimensions.width, dimensions.height);
		
		// Detect by UserAgent First
		for( var dC = 0; dC < deviceLength; dC++ ){

			if( this.checkUserAgentString( this.mobileDevices[ dC ][0] ) ){

				switch( this.mobileDevices[ dC ][2] ){
					case 'u':
						return true;
						break;

					case 'n':
						return false;
						break;

					default: 
						if( length <= this.thresholdWidthInPixels ) {
						   return true;
						}
						break;
				}

			}

		}
		

		/*if(length <= this.thresholdWidthInPixels) {
			   return true;
		}*/
		
		return false;
	},
	
	/**
	 * https://developer.mozilla.org/en/DOM/window.screen.width
	 * 
	 * XXX: Add DPI detection http://stackoverflow.com/questions/476815/can-you-access-sceen-displays-dpi-settings-in-a-javascript-function
	 */
	getScreenDimensions : function() {
		return {
				width : window.screen.availWidth,
				height : window.screen.availHeight
		}
	},
	
	/**
	 * Check if the current location is on a mobile site.
	 * 
	 * Use domain name based detection - check if the domain name resembles any common 
	 * names used for the mobile domains.
	 * 
	 * @return {Boolean} true if the domain or the current window URL looks like it is a mobile site 
	 */
	isOnMobileSite : function() {
		var domainName = window.location.hostname;
		
		var parts = domainName.split(".");
		
		for(var i=0; i<parts.length; i++) {
			for(var l=0; l<this.mobileSiteDomainIdentifiers.length; l++) {
				if(parts[i] == this.mobileSiteDomainIdentifiers[l]) {
						return true;
				}
			}
		}
		return false;
	},

	/**
	 * Checks the User-Agent String if any mobileDevises String is inside
	 * 
	 * @return {Boolean} true if the detected string is in the User-Agent 
	 */
	checkUserAgentString : function( name ){
		var uAgent = navigator.userAgent.toLowerCase();
		if( uAgent.indexOf( name.toLowerCase() ) > -1  ){
			return true;
		}
		return false;
	}

};
