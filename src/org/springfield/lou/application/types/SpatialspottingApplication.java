package org.springfield.lou.application.types;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

import org.springfield.lou.application.ApplicationManager;
import org.springfield.lou.application.Html5Application;
import org.springfield.lou.application.Html5ApplicationInterface;
import org.springfield.lou.application.types.spatialspotting.Touch;
import org.springfield.lou.screen.Capabilities;
import org.springfield.lou.screen.Screen;

public class SpatialspottingApplication extends Html5Application {
	
	private String presentation = "/domain/springfieldwebtv/user/rutger/collection/default/presentation/35";
	private double currentTime = 0;
	private boolean playing = false;
	private HashMap<Screen, Boolean> waitingForSync = new HashMap<Screen, Boolean>();
	private List<String> colors;
	private Map<Screen, String> usedColors;
	private Map<Screen, Touch> touches;
	private String quality = "360";
	private Boolean touchStarted = false;
	
	public SpatialspottingApplication(String id){
		super(id);
		colors = new ArrayList<String>();
		usedColors = new HashMap<Screen, String>();
		touches = new HashMap<Screen, Touch>();
		colors.add("#27f00c");
		colors.add("#0c2cf0");
		colors.add("#45e6f0");
		colors.add("#f97f5a");
		colors.add("#e004fa");
		colors.add("#8304fa");
		colors.add("#237b50");
	}
	
	public void onNewScreen(Screen s) {
		String fixedrole = s.getParameter("role");
		// so we want to load based on device type
		Capabilities caps = s.getCapabilities();
		String dstyle = caps.getDeviceModeName();
				
		loadStyleSheet(s,"generic");
		loadStyleSheet(s,"krusty-component");
		loadStyleSheet(s,"jquery-mobile2");
		loadStyleSheet(s, "terms");
		
		// Do we already have a screen in the application that claims to be a mainscreen ?
		if (screenmanager.hasRole("mainscreen") && (fixedrole==null || !fixedrole.equals("mainscreen"))) {
			createSecondaryScreen(s);
			// yes, so this is a secondary screen, set its role and load its components
			
		} else {
			if(s.getParameter("presentation") != null){
				presentation = s.getParameter("presentation");
			}
			if(s.getParameter("quality") != null){
				quality = s.getParameter("quality");
			}
			createMainScreen(s);
		}
		loadContent(s, "notification");
		waitingForSync.put(s, false);
	}
	
	private void createSecondaryScreen(Screen s){
		try{
			s.setRole("secondaryscreen");
			loadContent(s, "joinbutton");
			loadContent(s, "krustytouch");
			loadContent(s, "screenoverview");
			loadContent(s, "availableapplications");
			s.putMsg("availableapplications", "", "setApplications(" + getAvailableApplications() + ")");
			s.putMsg("krustytouch", "", "setPresentation(" + presentation + ")");
			s.putMsg("krustytouch", "", "setRole(secondary)");
			s.putMsg("krustytouch", "", "setQuality(" + quality + ")");
			setColor(s);
			updateScreens();
		}catch(Exception e){
			e.printStackTrace();
		}
	}
	
	private void createMainScreen(Screen s){
		try{
			System.out.println("createMainScreen()");
			s.setRole("mainscreen");
			loadContent(s, "joinbutton");
			loadContent(s, "krustytouch");
			loadContent(s, "screenoverview");
			loadContent(s, "availableapplications");
			loadContent(s, "terms");
			s.putMsg("terms", "", "show()");
			s.putMsg("availableapplications", "", "setApplications(" + getAvailableApplications() + ")");
			s.putMsg("krustytouch", "", "setPresentation(" + presentation + ")");
			s.putMsg("krustytouch", "", "setRole(primary)");
			s.putMsg("krustytouch", "", "setQuality(" + quality + ")");
			setColor(s);
			updateScreens();
		}catch(Exception e){
			e.printStackTrace();
		}
	}
	
	private String getAvailableApplications(){
		String[] splits = presentation.split("/");
		String domain = "";
		for(int i = 0; i < splits.length; i++){
			if(splits[i].equals("domain")){
				domain = splits[i + 1];
				break;
			}
		}
		
		String json = "{\"applications\":[";
		ArrayList<String> apps = new ArrayList<String>();
		Map<String, Html5ApplicationInterface> applications = ApplicationManager.instance().getApplications(); 
		for(Iterator<String> i = applications.keySet().iterator(); i.hasNext();){
			String app = i.next();
			System.out.println("APP: " + app);
			if(app.contains("domain/" + domain) && app.contains("/html5application/spatialspotting")){
				apps.add(app);
			}
		}
		
		for(Iterator<String> i = apps.iterator(); i.hasNext();){
			String app = i.next();
			json += "\"" + app + "\"";
			if(i.hasNext()){
				json += ",";
			}
		}
		json += "]}";
		return json;
	}
	
