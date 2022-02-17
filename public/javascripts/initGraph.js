var _statesData, _activitiesData, projectType, _translationsData;
var statesArray = [];
var activitiesArray = [];
var myDiagram;
var selectedStates = [];


function init(states, activities, projectT, translations) {
    _statesData = states.replace(/&quot;/g, '"');
    _statesData = JSON.parse(_statesData);
    
    _activitiesData = activities.replace(/&quot;/g, '"');
    _activitiesData = JSON.parse(_activitiesData);
    
    projectType = projectT;

    _translationsData = translations.replace(/&quot;/g, '"');
    _translationsData = JSON.parse(_translationsData);

    /**
     * Překlad
     * translationsData
     * [0] -- Add Activity (EN), Přidat aktivitu (CZ)
     * [1] -- Add State (EN), Přidat stav (CZ)
     * [2] -- Edit (EN), Upravit (CZ)
     * [3] -- Delete (EN), Smazat (CZ)
     * [4] -- Slack (EN), Časová rezerva (CZ)
     * [5] -- State Name (EN), Název stavu (CZ)
     * [6] -- Earliest Start Time (EN), Nejdříve možný začátek činnosti (CZ)
     * [7] -- Latest Start Time (EN), Nejpozději přípustný začátek činnosti (CZ)
     */

    graphInit();

    document.getElementById("exportButton").addEventListener("click", exportDiagram);
}

function graphInit() {

    //init grafu
    var $ = go.GraphObject.make;

    // nastaveni barev
    var blue = "#0288D1";
    var pink = "#B71C1C";
    var pinkfill = "#F8BBD0";
    var bluefill = "#B3E5FC";
    var grayFill = "#D3D3D3";

    myDiagram =
        $(go.Diagram, "myDiagramDiv", {
            //initialAutoScale: go.Diagram.Uniform,
            layout: $(go.LayeredDigraphLayout)
        });

    // node Template
    myDiagram.nodeTemplate =
        $(go.Node, "Auto",
            $(go.Shape, "Rectangle", // the border
                { fill: "white", strokeWidth: 2 },
                new go.Binding("fill", "critical", function(b) { return (b ? pinkfill : bluefill); }),
                new go.Binding("stroke", "critical", function(b) { return (b ? pink : blue); })),
            $(go.Panel, "Table", { padding: 0.5 },
                $(go.RowColumnDefinition, { column: 1, separatorStroke: "black" }),
                $(go.RowColumnDefinition, { column: 2, separatorStroke: "black" }),
                $(go.RowColumnDefinition, { row: 1, separatorStroke: "black", background: "white", coversSeparators: true }),
                $(go.RowColumnDefinition, { row: 2, separatorStroke: "black" }),
                $(go.TextBlock, // earlyStart
                    new go.Binding("text", "earliestStart"), { row: 0, column: 0, margin: 5, textAlign: "center" }),
                $(go.TextBlock,
                    new go.Binding("text", "length"), { row: 0, column: 1, margin: 5, textAlign: "center" }),
                $(go.TextBlock, // earlyFinish
                    new go.Binding("text", "latestStart"), { row: 0, column: 2, margin: 5, textAlign: "center" }),
                $(go.TextBlock,
                    new go.Binding("text", "text"), {
                        row: 1,
                        column: 0,
                        columnSpan: 3,
                        margin: 5,
                        textAlign: "center",
                        font: "bold 14px sans-serif"
                    }),
                $(go.TextBlock, // lateStart
                    new go.Binding("text", "lateStart"), { row: 2, column: 0, margin: 5, textAlign: "center" }),
                $(go.TextBlock, // slack
                    new go.Binding("text", "slack"), { row: 2, column: 1, margin: 5, textAlign: "center" }),
                $(go.TextBlock, // lateFinish
                    new go.Binding("text", "lateFinish"), { row: 2, column: 2, margin: 5, textAlign: "center" }),
            ), {
                contextMenu: $(go.Adornment, "Vertical",
                    $("ContextMenuButton",
                        $(go.TextBlock, _translationsData[0]), { click: addActivity }),
                        // Add Activity
                    $("ContextMenuButton",
                        $(go.TextBlock, _translationsData[1]), {
                            click: function() {
                                jQuery('#addStateModal').modal('show');
                            }
                        }),
                    $("ContextMenuButton",
                        $(go.TextBlock, _translationsData[2]), { click: editState }),
                    $("ContextMenuButton",
                        $(go.TextBlock, _translationsData[3], { click: deleteState },
                            //new go.Binding("text", "Delete"),
                            new go.Binding("visible", "text", function(textValue) {
                                if (textValue == "Start" || textValue == "Finish") {
                                    return false;
                                }
                                return true;
                            }),
                        )
                    )
                )
            }
        ); // end Node

    myDiagram.contextMenu =
        $(go.Adornment, "Vertical",
            $("ContextMenuButton",
                $(go.TextBlock, _translationsData[1]), {
                    click: function() {
                        jQuery('#addStateModal').modal('show');
                    }
                }))

    // link (activities) colors
    var linkColors = { "R": pink, "B": blue };

    // link Template
    myDiagram.linkTemplate =
        $(go.Link, { toShortLength: 6, toEndSegmentLength: 20 },
            $(go.Shape, { strokeWidth: 4 },
                new go.Binding("stroke", "color", function(c) { return linkColors[c] || "blue"; }),
                new go.Binding("strokeDashArray", "dash")),
            $(go.TextBlock, { segmentOffset: new go.Point(0, -25) },
                new go.Binding("text", "text")),
            $(go.Shape, // arrowhead
                { toArrow: "Triangle", stroke: null, scale: 1.5 },
                new go.Binding("fill", "color", function(c) { return linkColors[c] || "blue"; })), {
                contextMenu: $(go.Adornment, "Vertical",
                    $("ContextMenuButton",
                        $(go.TextBlock, _translationsData[2]), { click: editActivity }
                    ),
                    $("ContextMenuButton",
                        $(go.TextBlock, _translationsData[3]), { click: deleteActivity })
                )
            }
        );

    // nacteni stavu do nodeArray pro graf
    statesArray = getNodeDataArray(_statesData);

    // nacteni aktivit do linkArray pro graf
    activitiesArray = getLinkDataArray(_activitiesData);

    // pridani stavu (vrcholu) a aktivit (hran) do modelu grafu
    myDiagram.model = new go.GraphLinksModel(statesArray, activitiesArray);

    myDiagram.add(
		$(go.Node, "Auto",
			$(go.Shape, "Rectangle",  // the border
				{ fill: grayFill }),
			$(go.Panel, "Table",
				$(go.RowColumnDefinition, { column: 1, separatorStroke: "black" }),
				$(go.RowColumnDefinition, { column: 2, separatorStroke: "black" }),
				$(go.RowColumnDefinition, { row: 1, separatorStroke: "black", background: grayFill, coversSeparators: true }),
				$(go.RowColumnDefinition, { row: 2, separatorStroke: "black" }),
				$(go.TextBlock, _translationsData[6],
					{ row: 0, column: 0, margin: 5, textAlign: "center" }),
				$(go.TextBlock, "",
					{ row: 0, column: 1, margin: 5, textAlign: "center" }),
				$(go.TextBlock, _translationsData[7],
					{ row: 0, column: 2, margin: 5, textAlign: "center" }),

				$(go.TextBlock, _translationsData[5],
					{
						row: 1, column: 0, columnSpan: 3, margin: 5,
						textAlign: "center", font: "bold 14px sans-serif"
					}),

				$(go.TextBlock, "",
					{ row: 2, column: 0, margin: 5, textAlign: "center" }),
				$(go.TextBlock, _translationsData[4],
					{ row: 2, column: 1, margin: 5, textAlign: "center" }),
				$(go.TextBlock, "",
					{ row: 2, column: 2, margin: 5, textAlign: "center" })
			)
		)
	);




    myDiagram.commandHandler.doKeyDown = function() {
        var e = myDiagram.lastInput;
        if (e.key == "Del") {
            const object = myDiagram.selection.first();
            //tb
            //TODO
            console.log(e.key)
            console.log(e)
            console.log(object)
        }
    }
}

