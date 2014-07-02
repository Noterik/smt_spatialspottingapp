function Availableapplications(options){
	var self = {};
	var settings = {
		html: $('#availableapplications'),
		applications: $('#availableapplications > .applications'),
		template: $('#availableapplications > .applications > .application').clone(),
		interval: null
	};
	
	$.extend(settings, options);
	
	var initialize = function(){
		settings.html.css('position', 'fixed');
		startPolling();
		listen();
	}
	
	var startPolling = function(){
		settings.interval = setInterval(function(){
			eddie.putLou('', 'getAvailableApplications()');
		}, 2500)
	}
	
	var stopPolling = function(){
		clearInterval(settings.interval);
	}
	
	var listen = function(){
		//settings.html.click(toggleApplications);
		settings.html.on('click', toggleApplications);
	}
	
	var toggleApplications = function(){
		if(settings.applications.is(':visible')){
			settings.applications.hide("fast");
		}else{
			settings.applications.show("fast");
		}
	}
	
	self._setApplications = function(json){
		settings.applications.html('');
		var applications = JSON.parse(json).applications;
		var uri = parseUri(window.location.href);
		var host;
		uri.port ? host = uri.host + ":" + uri.port : host = uri.host;
		for(key in applications){
			var application = applications[key];
			var template = settings.template.clone();
			var href = uri.protocol + "://" + host + "/lou" + application;
			template.find('a').attr('href', href);
			template.find('a').text(application);
			if(uri.directory == ("/lou" + application)){
				template.find('a').addClass('self');
			}
			settings.applications.append(template);
		}
	}
	
	self.putMsg = function(msg){
		var command = $(msg.target).attr('id');
		var content = msg.content;
		var args = content;
		if(typeof self["_" + command] == "function"){
			self["_" + command].apply(this, [args]);
		}else{
			console.log("Message not handled!");
		}
	}
	
	initialize();
	
	return self;
}
