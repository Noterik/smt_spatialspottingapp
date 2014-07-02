var Joinbutton = function(options){
	var self = {};
	var settings = {
		html: $('#joinbutton'),
		button: $('#joinbutton > img.button'),
		loading: $('#joinbutton > img.loading')
	};
	
	var initialize = function(){
	}
	
	self.loading = function(){
		settings.html.css('position', 'fixed');
		settings.html.css('width', $(window).width());
		settings.html.css('height', $(window).height());
		settings.html.css('top', 0);
		settings.html.css('background-color', 'black');
		settings.html.css('left', 0);
		settings.html.css('z-index', 9999);
		settings.html.find('.button').hide();
		settings.loading.css('position', 'absolute');
		settings.loading.css('top', $(window).height() / 2 - settings.loading.height() / 2);
		settings.loading.css('left', $(window).width() / 2 - settings.loading.width() / 2);
		settings.loading.show();
	}
	
	self.show = function(){
		settings.html.css('width', $(window).width());
		settings.html.css('height', $(window).height());
		settings.html.css('background-color', 'black');
		settings.html.css('position', 'fixed');
		settings.html.css('width', $(window).width());
		settings.html.css('height', $(window).height());
		settings.button.css('height', $(window).height());
		settings.button.show();
		settings.loading.hide();
		settings.html.css('top', 0);
		settings.html.css('left', 0);
		settings.button.css('position', 'absolute');
		settings.button.css('margin-top', '0');
		settings.button.css('left', $(window).width() / 2 - settings.button.width() / 2);
		settings.html.css('z-index', 9999);
		settings.button.on('touchstart', function(event){
			event.stopPropagation();
			event.preventDefault();
		})
		settings.button.on('touchend', function(event){
			self.hide();
			$('#play-button').click();
		})
		
		settings.button.on('click', function(event){
			self.hide();
			$('#play-button').click();
		})
	}
	
	self.hide = function(){
		settings.html.hide();
	}
	
	initialize();
	
	return self;
}
