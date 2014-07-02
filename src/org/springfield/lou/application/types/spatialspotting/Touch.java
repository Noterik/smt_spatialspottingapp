package org.springfield.lou.application.types.spatialspotting;

import java.util.UUID;

public class Touch {
	private UUID id;
	private Double x;
	private Double y;
	private String color;
	private Boolean newTouch;
	
	public Touch(Double x, Double y, String color){
		this.id = UUID.randomUUID();
		this.x = x;
		this.y = y;
		this.color = color;
	}
	
	public Double getX() {
		return x;
	}



	public void setX(Double x) {
		this.x = x;
	}



	public Double getY() {
		return y;
	}



	public void setY(Double y) {
		this.y = y;
	}



	public String getColor() {
		return color;
	}

	public void setColor(String color) {
		this.color = color;
	}

	public String getJSON(){
		String json = "{\"touch\":{";
		json += "\"id\":\"" + this.id + "\",";
		json += "\"x\":\"" + x + "\",";
		json += "\"y\":\"" + y + "\",";
		json += "\"color\":\"" + color + "\"";
		json += "}}";
		
		return json;
	}
}
