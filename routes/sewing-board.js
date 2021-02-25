const express = require("express");
const router = express.Router();
const path = require("path");
const SewingBoard = require("../models/SewingBoard");
const SewingBoardInProgress = require("../models/SewingBoardInProgress");
const SewingBoardCompleted = require("../models/SewingBoardCompleted");
const AvailableProducts = require("../models/AvailableProducts");
let FinishingBoard = require("../models/FinishingBoard");
let ReworkKanbanCard = require("../models/ReworkKanbanCard");
let PerformanceAnalyze = require("../models/PerformanceAnalyze");
let NotificationBoard = require("../models/NotificationBoard");

function checkAuth(req, res, next) {
  if (req.isAuthenticated()) {
    next();
  } else {
    let data = req.flash("message")[0];
    res.render(path.join(__dirname, "../", "/views/login"), {
      message: "",
      data,
    });
  }
}

//Method = GET
//Route = /sewing-board
router.get("/", async (req, res) => {
  let data = await SewingBoard.find({}, "-_id -__v -startedAt").lean();
  let reworkdata = await ReworkKanbanCard.find({}, "-_id -__v").lean();
  let inProgress = await SewingBoardInProgress.find({}, "-_id -__v").lean();
  let completed = await SewingBoardCompleted.find({}, "-_id -__v")
    .sort({ createdAt: -1 })
    .limit(5)
    .lean();
  res.render(path.join(__dirname, "../", "/views/sewing-board"), {
    data,
    inProgress,
    completed,
    reworkdata,
  });
});

router.get("/:id", checkAuth, async (req, res) => {
  let id = req.params.id;
  let deletedCard = await SewingBoard.findOneAndDelete({ id: id }).lean();
  let newInprogressCard = {};
  Object.keys(deletedCard).forEach(function (prop) {
    if (prop != "_id" || prop != "__v") {
      newInprogressCard[prop] = deletedCard[prop];
    }
  });

  delete newInprogressCard.startedAt;
  let inProgressCard = await SewingBoardInProgress.create(newInprogressCard);
  res.redirect("/sewing-board");
});

router.get("/completed/:id", checkAuth, async (req, res) => {
  let id = req.params.id;
  let deletedCard = await SewingBoardInProgress.findOneAndDelete({
    id: id,
  }).lean();
  let newCompletedCard = {};
  Object.keys(deletedCard).forEach(function (prop) {
    if (prop != "_id" || prop != "__v")
      newCompletedCard[prop] = deletedCard[prop];
  });
  let completedCard = await SewingBoardCompleted.create(newCompletedCard);
  let deleteCuttingAvailableProduct = await AvailableProducts.findOneAndDelete({
    id: id,
    dept: "cutting",
  });
  newCompletedCard.dept = "sewing";
  let availableCard = await AvailableProducts.create(newCompletedCard);
  let FinishingBoardCard = await FinishingBoard.create(newCompletedCard);
  delete newCompletedCard._id;
  let performance = await PerformanceAnalyze.create(newCompletedCard);
  let notificationData = {
    dept: "One task completed by Sewing Department",
  };
  let notifiction = await NotificationBoard.create(notificationData);
  res.redirect("/sewing-board");
});

module.exports = router;
