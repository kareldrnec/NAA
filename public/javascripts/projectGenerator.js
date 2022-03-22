// Generator skript

function generateProject(statesCount) {
    console.log("cau")
    // generovani stavu
    var states = generateStates(statesCount);

    console.log("States");
    console.log(states);
    console.log("ende");
}

function generateStates(count) {
    var states = [];
    // add Start State
    states.push({"name": "Start"});
    // add Finish State
    states.push({"name": "Finish"});
    for(var i = 0; i < count - 2; i++) {
        states.push({"name": "S" + (i+1)});
    }
    return states;
}

function generateActivities() {

}