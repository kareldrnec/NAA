importScripts("./jstat.min.js", "./calculations.js");

self.addEventListener("message", function(event) {

    console.log("EVENT DATA")
    console.log(event.data)
    console.log("ENDE")

    var res = null;
    var response = {};
    var resultArr = [];
    var item = null;
    var count = 0;
    for (var i = 0; i < (event.data[0] / 1000); i++) {
        for (var j = 0; j < 10000; j++) {
            res = simulateMonteCarlo(event.data[1], event.data[2]);
            item = resultArr.find(element => element.value == res);
            if (item == null) {
                resultArr.push({
                    "value": res,
                    "count": 1
                })
            } else {
                item.count += 1;
            }
            count++;
        }
        response.resultArr = resultArr;
        response.count = (i + 1) * 10000;  
        this.postMessage(response);
    }
});
