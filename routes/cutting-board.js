const express = require("express");
const router = express.Router();
const path = require("path");
const cuttingBoard = require("../models/cuttingBoardTodo");
const CuttingBoardInProgress = require("../models/CuttingBoardInProgress");
const CuttingBoardCompleted = require("../models/CuttingBoardCompleted");
let sewingBoard = require("../models/SewingBoard");
let AvailableProducts = require("../models/AvailableProducts");
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
//Route = /cutting-board
router.get("/", async (req, res) => {
  let cuttingData = await cuttingBoard.find({}, "-_id -__v -startedAt").lean();
  let inProgress = await CuttingBoardInProgress.find({}, "-_id -__v").lean();
  let completed = await CuttingBoardCompleted.find({}, "-_id -__v")
    .sort({ createdAt: -1 })
    .limit(5)
    .lean();
  res.render(path.join(__dirname, "../", "/views/cutting-board"), {
    data: cuttingData,
    inProgress,
    completed,
  });
});

router.get("/:id", checkAuth, async (req, res) => {
  let id = req.params.id;
  let deletedCard = await cuttingBoard.findOneAndDelete({ id: id }).lean();
  let newInprogressCard = {};
  Object.keys(deletedCard).forEach(function (prop) {
    if (prop != "_id" || prop != "__v") {
      newInprogressCard[prop] = deletedCard[prop];
    }
  });
  delete newInprogressCard.startedAt;
  let inProgressCard = await CuttingBoardInProgress.create(newInprogressCard);
  res.redirect("/cutting-board");
});

router.get("/completed/:id", checkAuth, async (req, res) => {
  let id = req.params.id;
  let deletedCard = await CuttingBoardInProgress.findOneAndDelete({
    id: id,
  }).lean();
  let newCompletedCard = {};
  Object.keys(deletedCard).forEach(function (prop) {
    if (prop != "_id" || prop != "__v") {
      newCompletedCard[prop] = deletedCard[prop];
    }
  });
  let completedCard = await CuttingBoardCompleted.create(newCompletedCard);
  let sewingCard = await sewingBoard.create(newCompletedCard);
  let deleteFabricAvailableProduct = await AvailableProducts.findOneAndDelete({
    id: id,
    dept: "fabric",
  });
  newCompletedCard.dept = "cutting";
  let availableCard = await AvailableProducts.create(newCompletedCard);
  delete newCompletedCard._id;
  let performance = await PerformanceAnalyze.create(newCompletedCard);
  let notificationData = {
    dept: "One task completed by Cutting Department",
  };
  let notifiction = await NotificationBoard.create(notificationData);
  res.redirect("/cutting-board");
});

module.exports = router;
