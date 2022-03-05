function calculate(states, activities) {

    var calculatedActivities;
    var calculatedStates = arrStates(states);

    if(projectType == 'cpm') {
        calculatedActivities = cpmActivities(activities)
    } else if(projectType == 'pert') {
        calculatedActivities = pertActivities(activities)
    }

    findCriticalPaths(calculatedStates, calculatedActivities);

}

function arrStates(states) {
    var statesArr = [];
    for(var i = 0; i < states.length; i++) {
        statesArr.push({
            ID: states[i].ID,
            name: states[i].stateName,
            ES: -1,
            LS: -1,
            slack: -1
        })
    }
    return statesArr;
}

// {ID: '620d90f9586c99ada6ed27d4', stateName: 'Finish', projectID: '620d90f9586c99ada6ed27d1', description: ''}

function cpmActivities(activities) {
    var activitiesArr = [];
    for(var i = 0; i < activities.length; i++) {
        activitiesArr.push({
            ID: activities[i].ID,
            fromState: activities[i].fromState,
            toState: activities[i].toState,
            value: parseInt(activities[i].values[0])
        });
    }
    return activitiesArr;
}

// TIME UNIT DODELAT
function pertActivities(activities) {
    var activitiesArr = [];
    for(var i = 0; i < activities.length; i++) {
        activitiesArr.push({
            ID: activities[i].ID,
            fromState: activities[i].fromState,
            toState: activities[i].toState,
            value: parseInt(activities[i].values[0]) + 4 * parseInt(activities[i].values[1]) + parseInt(activities[i].values[2])
        });
    }
    return activitiesArr;
}

//{ID: '621a684a94efbb06ec52e1c9', activityName: 'A3', activityType: 'normal', fromState: '621a680d94efbb06ec52e1bf', toState: '621a681694efbb06ec52e1c3', …}


function getExpectedValue(optimisticValue, modalValue, pessimisticValue) {
    return (optimisticValue + 4 * modalValue + pessimisticValue);
}

function getStandardDeviation(optimisticValue, pessimisticValue) {
    return (pessimisticValue - optimisticValue);
}

function getZ(x, expectedValue, standardDeviation) {
    return (x - expectedValue) / standardDeviation;
}

function findCriticalPaths(states, activities) {

    var nextActivities, statesToCalculate;

    var currentIndex = states.findIndex(element => element.name == "Start");
    
    states[currentIndex].ES = 0;

    nextActivities = activities.filter(element => element.fromState == states[currentIndex].ID);

    // dalsi stavy
    statesToCalculate = getToStates(nextActivities);

    while(statesToCalculate.length != 0) {




    }


    console.log("Vypis dalsi stavu")
    console.log(JSON.stringify(getToStates(nextActivities, states)))
    console.log("ENDE")

}

function forwardCalculation() {

}

function backwardCalculation() {
    
}

// vyresit pokud budou dve cinnosti do jednoho stavu
function getToStates(activities, states) {
    var nextStates = [];
    for(var i = 0; i < activities.length; i++) {
        nextStates.push(states.find(element => element.ID == activities[i].toState))
    }
    return nextStates;
} 




function calculateCPM() {

}

function calculatePERT() {

}