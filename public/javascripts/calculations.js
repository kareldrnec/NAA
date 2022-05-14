
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

function simulateMonteCarlo(activities, states) {
    // TODO
        // TODO
        var calculatedStates, calculatedActivities;
        calculatedStates = arrStates(states.states);
        calculatedActivities = monteCarloActivities(activities.activities);
        calculatedStates = forwardCalculation(calculatedStates, calculatedActivities);
        calculatedStates = backwardCalculation(calculatedStates, calculatedActivities);
        var finishState = calculatedStates.find(element => element.name == "Finish");
        // Math.round((num + Number.EPSILON) * 100) / 100
        //return Math.round((finishState.ES + Number.EPSILON) * 100) / 100;
        return (finishState.ES).toFixed(1);
}

function monteCarloActivities(activities) {
    var min, med, max, alpha, beta, randNum, cdf, time;
    var activitiesArr = [];
    const lambda = 4;
    for (var i = 0; i < activities.length; i++) {
        min = parseInt(activities[i].values[0]);
        med = parseInt(activities[i].values[1]);
        max = parseInt(activities[i].values[2]);
        alpha = 1 + lambda * ((med - min) / (max - min));
        beta = 1 + lambda * ((max - med) / (max - min));
        randNum = Math.random() * (1 - 0) + 0;
        cdf = jStat.beta.inv(randNum, alpha, beta);
        time = min + (max - min) * cdf;
        activitiesArr.push({
            ID: activities[i].ID,
            fromState: activities[i].fromState,
            toState: activities[i].toState,
            value: time,
            critical: false
        })
    }
    return activitiesArr;
}


function calculate(states, activities, currentProject, arguments) {
    var result = {};
    var calculatedActivities;
    var calculatedStates = arrStates(states);
    var criticalActivities = null;
    var criticalPath = "";
    var criticalPathsArr = [];
    var firstState = null;
    var lastState = null;
    var tempActivity = null;
    var previousActivity = null;
    var nextActivity = null;
    var usedActivities = [];
    if (projectType == 'cpm') {
        calculatedActivities = cpmActivities(activities);
    } else if (projectType == 'pert') {
        calculatedActivities = pertActivities(activities);
    }

    calculatedStates = forwardCalculation(calculatedStates, calculatedActivities);
    calculatedStates = backwardCalculation(calculatedStates, calculatedActivities);
    calculatedActivities = findCriticalActivities(calculatedStates, calculatedActivities);

    lastState = calculatedStates.find(element => element.name == "Finish");
    criticalActivities = calculatedActivities.filter(element => element.critical == true);
    if (projectType == 'cpm') {
        firstState = calculatedStates.find(element => element.name == "Start");
        while (firstState.name != "Finish") {
            nextActivity = calculatedActivities.find(element => element.critical == true && element.fromState == firstState.ID);
            tempActivity = activities.find(element => element.ID == nextActivity.ID);
            usedActivities.push(nextActivity);
            criticalPath += tempActivity.activityName + "->";
            firstState = calculatedStates.find(element => element.ID == nextActivity.toState);
        }
        criticalPathsArr.push(criticalPath.slice(0, criticalPath.length - 2));
        if (criticalActivities.length != usedActivities.length) {
            criticalPathsArr = findRemainingCriticalPaths(activities, criticalActivities, usedActivities, calculatedStates, criticalPathsArr);
        }
        result.project = {"length": lastState.ES, "projectType": projectType, "criticalPathsArr": criticalPathsArr};
    } else {
        // PERT VALUES
        var totalMeanValue = lastState.ES;
        var totalVariance = 0;

        while(lastState.name != "Start") {
            previousActivity = calculatedActivities.find(element => element.critical == true && element.toState == lastState.ID);
            // hodiny ... mrknout
            tempActivity = activities.find(element => element.ID == previousActivity.ID);
            usedActivities.push(previousActivity);
            criticalPath = criticalPath.slice(0, 0) + "->" + tempActivity.activityName + criticalPath.slice(0);
            totalVariance += previousActivity.variance;
            lastState = calculatedStates.find(element => element.ID == previousActivity.fromState);
        }

        criticalPathsArr.push(criticalPath.slice(2));

        if (criticalActivities.length != usedActivities.length) {
            criticalPathsArr = findRemainingCriticalPaths(activities, criticalActivities, usedActivities, calculatedStates, criticalPathsArr);
        }
        resultPERT = calculatePERT(totalMeanValue, totalVariance, arguments);
        result.project = {"meanValue": totalMeanValue, "totalVariance": totalVariance, "result": resultPERT, "criticalPathsArr": criticalPathsArr};
    }
    result.states = calculatedStates;
    result.activities = calculatedActivities;
    sessionStorage.setItem(currentProject._id, JSON.stringify(result));
    return result;
}


