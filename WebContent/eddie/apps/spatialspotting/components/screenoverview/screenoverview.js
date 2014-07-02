function Screenoverview(options){
	console.log("Screenoverview()");
	var settings = {
		screens: null,
		html: $('#screenoverview'),
		screenTemplate: $('#screenoverview > .screen').clone()
	};
	var self = {};
	
	var initialize = function(){
		console.log("Screenoverview.initialize()");
		settings.html.draggable();
		settings.html.css('position', 'fixed');
		render();
	}
	
	self._update = function(json){
		var data = JSON.parse(json);
		if(data['screens']){
			settings.screens = data['screens'];
			render();
		}
	}
	
	function render(){
		settings.html.html('');
		if(settings.screens){
			$.each(settings.screens, function(key, scr){
				var splits = scr.name.split('/');
				var template = settings.screenTemplate.clone();
				template.find('.color').css('background-color', scr.color);
				template.find('.name').text('user ' + splits[splits.length - 1]);
				settings.html.append(template);
			})
		}
	}
	
	self.putMsg = function(msg){
		var command = $(msg.target).attr('id');
		var content = msg.content;
		var args = [content]
		if(typeof self["_" + command] == "function"){
			self["_" + command].apply(this, args);
		}else{
			console.log("Message not handled!");
		}
	}
	
	initialize();
	
	return self;
}
