const router = require("express").Router();
const path = require("path");

router.get("/", (req, res) => {
  res.render(path.join(__dirname, "../", "/views/notification-board.ejs"));
});

module.exports = router;