function getNodeDataArray(states) {
    //dodelat
    var nodeDataArray = [];
    var statesData = states.states;
    // var criticalState, earliestStartTime, latestStartTime, slackText;
    for (var i = 0; i < statesData.length; i++) {
        nodeDataArray.push({ "key": statesData[i].ID, "text": statesData[i].stateName, critical: false });
    }
    return nodeDataArray;
}

// PARSE aktivit
function getLinkDataArray(activities) {
    // dodelat
    var linkDataArray = [];
    var activitiesData = activities.activities;


    for (var i = 0; i < activitiesData.length; i++) {
        linkDataArray.push({
            "from": activitiesData[i].fromState,
            "to": activitiesData[i].toState,
            "text": parseLinkTextData(activitiesData[i].values),
            "color": "B"
        })
    }
    return linkDataArray;
}

function parseLinkTextData(valuesArr) {
    var result = "";


    if (valuesArr.length == 1) {
        result = result + " (" + valuesArr[0] + ") ";
    } else {
        result = result + " (" + valuesArr[0] + "," + valuesArr[1] + "," + valuesArr[2] + ") ";
    }
    return result;
}

// TODO TOOLTIP PRO AKTIVITY
function parseLinkTextTooltip(activityName, valuesArr, timeUnit, linkColor) {

}

function editState(e, obj) {
    var selectedNode = obj.part;
    var nodeData = selectedNode.data;

    document.getElementById('editStateForm').setAttribute('name', nodeData.key);
    
    var states = _statesData.states;
    var item = states.find(element => element.ID == nodeData.key);

    document.getElementById("editStateName").value = item.stateName;
    document.getElementById("editStateInfo").value = item.description;

    if(item.stateName == "Start" || item.stateName == "Finish") {
        document.getElementById("editStateName").readOnly = true;
    } else {
        document.getElementById("editStateName").readOnly = false;
    }

    $('#editStateModal').modal('show');
}

