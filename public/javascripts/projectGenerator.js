// Generator skript
//
//
//
//
function generateProject(statesCount) {
    var dataJSON = {};
    // generovani stavu
    const states = generateStates(statesCount);

    var activities = [];

    //TODO PATEK

    dataJSON.states = states;
    console.log("DATA JSON")
    console.log(dataJSON)
    console.log("ENDE")
    return dataJSON;
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
function generateActivities(count) {
    //name
    //type
    //fromState
    //toStates
    //values
    var activities = [];
    for(var i = 0; i < count; i++) {
        activities.push({
            "name": "A" + (i+1),
            "type": "normal"
        });
    }
    return activities;
}