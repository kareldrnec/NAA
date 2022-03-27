function checkDiagram(states, activities) {
    var fromActivity, toActivity;
    var errState = "";
    for (var i = 0; i < states.length; i++) {
        if (states[i].stateName == 'Start') {
            fromActivity = activities.find(element => element.fromState == states[i].ID);
            if (!fromActivity) {
                errState = states[i].stateName;
                break;
            }
        } else if (states[i].stateName == 'Finish') {
            toActivity = activities.find(element => element.toState == states[i].ID);
            if (!toActivity) {
                errState = states[i].stateName;
                break;
            }
        } else {
            fromActivity = activities.find(element => element.fromState == states[i].ID);
            toActivity = activities.find(element => element.toState == states[i].ID);
            if (!(fromActivity && toActivity)) {
                errState = states[i].stateName;
                break;
            }
        }
    }
    return errState;
}


function calculate(states, activities, currentProject) {
    var calculatedActivities;
    var calculatedStates = arrStates(states);

    if (projectType == 'cpm') {
        calculatedActivities = cpmActivities(activities)
    } else if (projectType == 'pert') {
        calculatedActivities = pertActivities(activities)
    }

    calculatedStates = findCriticalPaths(calculatedStates, calculatedActivities);

    activities = findCriticalActivities(activities, calculatedStates, calculatedActivities);

    sessionStorage.setItem("activities", JSON.stringify(activities));
    sessionStorage.setItem("calculatedProject", currentProject);
}

function findCriticalActivities(activities, calculatedStates, calculatedActivities) {
    var fromState, toState, activity;

    for (var i = 0; i < calculatedActivities.length; i++) {
        fromState = calculatedStates.find(element => element.ID == calculatedActivities[i].fromState);
        toState = calculatedStates.find(element => element.ID == calculatedActivities[i].toState);
        if(fromState.slack == 0 && toState.slack == 0 && (toState.LS - calculatedActivities[i].value) == fromState.LS) {
            activity = activities.find(element => element.ID == calculatedActivities[i].ID);
            activity.critical = true;
        }
    }
    return activities;
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
    states = backwardCalculation(states, activities);

    // backwardCalculation(states, activities)

    console.log("Vypis")
    for (var i = 0; i < states.length; i++) {
        console.log(states[i])
    }
    console.log("end")

    sessionStorage.setItem("resultArr", JSON.stringify(states));

    return states;
}

function forwardCalculation(states, activities) {
    var statesToCalculate = [];
    var calculatedStates = [];
    var nextActivities, currentState, activitiesFromState, tempStateArray, nextStates, found;

    currentState = states.find(element => element.name == "Start");

    currentState.ES = 0;

    calculatedStates.push(currentState)

    nextActivities = activities.filter(element => element.fromState == currentState.ID);

    statesToCalculate = getToStates(nextActivities, states);

    while (statesToCalculate.length != 0) {
        tempStateArray = [];
        nextActivities = [];
        for (var i = 0; i < statesToCalculate.length; i++) {
            var tempActivities = activities.filter(item => item.toState == statesToCalculate[i].ID);
            if (predecessorStatesCheck(calculatedStates, tempActivities)) {
                currentState = {
                    ID: statesToCalculate[i].ID,
                    name: statesToCalculate[i].name,
                    ES: getMax(calculatedStates, tempActivities),
                    LS: -1,
                    slack: -1
                }
                calculatedStates.push(currentState);
                activitiesFromState = activities.filter(element => element.fromState == currentState.ID);
                nextActivities = nextActivities.concat(activitiesFromState);
            } else {
                tempStateArray.push(statesToCalculate[i])
            }
        }
        statesToCalculate = tempStateArray;
        nextStates = getToStates(nextActivities, states);
        for (var i = 0; i < nextStates.length; i++) {
            found = calculatedStates.find(element => element.ID == nextStates[i].ID);
            if (!found) {
                found = statesToCalculate.find(element => element.ID == nextStates[i].ID);
                if (!found) {
                    statesToCalculate.push(nextStates[i]);
                }
            }
        }
    }
    return calculatedStates;
}

