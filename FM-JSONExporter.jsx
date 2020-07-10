// FM JSONExporter
// for Adobe After Effects 2020 (17.1.0)
// I want to use "let" and "const"...Why doesn't After Effects support these?
//
// Usage:
// 1. Copy FM-JSONExporter.jsx to ScriptUI Panels
// 2. After Effects > Window > FM-JSONExporter.jsx
// 3. Push Export button
//
// https://www.sync.dev / info@sync.dev
//


var scriptName = "FM JSONExporter"
var scriptVersion = "1.0.3"
var comp = app.project.activeItem
var keyCount = comp.markerProperty.numKeys
var today = new Date()
var startTime = comp.displayStartTime
var startTimecode = timeToCurrentFormat(startTime, comp.frameRate)
var trt = timeToCurrentFormat(comp.duration, comp.frameRate)
var json = {
	"date": today.toLocaleString(),
	"env": {
		"author": system.userName,
		"host": system.machineName,
		"os": $.os,
		"projectFile": app.project.file.name,
		"appVersion": "Adobe After Effects " + app.version,
		"appEncoding": $.appEncoding,
		"scriptVersion": scriptVersion
	},
	"comp": {
		"name": comp.name,
		"width": comp.width,
		"height": comp.height,
		"timecodeBase": comp.frameRate,
		"drop": comp.dropFrame,
		"startTimecode": startTimecode,
		"trt": trt

	},
	"keyFrames": [{
	}]
}

function showDialog() {
	var w = new Window("window", scriptName + " v" + scriptVersion, [0, 0, 200, 50],{resizeable:true});
	var exportBtn = w.add("button",[20,10,180,40],"Export")
	w.center()
	var array = setArray()
	exportBtn.onClick = function() { fileSave(array) }
	return w
}

function setArray() {
	for (var i=0; i<keyCount; i++) {
		var sec = Math.round(comp.markerProperty.keyTime(i + 1) * 1000) / 1000
		var tc = timeToCurrentFormat(sec + startTime, comp.frameRate)
		var comment = comp.markerProperty.keyValue(i + 1).comment
		var duration = comp.markerProperty.keyValue(i + 1).duration
		var obj = {
			"second": sec,
			"timecode": tc,
			"comment": comment,
		}
		json.keyFrames[i] = obj
	}
	return json
}

function fileSave(json) {
	var fileName = json.compName + ".json"
	var fileObject = new File(fileName)
	var outputObject = fileObject.saveDlg("Save the json file.", "*.json")
	var text = JSON.stringify(json, null , "\t")

	if (outputObject != null) {
		outputObject.open("w","TEXT","????")
		outputObject.writeln(text)
		outputObject.close()
		outputObject.execute()
	}
}

var sd = new showDialog()
sd.show()
