/*
	# FM-JSONExporter
		for Adobe After Effects 2020 (17.1.0)

	## Description
		Export After Effects marker times to JSON format.

	## Instalation
	### Windows
		Copy to C:/Program Files/Adobe/Adobe After Effects {version}/Support Files/Scripts/ScriptUI Panels
	### Mac
		Copy to /Applications/Adobe After Effects {version}/Scripts/ScriptUI Panels

	## Usage
		1. Check After Effects > Edit > Prefarence > Scripting & Expressions > Allow Scripts to Write Files and Access Network
		2. Exec After Effects > Window > FM-JSONExporter.jsx
		3. Select target composition.
		4. Push Export button.

	## Change log
	### 1.0.8
		+ Correction of minor errors.
	### 1.0.7
		+ Decoded non-Latin characters. 
		+ Changed the way the Window is displayed in the center.
	### 1.0.6
		+ Unnecessary processing has been removed.
		+ Added a description of the license.
	### 1.0.5
		+ Reimplemented the whole thing.
		+ Changed to work within Script UI Panels.

		## License
		MIT © sync.dev / minamikik / https://www.sync.dev

*/

function fmJsonExporter(thisObj) {

	var scriptName = "FM JSONExporter"
	var scriptVersion = "1.0.8"
	
	// Show the Panel
	var w = buildUI(thisObj)
	if (w.toString() == "[object Panel]") {
		w
	} else {
		w.center()
		w.show()
	}

	// Build UI Pamel
	function buildUI(thisObj) {
		var windowTitle = scriptName + " " + scriptVersion
		var firstButton = "Export"
		var win = (thisObj instanceof Panel)? thisObj : new Window('palette', windowTitle, undefined, {resizeable:true})
		var myButtonGroup = win.add ("group")
			myButtonGroup.spacing = 10
			myButtonGroup.margins = 0
			myButtonGroup.orientation = "column"
			win.exportBtn = myButtonGroup.add ("button", undefined, firstButton)
			myButtonGroup.alignment = "center"
			myButtonGroup.alignChildren = "left"

		win.exportBtn.onClick = function(){
			exportJson(win)
		}
		win.message = myButtonGroup.add("statictext", [10,10,240,60], "Select target composition and push Export.    ",{multiline:true})
		win.layout.layout(true)

		return win
	}

	// Main Seq
	function exportJson(win) {
		var theComp = app.project.activeItem
		if (theComp instanceof CompItem) {
			win.message.text = "Export " + theComp.name
			var json = getJson(theComp)
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
			var projectFileName = File.decode(app.project.file.name)
		} else {
			var projectFileName = "The project file has not been saved yet."
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
			var filePath = File.decode(app.project.file.path) + "/"
		} else {
			var filePath = "~/"
		}
		var fileName = filePath + json.composition.name + ".json"
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
