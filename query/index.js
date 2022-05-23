const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(bodyParser.json());
app.use(cors());

const posts = {};

app.get("/posts", (req, res) => {
  if (!Object.keys(posts).length)
    return res.status(404).send({ message: "Posts not found" });

  res.status(200).send(posts);
});

const handleEvent = (type, data) => {
  if (type === "PostCreated") {
    const { id, title } = data;
    posts[id] = { id, title, comments: [] };
  }

  if (type === "CommentCreated") {
    const { id, content, postId, status } = data;
    const post = posts[postId];

    post.comments.push({ id, content, status });
  }

  if (type === "CommentUpdated") {
    const { id, content, postId, status } = data;

    const post = posts[postId];
    const comment = post.comments.find(comment => comment.id === id);

    comment.status = status;
    comment.content = content;
  }
}

app.post("/events", (req, res) => {
  const { type, data } = req.body;

  handleEvent(type, data);

  res.send({ status: "OK" });
});

app.listen(4002, async () => {
  console.log("Listening on http://localhost:4002")

  try {
    const res = await axios.get("http://localhost:4005/events");

    console.log("****", res.data);

    for (let event of res.data) {
      console.log("* Processing Event *", event.type);
      handleEvent(event.type, event.data);
    }
  } catch (err) {
    console.log(err.message || err);
  }

});
