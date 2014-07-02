function Krustytouch(options){
	var self = {};
	var settings = {
		'qrcode': false,
		'component': $('#krusty'),
		'touchcatcher': $('#touchcatcher'),
		'tagarea': $('#tagarea'),
		'touchindicator': $('#touchindicator'),
		'controller': $('#videocontroller'),
		'touching': false,
		'currentTouch': null,
		'krustyready': false,
		'bufferedLastTouch': null,
		'pausedForSync': false,
		'sendTouchMoveEvent': true, 
		'isPlayCommand': false,
		'isScrubbing': false,
		'justMoved': false,
		'role': 'primary',
		'color': null,
		'quality': '360p',
		'played': false,
		'listening': false
	};
	$.extend(settings, options);
	
	var initialize = function(){
		analytics();
		var v = document.createElement("video");
		if(!v.canPlayType('video/mp4; codecs="avc1.42E01E, mp4a.40.2"')){
			$('#krustytouch').remove();
			$('#joinbutton').remove();
			$('#screenoverview').remove();
			alert('Sorry, your browser can not play h.264 video. Please switch to an h.264 compatible browser like Google Chrome.');
		}else{
			if(eddie.getComponent('joinbutton')){
				eddie.getComponent('joinbutton').loading();
			}
							
			settings.component.on('presentationloaded', function(){
				eddie.getComponent('joinbutton').show();
				eddie.putLou('', 'krustyready()');
				var dimensions = settings.component.krusty('dimensions');
				settings.touchcatcher.width(dimensions.width);
				settings.touchcatcher.height(dimensions.height);
				settings.touchcatcher.css('left', dimensions.left);
				settings.touchcatcher.css('top', dimensions.top);
				settings.touchcatcher.css('z-index', 9998);
				settings.tagarea.width(dimensions.width);
				settings.tagarea.height(dimensions.height);
				settings.tagarea.css('left', dimensions.left);
				settings.tagarea.css('top', dimensions.top);
				settings.component.krusty('quality', settings.quality);
				settings.krustyready = true;
				
			});
			
			settings.component.on('scrubstart', function(){
				eddie.putLou('', 'scrubStart()');
			});
			
			settings.component.on('scrubstop', function(){
				eddie.putLou('', 'scrubStop(' + settings.component.krusty('currentTime') + ')');
			});
			
			settings.component.on('pause', function(){
				if(settings.krustyready && !settings.pausedForSync){
					eddie.putLou('', 'pause()');
				}
			});
			
			settings.component.on('play', function(){
				
				if(eddie.getComponent('joinbutton')){
					eddie.getComponent('joinbutton').hide();
				}
				settings.touchcatcher.css('z-index', 9998);
				
				settings.bufferedLastTouch = null;
				if(settings.krustyready){
					$('.touchindicator').removeClass('saved');
					$('.touchindicator').addClass('clicked');
					$('.touchindicator').hide();
					if(settings.pausedForSync){
						settings.pausedForSync = false;
					}
					eddie.putLou('', 'play()');
				}
				settings.played = true;
			});
			
			
			settings.touchcatcher.on('mousedown', touchStart);
			settings.touchcatcher.on('mouseup', touchStop);
			settings.touchcatcher.on('touchstart', touchStart);	
			settings.touchcatcher.on('touchend', touchStop);	
			settings.touchcatcher.on('touchmove', touchMove);
			settings.controller.on('touchmove', controllerTouchMove);
			
			function rewind(){
				if(!settings.justMoved){
					if((settings.component.krusty('currentTime') - 10) > 0){
						settings.component.krusty('currentTime', settings.component.krusty('currentTime') - 10);
						eddie.putLou('', 'scrubTo('+Math.floor(settings.component.krusty('currentTime') - 10)+')');
					}
				}
			}
			
			settings.controller.find('#rewind').first().on('click', function(event){
				rewind();
			});
			
			settings.controller.find('#rewind').first().on('touchend', function(event){
				event.preventDefault();
				rewind();
			});
					
			settings.controller.on('touchend', function(event){
				settings.justMoved = false;
			});
				
			settings.component.on('timeupdate', function(){
				if(settings.krustyready){
					eddie.putLou('', 'timeupdate('+Math.floor(settings.component.krusty('currentTime'))+':'+Math.floor(settings.component.krusty('duration'))+')');
					if(!settings.component.krusty('isPlaying')){
						eddie.putLou('', 'scrubTo('+Math.floor(settings.component.krusty('currentTime'))+')');
					}
				}
			});
			
			setInterval(function(){
				eddie.putLou('', 'keepAlive()');
			}, 999);
		}
	};
	
	self._play = function(){
		settings.component.krusty('play');
		eddie.putLou('notification','show(play)');
	};
	
	self._pause = function(){
		settings.component.krusty('pause');
		eddie.putLou('notification','show(pause)');
	};
	
	self._mute = function(){
		settings.component.krusty('mute');
	};
	
	self._setRole = function(role){
		settings.role = role;
		/*if(role == "secondary"){
			$('.slider').slider().off('slidestart');
			$('.slider').slider().off('slidestop');
			$('.slider').slider().off('slide');
			$('#play-button').on('touchend', function(){
				$(this).remove();
			})
			$('#play-button').on('click', function(){
				$(this).remove();
			})
		}*/
	};
	
	self._setColor = function(color){
		settings.color = color;
	};
	
	self._setQuality = function(quality){
		settings.quality = quality;
		if(settings.krustyready){
			settings.component.krusty('quality', quality);
		}
	};
	
	self._volume = function(direction){
		if(direction == "UP"){
			settings.component.krusty('volume', settings.component.krusty('volume') + 0.1);
		}else if(direction == "DOWN"){
			setting.component.krusty('volume', settings.component.krusty('volume') - 0.1);
		}
	};
	
	self._setTouch = function(x, y, time, color){
		/*
		console.log('krustytouch._setTouch(' + x + ', ' + y + ', ' + time + ' )');
		var dimensions = settings.component.krusty('dimensions');
		
		time = parseFloat(time);
		settings.component.krusty('currentTime', time);
		 
		settings.touchindicator.css('left', x + "%");
		settings.touchindicator.css('top', y + "%");
		var rgb = Color.hexToRgb(color);
		settings.touchindicator.css('background', 'rgba(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ',0.5)');
		
		settings.touchindicator.removeClass('saved');
		settings.touchindicator.addClass('clicked');
		
		settings.touchindicator.show();
		*/
		
	};
	
	self._touchMove = function(x, y){
		/*
		settings.touchindicator.css('left', x + "%");
		settings.touchindicator.css('top', y + "%");
		*/
	};
	
	self._setCurrentTime = function(time){
		console.log("_setCurrentTime(" + time + ")");
		if(parseFloat(time) > 0)
			settings.component.krusty('currentTime', time);
	};
	
	self._tagSaved = function(){
		$('.touchindicator').removeClass('clicked');
		$('.touchindicator').addClass('saved');
		settings.touchcatcher.effect('highlight', {}, 500);
	};
	
	self._pauseForSync = function(){
		settings.pausedForSync = true;
		settings.component.krusty('pause');
		eddie.putLou('', 'pausedForSync()');
	};
	
	self._showController = function(){
		settings.controller.show();
	};
	
	self._scrubStart = function(){
		settings.component.krusty('pause');
	};
	
	self._scrubStop = function(time){
		settings.component.krusty('currentTime', time);
		settings.component.krusty('play');
	};
	
	self._setTouches = function(json){
		var data = JSON.parse(json);

		settings.tagarea.find('.touchindicator').removeClass('exists');
		if(data.touches){
			$.each(data.touches, function(key, touch){
				var touch = touch.touch;
				var id = "touch-" + touch.id;
				var indicator = $('#' + id);
				if(!indicator[0]){
					indicator = $('<div class="touchindicator" id="' + id + '"></div>'); 
					settings.tagarea.append(indicator);
				}
				indicator.addClass('exists');
				indicator.css('left', touch.x + "%");
				indicator.css('top', touch.y + "%");
				var rgb = Color.hexToRgb(touch.color);
				indicator.css('background', 'rgba(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ',0.5)');
				
				indicator.removeClass('saved');
				indicator.addClass('clicked');
				indicator.show();
			});
			
			settings.tagarea.find('.touchindicator:not(.exists)').remove();
			settings.component.krusty('pause');
		}
	};

	self.putMsg = function(msg){
		var command = $(msg.target).attr('id');
		var content = msg.content;
		var args = null;
		if(msg.target[0]["class"] == "setTouches"){
			args = [content];
		}else{
			args = content.split(",");
		}
		if(typeof self["_" + command] == "function"){
			self["_" + command].apply(this, args);
		}else{
			console.log("Message not handled!");
		}
	};
	
	var analytics = function(){
		(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
		(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
		m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
		})(window,document,'script','//www.google-analytics.com/analytics.js','ga');
	
	  	ga('create', 'UA-44535883-1', 'noterik.nl');
	  	ga('send', 'pageview');
	};
	
	var touchStart = function(event){
		var dimensions = settings.component.krusty('dimensions');
		if(settings.isPlayCommand && settings.currentTouch == null){
			settings.component.krusty('play');
			eddie.putLou('', 'play()');
		}
		else if(settings.currentTouch != null){		
			var percentageX = parseFloat(settings.currentTouch.originalEvent.layerX / dimensions.width * 100);
			var percentageY = parseFloat(settings.currentTouch.originalEvent.layerY / dimensions.width * 100);
			eddie.putLou('', 'saveTag(' + percentageX + ',' + percentageY + ',' + settings.bufferedLastTouch + ')');
		}else{
			event.preventDefault();
			var dimensions = settings.component.krusty('dimensions');
			var percentageX = parseFloat(event.originalEvent.layerX / dimensions.width * 100);
			var percentageY = parseFloat(event.originalEvent.layerY / dimensions.height * 100);
			settings.component.krusty('pause');
			if(settings.bufferedLastTouch == null){
				var time = parseFloat(settings.component.krusty('currentTime'));
				settings.bufferedLastTouch = (Math.floor(time * 4) / 4).toFixed(2);
			}
			
    		settings.bufferedLastTouch = Math.round(settings.bufferedLastTouch * 2)/2;
			eddie.putLou('', 'touchStart(' + percentageX + ',' + percentageY + ',' + settings.bufferedLastTouch + ',' + settings.color + ')');
			settings.currentTouch = event;
		}
	};
	
	var touchStop = function(event){
		settings.currentTouch = null;
		eddie.putLou('','touchEnd()');
	};
	
	var touchMove = function(event){
		event.preventDefault();
		var dimensions = settings.component.krusty('dimensions');
		var percentageX = parseFloat(event.originalEvent.layerX / dimensions.width * 100);
		var percentageY = parseFloat(event.originalEvent.layerY / dimensions.height * 100);
		if(settings.bufferedLastTouch == null){
			var time = parseFloat(settings.component.krusty('currentTime'));
		}
		if(settings.sendTouchMoveEvent){
			eddie.putLou('', 'touchMove(' + percentageX + ',' + percentageY + ')');
			settings.sendTouchMoveEvent = false;
			setTimeout(function(){
				settings.sendTouchMoveEvent = true;
			}, 100);
		}
		settings.currentTouch = event;
	};
	
	var controllerTouchMove = function(event){
		event.preventDefault();
		var dimensions = settings.component.krusty('dimensions');
		settings.controller.css('left', (event.originalEvent.pageX - 60) + 'px');
		settings.controller.css('top', (event.originalEvent.pageY - 12) + 'px');
		settings.justMoved = true;
	};
		
	self._setPresentation = function(presentation){
		settings.component.krusty({
			'uri': presentation,
			'imgLocation': '/eddie/img/spatialspotting/'
		});
	};
	
	initialize();
	
	return self;
};