function backwardCalculation(states, activities) {
    var activitiesToState = [];
    var nextStates;
    var statesToCalculate = [];
    var tempStateArray;
    var tempActivities
    var activitiesToCalc
    var found

    var currentState = states.find(element => element.name == "Finish");
    currentState.LS = currentState.ES;
    currentState.slack = currentState.LS - currentState.ES;

    activitiesToState = activities.filter(element => element.toState == currentState.ID);
    nextStates = getFromStates(activitiesToState, states);
    statesToCalculate = statesToCalculate.concat(nextStates);

    while (statesToCalculate.length != 0) {
        tempStateArray = [];
        activitiesToCalc = [];
        for (var i = 0; i < statesToCalculate.length; i++) {
            tempActivities = activities.filter(element => element.fromState == statesToCalculate[i].ID);
            if(successorStatesCheck(states, tempActivities)) {
                currentState = statesToCalculate[i];
                currentState.LS = getMin(states, tempActivities);
                currentState.slack = currentState.LS - currentState.ES;
                activitiesToState = activities.filter(element => element.toState == statesToCalculate[i].ID)
                activitiesToCalc = activitiesToCalc.concat(activitiesToState);
            } else {
                tempStateArray.push(statesToCalculate[i]);
            }
        }
        statesToCalculate = tempStateArray;
        nextStates = getFromStates(activitiesToState, states);

        for (var i = 0; i < nextStates.length; i++) {
            found = states.find(element => element.ID == nextStates[i].ID);
            if(found.LS == -1) {
                statesToCalculate.push(nextStates[i]);
            }
        }
    }
    return states;
}

// check predecessor
function predecessorStatesCheck(calculatedStates, activities) {
    var isCalculated = true;
    for (var i = 0; i < activities.length; i++) {
        if (calculatedStates.find(element => element.ID == activities[i].fromState) == null) {
            isCalculated = false;
            break;
        }
    }
    return isCalculated;
}

// check successor
function successorStatesCheck(calculatedStates, activities) {
    var isCalculated = true;
    var currentState;
    for (var i = 0; i < activities.length; i++) {
        currentState = calculatedStates.find(element => element.ID == activities[i].toState);
        if (currentState.LS == -1) {
            isCalculated = false;
            break;
        }
    }
    return isCalculated;
}

function getMax(calculatedStates, tempActivities) {
    var max = 0;
    var tmp = 0;
    var tmpResultState;
    for (var i = 0; i < tempActivities.length; i++) {
        tmpResultState = calculatedStates.find(element => element.ID == tempActivities[i].fromState);
        tmp = tmpResultState.ES + tempActivities[i].value;
        if (tmp > max) {
            max = tmp;
        }
    }
    return max;
}

function getMin(calculatedStates, tempActivities) {
    var tmp;
    var tmpResultState;
    var min
    for (var i = 0; i < tempActivities.length; i++) {
        tmpResultState = calculatedStates.find(element => element.ID == tempActivities[i].toState);
        tmp = tmpResultState.LS - tempActivities[i].value;
        if (min == null) {
            min = tmp;
        } else {
            if (tmp < min) {
                min = tmp;
            }
        }
    }
    return min;
}

// vyresit pokud budou dve cinnosti do jednoho stavu
function getToStates(activities, states) {
    var nextStates = [];
    for (var i = 0; i < activities.length; i++) {
        nextStates.push(states.find(element => element.ID == activities[i].toState));
    }
    return nextStates;
}

function getFromStates(activities, states) {
    var nextStates = [];
    for (var i = 0; i < activities.length; i++) {
        nextStates.push(states.find(element => element.ID == activities[i].fromState));
    }
    return nextStates;
}

