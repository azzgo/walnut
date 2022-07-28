const SERVICES = [];

/**
 * @type {Service}
 * @property {string} name
 * @property {string} url
 * @property {(status) => boolean | 'pending'} statu
 *
 * @param {Service} service
 * */
function Service(service) {
  SERVICES.push(service);
}

window.onload = function () {
  var Statuses = { true: "success", false: "failure", pending: "pending" };

  function removeClasses(service) {
    service.box.classList.remove("pending");
    service.box.classList.remove("unknown");
    service.box.classList.remove("failure");
    service.box.classList.remove("success");
    service.box.classList.remove("waiting");
  }

  function handle_error(service) {
    removeClasses(service);
    service.box.classList.add("unknown");
  }

  function repeat(service) {
    check = function () {
      check_service(service);
    };
    setTimeout(check, service.interval || 30000);
  }

  function check_service(service) {
    service.box.classList.add("waiting");

    fetch(service.url, {
      method: "GET",
      timeout: 3500,
    }).then(
      (res) => {
        if (res.status > 299 && res.status < 200) {
          handle_error(service);
          return;
        }

        res
          .text()
          .then((text) => {
            const res = parseJSON(text);
            const status = service.status(res);
            removeClasses(service);
            service.box.classList.add(Statuses[status]);
            playIfNeeded(service, status);

            repeat(service);
          })
          .catch((error) => {
            console.error(error);
            handle_error(service);
          });
      },
      (error) => {
        console.error(error);
        handle_error(service);
        repeat(service);
      }
    );
  }

  function initialize_service(service) {
    var box = document.querySelector(".service.template").cloneNode(true);
    box.classList.remove("template");
    box.querySelector(".title").innerText = service.name;

    document.getElementById("content").appendChild(box);
    service.box = box;
    check_service(service);
  }

  function playIfNeeded(service, status) {
    if (service.lastStatus === undefined) {
      service.lastStatus = status;
      return null;
    }
    if (status === false && service.lastStatus !== false) {
      playNew();
    }
    service.lastStatus = status;
  }

  SERVICES.forEach(initialize_service);
};

var id = 0;

var playNew = function () {
  zone = document.getElementById("audioelements");
  tag = document.createElement("audio");
  tag.setAttribute("preload", "auto");
  tag.setAttribute("autoplay", "autoplay");
  tag.setAttribute("src", "inception.mp3");
  tag.setAttribute("id", "audio" + id);
  zone.appendChild(tag);
  tag.play();
  setTimeout(
    "x=document.getElementById('audio" + id + "');x.parentNode.removeChild(x);",
    8500
  );
  id++;
};

var parseJSON = function (jsonStr) {
  try {
    return JSON.parse(jsonStr);
  } catch (e) {
    return jsonStr;
  }
};

Service({
  name: "Service",
  url: "/",
  status: function () {
    const status = [true, false, "pending"][Math.floor(Math.random() * 3)];
    return status;
  },
});
