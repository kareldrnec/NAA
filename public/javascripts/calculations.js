function calculate() {
    console.log("Pocitam")
    console.log(_activitiesData)
    console.log("ENDE")
    console.log("END MAYBE")
}

function getExpectedValue(optimisticValue, modalValue, pessimisticValue) {
    return (optimisticValue + 4 * modalValue + pessimisticValue);
}

function getStandardDeviation(optimisticValue, pessimisticValue) {
    return (pessimisticValue - optimisticValue);
}

function getZ(x, expectedValue, standardDeviation) {
    return (x - expectedValue) / standardDeviation;
}

function calculateCPM() {

}

function calculatePERT() {

}