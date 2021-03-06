const express = require("express");
const bodyParser = require("body-parser");
const { randomBytes } = require("crypto");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(bodyParser.json());
app.use(cors());

const commentsByPostId = {};

// GET /posts/:id/comments
app.get("/posts/:id/comments", (req, res) => {
  const { id } = req.params;

  if (!commentsByPostId[id])
    return res.status(404).send({ message: "Comments not found" });

  res.send(commentsByPostId[id] || []);
});

// POST /posts/:id/comments
app.post("/posts/:id/comments", async (req, res) => {
  const { id } = req.params;

  const commentId = randomBytes(4).toString("hex");
  const { content } = req.body;

  const comments = commentsByPostId[id] || [];

  comments.push({ id: commentId, content, status: 'pending' });

  commentsByPostId[id] = comments;

  await axios.post("http://localhost:4005/events", {
    type: "CommentCreated",
    data: { id: commentId, content, postId: id, status: 'pending' },
  });

  res.status(201).send(comments);
});

// Receives events from event-bus
app.post("/events", async (req, res) => {
  const { type, data } = req.body;

  console.log("Received event", type, data);

  if (type === 'CommentModerated') {
    const { id, postId, status, content } = data;

    const comments = commentsByPostId[postId];
    const comment = comments.find(comment => comment.id === id)
    comment.status = status;


    await axios
      .post("http://localhost:4005/events", {
        type: "CommentUpdated",
        data: { id, postId, status, content },
      })
      .catch((err) => console.log(err.message || err));

  }

  res.send({ status: "OK" });
});

app.listen(4001, () => console.log(`Listening on port http://localhost:4001`));