// vypsani dalsich cest...
function findRemainingCriticalPaths(activities, criticalActivities, usedActivities, calculatedStates, criticalPathsArr) {
    let difference = criticalActivities.filter(x => !usedActivities.includes(x));
    var tmpActivity = null;
    var activity = null;
    var criticalPath = "";
    var previousState = null;
    var nextState = null;
    while (difference.length != 0) {
        tmpActivity = difference[0];
        activity = activities.find(element => element.ID == tmpActivity.ID);
        criticalPath += activity.activityName + "->";
        previousState = calculatedStates.find(element => element.ID == activity.fromState);
        nextState = calculatedStates.find(element => element.ID == activity.toState);
        if (!usedActivities.includes(tmpActivity)) {
            usedActivities.push(tmpActivity);
        }
        while (previousState.name != "Start") {
            tmpActivity = criticalActivities.find(element => element.toState == previousState.ID);
            activity = activities.find(element => element.ID == tmpActivity.ID);
            criticalPath = criticalPath.slice(0, 0) + "->" + activity.activityName + criticalPath.slice(0);
            previousState = calculatedStates.find(element => element.ID == tmpActivity.fromState);
            if (!usedActivities.includes(tmpActivity)) {
                usedActivities.push(tmpActivity);
            }
        }
        while (nextState.name != "Finish") {
            tmpActivity = criticalActivities.find(element => element.fromState == nextState.ID);
            activity = activities.find(element => element.ID == tmpActivity.ID);
            criticalPath += activity.activityName + "->";
            nextState = calculatedStates.find(element => element.ID == tmpActivity.toState);
            if (!usedActivities.includes(tmpActivity)) {
                usedActivities.push(tmpActivity);
            }
        }

        if(criticalPath[0] == '-') criticalPath = criticalPath.slice(2);
        if(criticalPath[criticalPath.length - 1] == '>') criticalPath = criticalPath.slice(0, criticalPath.length - 2);
        criticalPathsArr.push(criticalPath);
        criticalPath = "";
        difference = criticalActivities.filter(x => !usedActivities.includes(x));
    }

    return criticalPathsArr;
}

function calculatePERT(totalMeanValue, totalVariance, arguments) {
    var result = [];
    if (arguments.length == 3) {
        // time
        var time = getPertTime(arguments[2], totalMeanValue, totalVariance);
        result = ['T', '=', arguments[2], time];
        // TODO zkontrolovat zda pocita dobre
    } else if (arguments.length == 4) {
        // simple pert
        var probability = getPertProbability(parseFloat(arguments[2]), totalMeanValue, totalVariance);
        if (arguments[1] == 'gt') probability = 1 - probability;
        result = ['P', arguments[1], arguments[2], probability, arguments[3]];
    } else {
        var probability = null;
        if (arguments[1] == 'gt' && arguments[3] == 'lt') {
            // BETWEEN > <
            probability = getPertProbability(parseFloat(arguments[4]), totalMeanValue, totalVariance) - getPertProbability(parseFloat(arguments[2]), totalMeanValue, totalVariance);
            result = ['P', arguments[1], arguments[2], arguments[3], arguments[4], probability, arguments[5]];
        } else if (arguments[1] == 'lt' && arguments[3] == 'gt') {
            // OR < >
            probability = 1 - (getPertProbability(parseFloat(arguments[4]), totalMeanValue, totalVariance) - getPertProbability(parseFloat(arguments[4]), totalMeanValue, totalVariance));
            result = ['P', arguments[1], arguments[2], arguments[3], arguments[4], probability, arguments[5]];
        } else if (arguments[1] == 'lt' && arguments[3] == 'lt') {
            // UNION < <
            probability = getPertProbability(arguments[2], totalMeanValue, totalVariance);
            result = ['P', arguments[1], arguments[2], probability, arguments[5]];
        } else {
            // UNION > >
            probability = 1 - getPertProbability(arguments[4], totalMeanValue, totalVariance);
            result = ['P', arguments[3], arguments[4], probability, arguments[5]];
        }
    }
    return result;
}

function getPertProbability(time, totalMeanValue, totalVariance) {
    return jStat.normal.cdf(time, totalMeanValue / 6, Math.sqrt(totalVariance) / 6);
}

function getPertTime(probability, totalMeanValue, totalVariance) {
    return jStat.normal.inv(probability / 100, totalMeanValue / 6, Math.sqrt(totalVariance) / 6);
}


function findCriticalActivities(states, activities) {
    var fromState, toState;
    for (var i = 0; i < activities.length; i++) {
        fromState = states.find(element => element.ID == activities[i].fromState);
        toState = states.find(element => element.ID == activities[i].toState);
        if (fromState.slack == 0 && toState.slack == 0 && (fromState.ES + activities[i].value) == toState.ES && (toState.LS - activities[i].value) == fromState.ES) {
            activities[i].critical = true;
        }
    }
    return activities;
}

