/*
	FM JSONExporter
	for Adobe After Effects 2020 (17.1.0)
	https://www.sync.dev / info@sync.dev

	Instalation:
		Windows
			Copy to C:/Program Files/Adobe/Adobe After Effects {version}/Support Files/Scripts/ScriptUI Panels
		Mac
			Copy to /Applications/Adobe After Effects {version}/Scripts/ScriptUI Panels

	Usage:
		1. After Effects > Window > FM-JSONExporter.jsx
		2. Select target composition.
		3. Push Export button.
*/

function fmJsonExporter(thisObj) {

	var scriptName = "FM JSONExporter"
	var scriptVersion = "1.0.5"
	var isWin = (File.fs == "Windows");
	
	// Show the Panel
	var w = buildUI(thisObj);
	if (w.toString() == "[object Panel]") {
		w;
	} else {
		w.show();
	}

	// Build UI Pamel
	function buildUI(thisObj) {
		var windowTitle = scriptName + " v" + scriptVersion
		var firstButton = "Export"
		var win = (thisObj instanceof Panel)? thisObj : new Window('palette', windowTitle, undefined, {resizeable:true})
		var myButtonGroup = win.add ("group")
			myButtonGroup.spacing = 10;
			myButtonGroup.margins = 0;
			myButtonGroup.orientation = "column";
			win.exportBtn = myButtonGroup.add ("button", undefined, firstButton);
			myButtonGroup.alignment = "center";
			myButtonGroup.alignChildren = "left";

		win.exportBtn.onClick = function(){
			exportJson(win);
		}
		win.message = myButtonGroup.add("statictext", [10,10,240,60], "Select target composition and push Export.    ",{multiline:true})
		win.center()
		win.layout.layout(true);

		return win
	}

	// Main Seq
	function exportJson(win) {
		var theComp = app.project.activeItem
		if (theComp instanceof CompItem) {
			win.message.text = "Export " + theComp.name
			var json = getJson(theComp, win)
			if (json) {
				saveFile(json)
				win.message.text = "Exported " + theComp.name
			} else {
				win.message.text = "Error, \nUnable to build JSON from " + theComp.name + ".\nMaybe the marker does not exist."
				return false
			}
		} else {
			win.message.text = "Error, \nBefore pressing Export,\nplease select a composition."
			return false
		}
	}

	// Getting Json Object
	function getJson(theComp) {
		var keyCount = theComp.markerProperty.numKeys
		if (!keyCount) {
			return false
		}
		var today = new Date()
		var startTime = theComp.displayStartTime
		var startTimecode = timeToCurrentFormat(startTime, theComp.frameRate)
		var trt = timeToCurrentFormat(theComp.duration, theComp.frameRate)
		if (app.project.file) {
			var projectFileName = app.project.file.name
		} else {
			var projectFileName = "The file has not been saved yet."
		}
		var json = {
			"date": today.toLocaleString(),
			"env": {
				"author": system.userName,
				"host": system.machineName,
				"os": $.os,
				"projectFile": projectFileName,
				"appVersion": "Adobe After Effects " + app.version,
				"appEncoding": $.appEncoding,
				"scriptVersion": scriptVersion
			},
			"composition": {
				"name": theComp.name,
				"width": theComp.width,
				"height": theComp.height,
				"timecodeBase": theComp.frameRate,
				"isDrop": theComp.dropFrame,
				"startTimecode": startTimecode,
				"trt": trt,
				"keyFrames": []
			}
		}
		for (var i=0; i<keyCount; i++) {
			var sec = Math.round(theComp.markerProperty.keyTime(i + 1) * 1000) / 1000
			var tc = timeToCurrentFormat(sec + startTime, theComp.frameRate)
			var comment = theComp.markerProperty.keyValue(i + 1).comment
			var duration = theComp.markerProperty.keyValue(i + 1).duration
			var theObj = {
				"second": sec,
				"timecode": tc,
				"comment": comment,
			}
			json.composition.keyFrames[i] = theObj
		}
		return json
	}

	// Save File
	function saveFile(json) {
		if (app.project.file) {
			var filePath = app.project.file.fsName
		} else {
			var filePath = "~/"
		}
		var fileName = filePath + json.compName + ".json"
		var fileObject = new File(fileName)
		var outputObject = fileObject.saveDlg("Save the json file.", "*.json")
		var text = JSON.stringify(json, null , "\t")
	
		if (outputObject) {
			outputObject.open("w","TEXT","????")
			outputObject.writeln(text)
			outputObject.close()
			outputObject.execute()
		}
	}
	
}



fmJsonExporter(this)
