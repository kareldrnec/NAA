var _statesData, _activitiesData, projectType;


function init(states, activities, projectT) {
    _statesData = states.replace(/&quot;/g, '"');
    _statesData = JSON.parse(_statesData);
    _activitiesData = activities.replace(/&quot;/g, '"');
    _activitiesData = JSON.parse(_activitiesData);
    projectType = projectT;
    graphInit();
}

function graphInit() {

    //init grafu
    var $ = go.GraphObject.make;

    // nastaveni barev
    var blue = "#0288D1";
    var pink = "#B71C1C";
    var pinkfill = "#F8BBD0";
    var bluefill = "#B3E5FC";

    myDiagram =
        $(go.Diagram, "myDiagramDiv", {
            initialAutoScale: go.Diagram.Uniform,
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
                        $(go.TextBlock, "Add Activity"), { click: addSuccessor }),
                    $("ContextMenuButton",
                        $(go.TextBlock, "Add State"), { click: addState }),
                    $("ContextMenuButton",
                        $(go.TextBlock, "Edit"), { click: editState }),
                    $("ContextMenuButton",
                        $(go.TextBlock, "Delete"), { click: deleteState })
                )
            }
            // dodelat contextmenu pro stavy
        ); // end Node


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
                        $(go.TextBlock, "Edit Activity"), { click: editActivity }
                    ),
                    $("ContextMenuButton",
                        $(go.TextBlock, "Delete Activity"), { click: deleteActivity })
                )
            }
        );

    // nacteni stavu do nodeArray pro graf
    var statesArray = getNodeDataArray(_statesData);

    // nacteni aktivit do linkArray pro graf
    var activitiesArray = getLinkDataArray(_activitiesData);

    myDiagram.commandHandler.deleteSelection = function() { window.location.href = "/states/delete/" + myDiagram.selection.iterator.first().key; }
    myDiagram.commandHandler.copySelection = function() {}
    myDiagram.commandHandler.selectAll = function() {}

    // pridani stavu (vrcholu) a aktivit (hran) do modelu grafu
    myDiagram.model = new go.GraphLinksModel(statesArray, activitiesArray);
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

function getLinkDataArray(activities) {
    // dodelat
    var linkDataArray = [];
    var activitiesData = activities.activities;
    for (var i = 0; i < activitiesData.length; i++) {
        linkDataArray.push({
            "from": activitiesData[i].fromState,
            "to": activitiesData[i].toState
        })
    }
    return linkDataArray;
}

function addSuccessor() {

}

function addState(e, obj) {
    var selectedNode = obj.part;
    var nodeData = selectedNode.data;
    window.location.href = "/states/add/" + nodeData.key;
}

function editActivity(e, obj) {
    var selectedLink = obj.part;
    var linkData = selectedLink.data;
    console.log(linkData.from)
    console.log(linkData.to)
        //  window.location.href = "/activities/edit/" + linkData.key;
}

function editState(e, obj) {
    var selectedNode = obj.part;
    var nodeData = selectedNode.data;
    window.location.href = "/states/edit/" + nodeData.key;
}

function deleteActivity(e, obj) {
    var selectedLink = obj.part;
    var linkData = selectedLink.data;
    window.location.href = "/activities/delete/" + linkData.key;
}

function deleteState(e, obj) {
    var selectedNode = obj.part;
    var nodeData = selectedNode.data;
    window.location.href = "/states/delete/" + nodeData.key;
    //Dodelat
}