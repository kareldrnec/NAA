function calculate(states, activities) {

    var calculatedActivities;
    var calculatedStates = arrStates(states);

    if (projectType == 'cpm') {
        calculatedActivities = cpmActivities(activities)
    } else if (projectType == 'pert') {
        calculatedActivities = pertActivities(activities)
    }

    findCriticalPaths(calculatedStates, calculatedActivities);

}

function arrStates(states) {
    var statesArr = [];
    for (var i = 0; i < states.length; i++) {
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
    for (var i = 0; i < activities.length; i++) {
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
    for (var i = 0; i < activities.length; i++) {
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

    states = forwardCalculation(states, activities);

    // backwardCalculation(states, activities)

    console.log("Vypis")
    for (var i = 0; i < states.length; i++) {
        console.log(states[i])
    }
    console.log("end")
}

function forwardCalculation(states, activities) {
    var states = states;
    var statesToCalculate = [];
    var nextActivities;


    var index = states.findIndex(element => element.name == "Start");

    states[index].ES = 0;

    nextActivities = activities.filter(element => element.fromState == states[index].ID);

    statesToCalculate = getToStates(nextActivities, states);

    while (statesToCalculate.length != 0) {
        for (var i = 0; i < statesToCalculate.length; i++) {
            var tempActivities = activities.filter(element => element.toState == statesToCalculate[i].ID);
            console.log("Aktivity")
            console.log(JSON.stringify(tempActivities))
            console.log("ende")

        }

        statesToCalculate = [];
    }

    return states;
}

function backwardCalculation(states, activities) {
    var states = states;

    return states;
}

// vyresit pokud budou dve cinnosti do jednoho stavu
function getToStates(activities, states) {
    var nextStates = [];
    for (var i = 0; i < activities.length; i++) {
        nextStates.push(states.find(element => element.ID == activities[i].toState))
    }
    return nextStates;
}




function calculateCPM() {

}

function calculatePERT() {

}