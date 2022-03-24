var _statesData, _activitiesData, projectType, _translationsData;
var statesArray = [];
var activitiesArray = [];
var myDiagram;
var selectedStates = [];
var graphSettingsData = [];


function init(states, activities, projectT, translations, graphSettings) {
    _statesData = states;
    _activitiesData = activities;
    projectType = projectT;
    _translationsData = translations;
    /**
     * Překlad
     * translationsData
     * [0] -- Add Activity (EN), Přidat činnost (CZ)
     * [1] -- Add State (EN), Přidat stav (CZ)
     * [2] -- Edit (EN), Upravit (CZ)
     * [3] -- Delete (EN), Smazat (CZ)
     * [4] -- Slack (EN), Časová rezerva (CZ)
     * [5] -- State Name (EN), Název stavu (CZ)
     * [6] -- Earliest Start Time (EN), Nejdříve možný začátek činnosti (CZ)
     * [7] -- Latest Start Time (EN), Nejpozději přípustný začátek činnosti (CZ)
     * [8] -- Help, Nápověda
     * [9] -- Name, Název
     * [10]-- Type, Typ
     * [11]-- Normal, Normální
     * [12]-- Dummy, Fiktivní
     * [13]-- Values, Hodnoty
     * [14]-- Length, Délka
     * [15]-- Time Unit, Jednotka času
     * [16]-- Seconds, Sekundy
     * [17]-- Minutes, Minuty
     * [18]-- Hours, Hodiny
     * [19]-- Days, Dny
     * [20]-- Weeks, Týdny
     * [21]-- Months, Měsíce
     */
    if (graphSettings) {
        graphSettingsData = graphSettings.replace(/&quot;/g, '"');
        graphSettingsData = JSON.parse(graphSettingsData);
    }
    graphInit(graphSettingsData);
    document.getElementById("exportButton").addEventListener("click", exportDiagram);
}

function graphInit(graphSettingsData) {
    //init grafu
    var $ = go.GraphObject.make;
    var edgeFill, nodeFill;
    var pink = "#B71C1C";
    var pinkFill = "#F8BBD0";
    var grayFill = "#D3D3D3";
    // nastaveni barev
    if (graphSettingsData.length == 0) {
        nodeFill = "#B3E5FC";
        edgeFill = "#0288D1";
    } else {
        nodeFill = graphSettingsData[0];
        edgeFill = graphSettingsData[1];
    }
    myDiagram =
        $(go.Diagram, "myDiagramDiv", {
            initialAutoScale: go.Diagram.Uniform,
            layout: $(go.LayeredDigraphLayout, {layerSpacing: 200}),
        });
    // node Template
    myDiagram.nodeTemplate =
        $(go.Node, "Auto",
            $(go.Shape, "Rectangle", // the border
                { fill: "white", strokeWidth: 2 },
                new go.Binding("fill", "critical", function(b) { return (b ? pinkFill : nodeFill); }),
                new go.Binding("stroke", "critical", function(b) { return (b ? pink : "#0288D1"); })),
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
                $(go.TextBlock, _translationsData[8]), {
                    click:
                    // napoveda
                        displayHelp

                }))

    // link (activities) colors
    var linkColors = { "R": pink, "N": edgeFill };

    // link Template
    myDiagram.linkTemplate =
        $(ParallelRouteLink, { toShortLength: 6, toEndSegmentLength: 20 },
            $(go.Shape, { strokeWidth: 4 },
                new go.Binding("stroke", "color", function(c) { return linkColors[c] || "blue"; }),
                new go.Binding("strokeDashArray", "dash")),
            $(go.TextBlock, { segmentOffset: new go.Point(0, -7), segmentOrientation: go.Link.OrientUpright },
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
            }, {
                toolTip: $("ToolTip",
                    $(go.TextBlock, { margin: 10 },
                        new go.Binding("text", "tooltip")))
            }
        );

    // nacteni stavu do nodeArray pro graf
    statesArray = getNodeDataArray(_statesData);

    // nacteni aktivit do linkArray pro graf
    activitiesArray = getLinkDataArray(_activitiesData);

    // pridani stavu (vrcholu) a aktivit (hran) do modelu grafu
    myDiagram.model = new go.GraphLinksModel(statesArray, activitiesArray);

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

