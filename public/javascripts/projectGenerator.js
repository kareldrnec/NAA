// Generator skript
//


function generateProject(statesCount, analysisType, min, max) {
    var dataJSON = {};
    
    const states = generateStates(statesCount);
    const layers = getStatesParts(states);
    var activities = createActivities(layers, analysisType, min, max);

    dataJSON.states = states;
    dataJSON.activities = activities;

    console.log("VYSLEDNY SOUBOR")
    console.log(dataJSON)
    console.log("ENDE")

    return dataJSON;
}

function getStatesParts(states) {
    var layers = [];
    var numberOfStates = states.length - 2;
    var currentLayer;
    var tmp = [];
    var idx = 1;
    layers.push([states[0]]);
    while(numberOfStates != 0) {
        if(numberOfStates > 7) {
            currentLayer = Math.floor(Math.random() * 7) + 1;
        } else {
            currentLayer = Math.floor(Math.random() * (numberOfStates - 1)) + 1;
        }
        for (var i = 0; i < currentLayer; i++) {
            tmp.push(states[idx])
            idx++;
        }
        layers.push(tmp);
        tmp = [];
        numberOfStates -= currentLayer;
    }
    layers.push([states[idx]]);
    return layers;
}


function createActivities(layers, analysisType, min, max) {
    var activities = [];
    var currentLayer, nextLayer, tmpActivities;
    var idx = 0;
    for (var i = 0; i < layers.length - 1; i++) {
        currentLayer = layers[i];
        nextLayer = layers[i + 1];
        tmpActivities = connectLayers(idx, currentLayer, nextLayer, analysisType, min, max);
        console.log("TMPACTIVITIES")
        console.log(tmpActivities)
        console.log("ENDE")
        activities = activities.concat(tmpActivities);
        idx += tmpActivities.length;
    }
    console.log(activities)
    return activities;
}

function connectLayers(idx, currentLayer, nextLayer, analysisType, minimal, maximal) {
    var index = idx;
    var activities = [];
    var min = Math.min(currentLayer.length, nextLayer.length);
    var random;
    if (currentLayer.length == min) {
        for (var j = 0; j < currentLayer.length; j++) {
            activities.push(generateActivity(index, analysisType, currentLayer[j].name, nextLayer[j].name, minimal, maximal));
            index++;
        }
        for (var j = currentLayer.length; j < nextLayer.length; j++) {
            random = Math.floor(Math.random() * currentLayer.length);
            activities.push(generateActivity(index, analysisType, currentLayer[random].name, nextLayer[j].name, minimal, maximal));
            index++;
        }
    } else {
        for (var j = 0; j < nextLayer.length; j++) {
            activities.push(generateActivity(index, analysisType, currentLayer[j].name, nextLayer[j].name, minimal, maximal));
            index++;
        }
        for (var j = nextLayer.length; j < currentLayer.length; j++) {
            random = Math.floor(Math.random() * nextLayer.length);
            activities.push(generateActivity(index, analysisType, currentLayer[j].name, nextLayer[random].name, minimal, maximal));
            index++;
        }
    }
    return activities;
}

// generate activities
function generateActivity(idx, analysisType, fromState, toState, min, max) {
    return {
        "name": "A" + (idx+1),
        "type": "normal",
        "values": generateValuesForActivity(analysisType, min, max),
        "timeUnit": "hours",
        "fromState": fromState,
        "toState": toState
    };
}

// generate Start, Finish and (count - 2) other states
function generateStates(count) {
    var states = [];
    states.push({"name": "Start"});
    for(var i = 0; i < count - 2; i++) {
        states.push({"name": "S" + (i+1)});
    }
    states.push({"name": "Finish"});
    return states;
}

// generate values for activities
function generateValuesForActivity(analysisType, min, max) {
    // TODO 
    var values = [];
    if (analysisType == "cpm") {
        values.push(generateValue(min, max).toString());
    } else {
        var a, m, b;
        a = generateValue(min, max);
        m = generateValue(a, max);
        b = generateValue(m, max);
        values.push(a.toString(), m.toString(), b.toString());
    }
    return values;
}

function generateValue(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}