	private void setColor(Screen s){
		int key = 1 + (int)(Math.random() * ((colors.size() - 1) + 1)) - 1;
		String color = colors.get(key);
		if(usedColors.values().contains(color)){
			setColor(s);
		}else{
			usedColors.put(s, color);
			s.putMsg("krustytouch", "", "setColor(" + color + ")");
		}
	}
	
	private void updateScreens(){
		String json = "{\"screens\":[";
		
		for(Iterator<Screen> i = usedColors.keySet().iterator(); i.hasNext();){
			Screen scr = i.next();
			
			json += "{";
			json += "\"name\":\"" + scr.getId() + "\",";
			json += "\"color\":\"" + usedColors.get(scr) + "\"";
			json += "}";
			
			if(i.hasNext()){
				json += ",";
			}
		}
		
		json += "]}";
		
		for(Iterator<Screen> i = usedColors.keySet().iterator(); i.hasNext();){
			Screen s = i.next();
			s.putMsg("screenoverview", "", "update(" + json + ")");
		}
	}
	
	private void updateTouches(){
		String json = "{\"touches\":[";
		for(Iterator<Screen> i = touches.keySet().iterator(); i.hasNext();){
			Screen scr = i.next();
			Touch t = touches.get(scr);
			json += t.getJSON();
			
			if(i.hasNext()){
				json += ",";
			}
		}
		
		json += "]}";
		
		for(Iterator<Screen> i = usedColors.keySet().iterator(); i.hasNext();){
			Screen s = i.next();
			s.putMsg("krustytouch", "json", "setTouches(" + json + ")");
		}
	}
	
	public void putOnScreen(Screen s,String from,String msg) {
        int pos = msg.indexOf("(");
        if (pos!=-1) {
            String command = msg.substring(0,pos);
            String content = msg.substring(pos+1,msg.length()-1);
            if (command.equals("krustyready")) {
            	handleKrustyReady(s, from);
            }else if(command.equals("touchStart")){
            	handleTouchStart(s, from, content);
            }else if(command.equals("touchMove")){
            	handleTouchMove(s, from, content);
            }else if(command.equals("saveTag")){
            	handleSaveTag(s, from, content);
            }else if(command.equals("timeupdate")){
            	handleTimeUpdate(s, from, content);
            }else if(command.equals("pause")){
            	handlePause(s, from, content);
            }else if(command.equals("play")){
            	handlePlay(s, from, content);
            }else if(command.equals("scrubTo")){
            	handleScrubTo(s, from, content);
            }else if(command.equals("pausedForSync")){
            	handlePausedForSync(s, from, content);
            }else if(command.equals("keepAlive")){
            }else if(command.equals("scrubStop")){
            	handleScrubStop(s, from, content);
            }else if(command.equals("getAvailableApplications")){
            	handleGetAvailableApplications(s, from, content);
            }
        }
        
	}
	
	private void handleGetAvailableApplications(Screen s, String from, String content){
		s.putMsg("availableapplications", "", "setApplications(" + getAvailableApplications() + ")");
	}
	
	public void onScreenTimeout(Screen s) {
		System.out.println("onScreenTimeout()");
		try{
			if(s.getRole().equals("mainscreen")){
				if(this.screenmanager.getScreens().values().size() >= 2){
					for(Iterator<Screen> i = this.screenmanager.getScreens().values().iterator(); i.hasNext();){
						Screen scr = i.next();
						if(!scr.equals(s)){
							scr.setRole("mainscreen");
							break;
						}
					}
				}
			}
			waitingForSync.remove(s);
			touches.remove(s);
			usedColors.remove(s);
			updateScreens();
			updateTouches();
		}catch(Exception e){
			e.printStackTrace();
		}
	}
	
	private void handleKrustyReady(Screen s, String from){
		System.out.println("SharedviewApplication.handleKrustyReady()");
		if(s.getRole().equals("secondaryscreen")){
			System.out.println("SpatialspottingApplication.handleKrustyReady(): SECONDARY SCREEN! currentTime: " + currentTime);
		}else{
			s.putMsg("krustytouch", "", "showController()");
		}
	}
	
	private void handleScrubStop(Screen s, String from, String content){
		//if(s.getRole().equals("mainscreen")){
			Map<String, Screen> screens = getScreenManager().getScreens();
			Iterator<String> i = screens.keySet().iterator();
			while(i.hasNext()){
				Screen screen = screens.get(i.next());
				if(!s.equals(screen)){
					screen.putMsg("krustytouch", "", "scrubStop(" + content + ")");
				}
			}
		//}
	}
	
