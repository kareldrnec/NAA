self.addEventListener("message", function(event) {
    console.log("Message from parent: ", event.data);
});