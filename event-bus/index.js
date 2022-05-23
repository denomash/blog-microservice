const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");

const app = express();
app.use(bodyParser.json());

const events = [];

app.post("/events", async (req, res) => {
  const event = req.body;

  events.push(event);

  await axios
    .post("http://localhost:4000/events", event)
    .catch((err) => console.log("* TO POSTS SERVICE *", err.message || err));

  await axios
    .post("http://localhost:4001/events", event)
    .catch((err) => console.log("* TO COMMENTS SERVICE *", err.message || err));

  await axios
    .post("http://localhost:4002/events", event)
    .catch((err) => console.log(err.message || err));

  await axios
    .post("http://localhost:4003/events", event)
    .catch((err) => console.log(err.message || err));

  res.send({ status: "OK" });
});

app.get("/events", (req, res) => {
  res.send(events);
})

app.listen(4005, () => console.log("Listening on http://localhost:4005"));