	private void handleTouchStart(Screen s, String from, String content){
		System.out.println("SharedviewApplication.handleTouch(s: " + s + ", from: " + from + ", content: " + content + ")");
		String[] values = content.split(",");
		Touch t = new Touch(Double.parseDouble(values[0]), Double.parseDouble(values[1]), values[3]);
		touches.put(s, t);
		if(!this.touchStarted){
			this.touchStarted = true;
			this.currentTime = Double.parseDouble(values[2]);
		}
		getComponentManager().getComponent("krustytouch").put("app", "setTouch(" + content + ")");
		getComponentManager().getComponent("krustytouch").put("app", "setCurrentTime(" + this.currentTime + ")");
		updateTouches();
	}
	
	private void handleTouchMove(Screen s, String from, String content){
		System.out.println("SharedviewApplication.handleTouchMove(s: " + s + ", from: " + from + ", content: " + content + ")");
		String[] values = content.split(",");
		Touch t = touches.get(s);
		t.setX(Double.parseDouble(values[0]));
		t.setY(Double.parseDouble(values[1]));
		getComponentManager().getComponent("krustytouch").put("app", "touchMove(" + content + ")");
		updateTouches();
	}
	
	private void handleSaveTag(Screen s, String from, String content){
		System.out.println("SpatialspottingApplication.handleSaveTag(content: " + content + ")");
		String[] values = content.split(",");
		getComponentManager().getComponent("notification").put("app", "show(New tag saved!, x: " + values[0] + ", y: " + values[1] + ", time:" + values[2] + ")");
		getComponentManager().getComponent("krustytouch").put("app", "tagSaved()");
	}
	
	private void handleScrubTo(Screen s, String from, String content){
		//if(s.getRole().equals("mainscreen")){
			Map<String, Screen> screens = getScreenManager().getScreens();
			Iterator<String> i = screens.keySet().iterator();
			while(i.hasNext()){
				Screen screen = screens.get(i.next());
				if(!s.equals(screen)){
					screen.putMsg("krustytouch", "", "setCurrentTime(" + content + ")");
				}
			}
		//}
	}
	
	private void handlePausedForSync(Screen s, String from, String content){
		System.out.println("HandlePausedForSync!!!!");
		waitingForSync.put(s, true);
		boolean allSynced = true;
		Iterator<Screen> i = waitingForSync.keySet().iterator();
		while(i.hasNext()){
			Screen screen = i.next();
			System.out.println(waitingForSync.get(screen));
			if(!waitingForSync.get(screen)){
				allSynced = false;
			}
		}
		if(allSynced){
			getComponentManager().getComponent("krustytouch").put("app", "setCurrentTime(" + currentTime + ")");
			getComponentManager().getComponent("krustytouch").put("app", "play()");
			i = waitingForSync.keySet().iterator();
			while(i.hasNext()){
				waitingForSync.put(i.next(), false);
			}
		}
	}
	
	private void handleTimeUpdate(Screen s, String from, String content){
		String[] time = content.split(":");
		Double currentScreenTime = Double.parseDouble(time[0]);
		System.out.println("UPDATE FROM: " + from + " TIME: " + content);
		System.out.println(s.getRole());
		if(s.getRole().equals("mainscreen")){
			currentTime = currentScreenTime;
		}else if(s.getRole().equals("secondaryscreen")){
			if(currentScreenTime < (currentTime - 2) || currentScreenTime > (currentTime + 2) && playing){
				getComponentManager().getComponent("notification").put("app", "show(Pause for sync!)");
				getComponentManager().getComponent("krustytouch").put("app", "pauseForSync()");
			}
		}
	}
	
	private void handlePause(Screen s, String from, String content){
		//if(s.getRole().equals("mainscreen")){
			playing = false;
			Map<String, Screen> screens = getScreenManager().getScreens();
			Iterator<String> i = screens.keySet().iterator();
			while(i.hasNext()){
				Screen screen = screens.get(i.next());
				if(!s.equals(screen)){
					screen.putMsg("krustytouch", "", "pause()");
				}
			}
		//}
	}
	
	private void handlePlay(Screen s, String from, String content){
		System.out.println("HANDLE PLAY!!");
		//if(s.getRole().equals("mainscreen")){
			playing = true;
			Map<String, Screen> screens = getScreenManager().getScreens();
			Iterator<String> i = screens.keySet().iterator();
			while(i.hasNext()){
				Screen screen = screens.get(i.next());
				if(!s.equals(screen)){
					screen.putMsg("krustytouch", "", "play()");
				}
			}
			touches.clear();
			touchStarted = false;
		//}
	}
	
}