function deleteState(e, obj) {
    var selectedNode = obj.part;
    var nodeData = selectedNode.data;
    document.getElementById('deleteStateForm').setAttribute('name', nodeData.key);
    $('#deleteStateModal').modal('show');
}

//
//
//
//
//
// TODO
function addActivity(e, obj) {
    var selectedNode = obj.part;

    selectedStates.push(selectedNode.data)

    if (selectedStates.length == 2) {

        // TODO jestli mohu takhle spojit

        $('#addActivityForm').attr('action', selectedStates[0].key + "&" + selectedStates[1].key);
        selectedStates = [];
        $('#addActivityModal').modal('show');
    }


    /**
     * var data = e.diagram.selection.toArray();
        if (data.length == 2) {
        var first_state = data[0].data;
        var second_state = data[1].data;
        console.log(first_state)
        console.log(second_state)
        $('#addActivityModal').modal('show');
    }
     */

}

function editActivity(e, obj) {
    // TO DO
    var selectedLink = obj.part;
    var linkData = selectedLink.data;

    var activities = _activitiesData.activities;
    var activity = activities.find(element => element.fromState == linkData.from && element.toState == linkData.to);
    console.log(activity)
}

function deleteActivity(e, obj) {
    var selectedLink = obj.part;
    var linkData = selectedLink.data;

    var activities = _activitiesData.activities;
    var activity = activities.find(element => element.fromState == linkData.from && element.toState == linkData.to);
    console.log("Nalezena aktivita")

    console.log(activity)

    console.log("ENDE")

    document.getElementById('deleteActivityForm').setAttribute('name', activity.ID)
    $('#deleteActivityModal').modal('show');
}

function addCreatedState(state) {
    // add created state to diagram
    _statesData.states.push({
        ID: state._id,
        stateName: state.stateName,
        description: state.description
    })
    console.log(_statesData)
    reload();
}

function editSelectedState(stateID, projectID, stateName, stateInfo) {
    var states = _statesData.states;
    var item = {
        stateName: stateName,
        projectID: projectID,
        ID: stateID,
        description: stateInfo
    };
    var foundIndex = states.findIndex(element => element.ID == stateID);
    states[foundIndex] = item;
    reload();
}

function deleteSelectedState(stateID) {
    var states = _statesData.states;
    var foundIndex = states.findIndex(element => element.ID == stateID);
    console.log(foundIndex)
    if (foundIndex > -1) {
        states.splice(foundIndex, 1)
        reload();
    }
    // smazat activity napojene na stavy
}


function deleteSelectedActivity(activityID){
    var activities = _activitiesData.activities;
    var foundIndex = activities.findIndex(element => element.ID == activityID);
    if (foundIndex > -1) {
        activities.splice(foundIndex, 1)
        reload();
    }
}



function addCreatedActivity(activity) {
    // add created activity to diagram
    // TO DO
    // critical ?? 
    _activitiesData.activities.push({
        "ID": activity._id,
        "activityName": activity.activityName,
        "activityType": activity.activityType,
        "fromState": activity.fromState,
        "toState": activity.toState,
        "values": activity.values,
        "description": activity.description,
        "projectID": activity.projectID
    })
    reload();
}

function reload() {
    statesArray = getNodeDataArray(_statesData);
    activitiesArray = getLinkDataArray(_activitiesData);
    myDiagram.model = new go.GraphLinksModel(statesArray, activitiesArray);
}

function exportDiagram() {
    // Export diagramu
    var blob;
    var selectedFormat = document.getElementById("typeOfFile").value;
    if (selectedFormat == "svg") {
        var svg = myDiagram.makeSvg({ scale: 1, background: "white" });
        var svgstr = new XMLSerializer().serializeToString(svg);
        blob = new Blob([svgstr], {
            type: "image/svg+xml"
        });
        downloadBlob(blob);
    } else {
        blob = myDiagram.makeImageData({
            background: "white",
            returnType: "blob",
            callback: downloadBlob
        });
    }
}

function downloadBlob(blob) {
    // Download blobu
    var filename, a;
    var url = window.URL.createObjectURL(blob);
    var selectedFormat = document.getElementById("typeOfFile").value;
    var inputName = document.getElementById("nameOfFile").value;
    if (inputName = "") {
        filename = "myDiagram." + selectedFormat;
    } else {
        filename = inputName + "." + selectedFormat;
    }
    a = document.createElement('a');
    a.style = "display: none";
    a.href = url;
    a.download = filename;
    if (window.navigator.msSaveBlob != undefined) {
        window.navigator.msSaveBlob(blob, filename);
        return;
    }
    document.body.appendChild(a);
    requestAnimationFrame(function() {
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    });
    $('#exportProjectModal').modal('toggle');
}