function displayHelp() {
    // display help modal
    $('#helpModal').modal('show');
}

function getNodeDataArray(states) {
    //dodelat
    var nodeDataArray = [];
    var statesData = states.states;
    var currentNode, criticalState;
    var resArr = JSON.parse(sessionStorage.getItem("resultArr"));
    var currentProject = sessionStorage.getItem("currentProject");
    var calculatedProject = sessionStorage.getItem("calculatedProject");
    if (resArr && currentProject == calculatedProject) {
        for (var i = 0; i < statesData.length; i++) {
            currentNode = resArr.find(element => element.ID == statesData[i].ID);
            if (currentNode.slack == 0) {
                criticalState = true;
            } else {
                criticalState = false;
            }
            nodeDataArray.push({
                "key": statesData[i].ID,
                "text": statesData[i].stateName,
                critical: criticalState,
                earliestStart: currentNode.ES + "/6",
                latestStart: currentNode.LS + "/6",
                slack: currentNode.slack
            })
        }
    } else {
        for (var i = 0; i < statesData.length; i++) {
            nodeDataArray.push({ "key": statesData[i].ID, "text": statesData[i].stateName, critical: false });
        }
    }
    return nodeDataArray;
}

// PARSE aktivit
function getLinkDataArray(activities) {
    // dodelat
    var linkDataArray = [];
    var activitiesData = activities.activities;
    var nodeColor;
    var currentProject = sessionStorage.getItem("currentProject");
    var calculatedProject = sessionStorage.getItem("calculatedProject");

    var resActivities = JSON.parse(sessionStorage.getItem("activities"))
    if (resActivities && currentProject == calculatedProject) {
        activitiesData = resActivities;
    }

    for (var i = 0; i < activitiesData.length; i++) {
        if (activitiesData[i].critical) {
            nodeColor = "R"
        } else {
            nodeColor = "N"
        }

        if (activitiesData[i].activityType == "normal") {
            // parseLinkTextData(activitiesData[i].values)
            linkDataArray.push({
                "id": activitiesData[i].ID,
                "from": activitiesData[i].fromState,
                "to": activitiesData[i].toState,
                "text": parseLinkTextData(activitiesData[i].values),
                "color": nodeColor,
                "tooltip": parseLinkTextTooltip(activitiesData[i].activityName, activitiesData[i].activityType, activitiesData[i].values, activitiesData[i].timeUnit, "B")
            })
        } else if (activitiesData[i].activityType == "dummy") {
            linkDataArray.push({
                "id": activitiesData[i].ID,
                "from": activitiesData[i].fromState,
                "to": activitiesData[i].toState,
                "text": parseLinkTextData(activitiesData[i].values),
                "dash": [3, 4],
                "color": nodeColor,
                "tooltip": parseLinkTextTooltip(activitiesData[i].activityName, activitiesData[i].activityType, activitiesData[i].values, activitiesData[i].timeUnit, "B")
            })
        }
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
function parseLinkTextTooltip(activityName, activityType, valuesArr, timeUnit, linkColor) {
    var result = _translationsData[9] + ": " + activityName + "\n" + _translationsData[10] + ": ";
    if(activityType == "normal") {
        result += _translationsData[11] + "\n" + _translationsData[13] + "\n";
    } else {
        result += result + _translationsData[12] + "\n" + _translationsData[13] + "\n";
    }
    if (projectType == "cpm") {
        // idk jestli dát length nebo y podle teorie - uvidíme
        result += _translationsData[14] + ": " + valuesArr[0] + "\n" + _translationsData[15] + ": ";
    } else {
        result += "a: " + valuesArr[0] + "\n" + "m: " + valuesArr[1] + "\n" + "b: " + valuesArr[2] + "\n" + _translationsData[15]+ ": ";
    }
    // switch for timeUnit
    switch (timeUnit) {
        case "seconds":
            result += _translationsData[16];
            break;
        case "minutes":
            result += _translationsData[17];
            break;
        case "hours":
            result += _translationsData[18];
            break;
        case "days":
            result += _translationsData[19];
            break;
        case "weeks":
            result += _translationsData[20];
            break;
        case "months":
            result += _translationsData[21];
            break;
    } 

    // Dodelat s preklady a jestli je critical nebo ne
    return result;
}

function editState(e, obj) {
    var selectedNode = obj.part;
    var nodeData = selectedNode.data;

    document.getElementById('editStateForm').setAttribute('name', nodeData.key);

    var states = _statesData.states;
    var item = states.find(element => element.ID == nodeData.key);

    document.getElementById("editStateName").value = item.stateName;
    document.getElementById("editStateInfo").value = item.description;

    if (item.stateName == "Start" || item.stateName == "Finish") {
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
    var activity = activities.find(element => element.ID == linkData.id);
    var activityValues = activity.values;


    document.getElementById('editActivityForm').setAttribute('name', activity.ID);
    document.getElementById('editedActivityName').value = activity.activityName;
    document.getElementById('editedActivityType').value = activity.activityType;
    document.getElementById('editedActivityDescription').value = activity.description;

    if (activityValues.length == 1) {
        document.getElementById('editedActivityLength').value = activityValues[0];
    } else if (activityValues.length == 3) {
        document.getElementById('editedActivityOptimistic').value = activityValues[0];
        document.getElementById('editedActivityMost').value = activityValues[1];
        document.getElementById('editedActivityPessimistic').value = activityValues[2];
    }

    if (activity.activityType == "dummy" && activityValues.length == 1) {
        $('#editedActivityLength').attr('disabled', 'disabled');
    } else if (activity.activityType == "dummy" && activityValues.length == 3) {
        $('#editedActivityOptimistic').attr('disabled', 'disabled');
        $('#editedActivityMost').attr('disabled', 'disabled');
        $('#editedActivityPessimistic').attr('disabled', 'disabled');
    }

    document.getElementById('editedTimeUnit').value = activity.timeUnit;


    $('#editActivityModal').modal('show');
    // asi hotovo
}

function deleteActivity(e, obj) {
    var selectedLink = obj.part;
    var linkData = selectedLink.data;
    var activities = _activitiesData.activities;
    var activity = activities.find(element => element.ID == linkData.id);
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
    reload();
}


// projectID ?
function editSelectedState(stateID, projectID, stateName, stateInfo) {
    var foundIndex = _statesData.states.findIndex(element => element.ID == stateID);
    _statesData.states[foundIndex].stateName = stateName;
    _statesData.states[foundIndex].description = stateInfo
    reload();
}

function deleteSelectedState(stateID) {

    var foundIndex = _statesData.states.findIndex(element => element.ID == stateID);

    if (foundIndex > -1) {
        var activitiesTo = _activitiesData.activities.filter(element => element.toState == _statesData.states[foundIndex].ID);
        var activitiesFrom = _activitiesData.activities.filter(element => element.fromState == _statesData.states[foundIndex].ID);
        var activitiesToDelete = activitiesTo.concat(activitiesFrom);

        _statesData.states.splice(foundIndex, 1);

        for (var i = 0; i < activitiesToDelete.length; i++) {
            foundIndex = _activitiesData.activities.findIndex(element => element.ID == activitiesToDelete[i].ID);
            _activitiesData.activities.splice(foundIndex, 1);
        }

        reload();
    }

    // smazat activity napojene na stavy
}

function editSelectedActivity(activityID, activityName, activityType, activityDescription, timeUnit, activityValues) {
    var foundIndex = _activitiesData.activities.findIndex(element => element.ID == activityID);

    console.log("Editovana time unit")
    console.log(timeUnit)
    console.log("ende")


    _activitiesData.activities[foundIndex].activityName = activityName;
    _activitiesData.activities[foundIndex].activityType = activityType;
    _activitiesData.activities[foundIndex].description = activityDescription;
    _activitiesData.activities[foundIndex].timeUnit = timeUnit;
    _activitiesData.activities[foundIndex].values = activityValues;
    reload();
}

function deleteSelectedActivity(activityID) {
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
        "timeUnit": activity.timeUnit,
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