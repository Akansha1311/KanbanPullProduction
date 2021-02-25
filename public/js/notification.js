var socket = io();
let ul = document.getElementById("notificationMain");
let deleteAll = document.getElementById("deleteNotifications");

deleteAll.addEventListener("click", () => {
  let confirm = window.confirm("Are you sure?");
  if (confirm) {
    localStorage.clear();
    location.reload();
  } else {
    return;
  }
});

backup();
function backup() {
  let getItem = window.localStorage.getItem("nots");
  if (getItem != null) {
    let parsed = JSON.parse(getItem);
    parsed.reverse().forEach((not) => {
      let li = document.createElement("li");
      li.innerHTML = not;
      ul.appendChild(li);
    });
  }
}

function createNotifications() {
  socket.on("dept completed", (msg) => {
    msg = "One " + msg;
    let li = document.createElement("li");
    li.innerText = msg;
    let p = document.createElement("p");
    let time = moment().format("llll");
    p.innerText = time;
    li.appendChild(p);
    ul.appendChild(li);
    document.getElementById("notification").muted = false;
    document.getElementById("notification").play();
    localNotification(msg, time);
  });
}

createNotifications();

function localNotification(value, time) {
  let getItem = window.localStorage.getItem("nots");
  let str = `${value} <p>${time}</p>`;
  let notificationStorage = [];

  if (getItem == null) {
    notificationStorage.push(str);
    window.localStorage.setItem("nots", JSON.stringify(notificationStorage));
  } else {
    let parsed = JSON.parse(getItem);
    parsed.push(str);
    window.localStorage.setItem("nots", JSON.stringify(parsed));
  }
}