function backwardCalculation(states, activities) {
    var nextStates, activitiesFromState, min;
    var tmpStates = [];
    var currentState = states.find(element => element.name == 'Finish');
    currentState.LS = currentState.ES;
    var minValue = currentState.LS;
    currentState.slack = 0;
    nextStates = [];
    nextStates = findPreviousStates(currentState, states, activities, nextStates);
    while (nextStates.length != 0) {
        for (var i = 0; i < nextStates.length; i++) {
            currentState = nextStates[i];
            activitiesFromState = activities.filter(element => element.fromState == currentState.ID);
            if (canBackward(states, activitiesFromState)) {
                min = findMinValue(states, activitiesFromState, minValue);
                currentState.LS = min;
                currentState.slack = currentState.LS - currentState.ES;
                tmpStates = findPreviousStates(currentState, states, activities, tmpStates);
            } else {
                tmpStates.push(currentState);
            }
        }
        nextStates = tmpStates;
        tmpStates = [];
    }
    return states;
}

function forwardCalculation(states, activities) {
    var nextStates, activitiesToState, max;
    var tmpStates = [];
    var currentState = states.find(element => element.name == 'Start');
    currentState.ES = 0;
    nextStates = [];
    nextStates = findNextStates(currentState, states, activities, nextStates);
    while (nextStates.length != 0) {
        for (var i = 0; i < nextStates.length; i++) {
            currentState = nextStates[i];
            activitiesToState = activities.filter(element => element.toState == currentState.ID);
            if (canForward(states, activitiesToState)) {
                max = findMaxValue(states, activitiesToState);
                currentState.ES = max;
                tmpStates = findNextStates(currentState, states, activities, tmpStates);
            } else {
                tmpStates.push(currentState);
            }
        }
        nextStates = tmpStates;
        tmpStates = [];
    }
    return states;
}

function findMaxValue(states, activitiesToState) {
    var max = 0;
    for (var i = 0; i < activitiesToState.length; i++) {
        currentState = states.find(element => element.ID == activitiesToState[i].fromState);
        if ((currentState.ES + activitiesToState[i].value) > max) {
            max = currentState.ES + activitiesToState[i].value;
        }
    }
    return max;
}

function findMinValue(states, activitiesFromState, min) {
    for (var i = 0; i < activitiesFromState.length; i++) {
        currentState = states.find(element => element.ID == activitiesFromState[i].toState);
        if ((currentState.LS - activitiesFromState[i].value) < min) {
            min = currentState.LS - activitiesFromState[i].value;
        }
    }
    return min;
}

function canForward(states, activitiesToState) {
    let can = true;
    var currentState;
    for (var i = 0; i < activitiesToState.length; i++) {
        currentState = states.find(element => element.ID == activitiesToState[i].fromState);
        if (currentState.ES == -1) {
            can = false;
            break;
        }
    }
    return can;
}

function canBackward(states, activitiesFromState) {
    let can = true;
    var currentState;
    for (var i = 0; i < activitiesFromState.length; i++) {
        currentState = states.find(element => element.ID == activitiesFromState[i].toState);
        if (currentState.LS == -1) {
            can = false;
            break;
        }
    }
    return can;
}

function findNextStates(currentState, states, activities, resultStates) {
    var tmpState;
    var tempActivities = activities.filter(element => element.fromState == currentState.ID);
    for (var i = 0; i < tempActivities.length; i++) {
        tmpState = states.find(element => element.ID == tempActivities[i].toState);
        if (!resultStates.find(element => element.ID == tmpState.ID)) resultStates.push(tmpState);
    }
    return resultStates;
}

function findPreviousStates(currentState, states, activities, resultStates) {
    var tmpState;
    var tempActivities = activities.filter(element => element.toState == currentState.ID);
    for (var i = 0; i < tempActivities.length; i++) {
        tmpState = states.find(element => element.ID == tempActivities[i].fromState);
        if (!resultStates.find(element => element.ID == tmpState.ID)) resultStates.push(tmpState);
    }
    return resultStates;
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

function cpmActivities(activities) {
    var activitiesArr = [];
    for (var i = 0; i < activities.length; i++) {
        activitiesArr.push({
            ID: activities[i].ID,
            fromState: activities[i].fromState,
            toState: activities[i].toState,
            value: parseFloat(activities[i].values[0]),
            critical: false
        });
    }
    return activitiesArr;
}

// TIME UNIT DODELAT
function pertActivities(activities) {
    var activitiesArr = [];
    var std = null;
    for (var i = 0; i < activities.length; i++) {
        std = parseFloat(activities[i].values[2]) - parseFloat(activities[i].values[0]); // TODO
        activitiesArr.push({
            ID: activities[i].ID,
            fromState: activities[i].fromState,
            toState: activities[i].toState,
            value: parseFloat(activities[i].values[0]) + 4 * parseFloat(activities[i].values[1]) + parseFloat(activities[i].values[2]),
            std: std,
            variance: std * std,
            critical: false
        });
    }
    return activitiesArr;
}