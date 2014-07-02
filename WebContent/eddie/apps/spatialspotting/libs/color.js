var Color = {}

Color.randomColor = function(){
	var r = Math.floor((Math.random()*255)+1);
	var g = Math.floor((Math.random()*255)+1);
	var b = Math.floor((Math.random()*255)+1);
	
	Color.rgbToHex(r,g,b);
}

Color.rgbToHex = function(R,G,B){
	function toHex(n) {
		n = parseInt(n,10);
		if (isNaN(n)) return "00";
		n = Math.max(0,Math.min(n,255));
 		return "0123456789ABCDEF".charAt((n-n%16)/16) + "0123456789ABCDEF".charAt(n%16);
	}
	
	return toHex(R)+toHex(G)+toHex(B)
}

Color.hexToRgb = function(hex){
	var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}
