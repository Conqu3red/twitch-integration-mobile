const express = require("express");
const app = express();
const pako = require('pako');
const bodyParser = require('body-parser');

// make all the files in 'public' available
app.use(express.static("public"));
app.use(bodyParser.raw());
//console.log(pako.gzip("abcdeef", {to: 'binary'}))

app.get("/", (request, response) => {
  response.sendFile(__dirname + "/test.html");
});

app.post("/api/gzip", (request, response) => {
    let gzipped = pako.gzip(request.body, {to: 'binary'})
    response.type("application/octet-stream")
    response.send(Buffer.from(gzipped.buffer))
})

const listener = app.listen(3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
