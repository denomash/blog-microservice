const express = require("express");
const bodyParser = require("body-parser");
const { randomBytes } = require("crypto");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(bodyParser.json());
app.use(cors());

const posts = {};

// GET /posts
app.get("/posts", (req, res) => {
  if (!Object.keys(posts).length)
    return res.status(404).send({ message: "Posts not found" });

  res.status(200).send(posts);
});

// Create a new post
app.post("/posts", async (req, res) => {
  const id = randomBytes(4).toString("hex");
  const { title } = req.body;
  posts[id] = { id, title };

  await axios.post("http://localhost:4005/events", {
    type: "PostCreated",
    data: { id, title },
  });

  res.status(201).send(posts[id]);
});

// Receives events from event-bus
app.post("/events", (req, res) => {
  const { type, data } = req.body;

  console.log("Received event", type, data);

  res.send({ status: "OK" });
});

app.listen(4000, () => console.log(`Listening on port http://localhost:4000`));
