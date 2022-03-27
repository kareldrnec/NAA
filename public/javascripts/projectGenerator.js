// Generator skript
//
//
//
//
function generateProject(statesCount, analysisType) {
    var dataJSON = {};
    // generovani stavu
    const states = generateStates(statesCount);

    //var activities = generateActivities(activitiesCount, analysisType);

    //TODO PATEK

    dataJSON.states = states;
    //dataJSON.activities = activities;

    console.log("DATA")
    console.log(dataJSON)
    console.log("ENDE")


    return dataJSON;
}

function getStatesParts(states) {
    var layers = [];
    var numberOfStates = states.length - 2;
    var currentLayer;
    layers.push(1);
    while(numberOfStates != 0) {
        if(numberOfStates > 7) {
            currentLayer = Math.floor(Math.random() * 7) + 1;
        } else {
            currentLayer = Math.floor(Math.random() * (numberOfStates - 1)) + 1;
        }
        layers.push(currentLayer);
        numberOfStates -= currentLayer;
    }
    layers.push(1);
    return layers;
}



// generate Start, Finish and (count - 2) other states
function generateStates(count) {
    var states = [];
    states.push({"name": "Start"});
    states.push({"name": "Finish"});
    for(var i = 0; i < count - 2; i++) {
        states.push({"name": "S" + (i+1)});
    }
    return states;
}

// generate activities
function generateActivities(count, analysisType) {
    var activities = [];
    const max = 100;
    for(var i = 0; i < count; i++) {
        activities.push({
            "name": "A" + (i+1),
            "type": "normal",
            "values": generateValues(analysisType, max),
            "timeUnit": "hours",
            "fromState": "",
            "toState": ""
        });
    }
    return activities;
}

// generate values for activities
function generateValues(analysisType, max) {
    var values = [];
    if (analysisType == "cpm") {
        values.push((Math.floor(Math.random() * max) + 1).toString());
    } else {
        var a, m, b;
        a = Math.floor(Math.random() * max) + 1;
        m = a + (Math.floor(Math.random() * 10) + 1);
        b = m + (Math.floor(Math.random() * 10) + 1);
        values.push(a.toString(), m.toString(), b.toString());
    }
    return values;
}