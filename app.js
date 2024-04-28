const SERVICES = [];

/**
 *
 * @typedef {boolean | 'pending' | 'failure' | 'unknown'} Status
 *
 * @typedef {Object} Service
 * @property {string} name
 * @property {string} url
 * @property {string} method: default is GET
 * @property {(status) => Status } status
 *
 * @typedef {Object} GroupService
 * @property {string} url
 * @property {string} method: default is GET
 * @property {Array<{ name: string, status: (status) => Status }>} group
 *
 * @typedef {Object} ServiceLikeObj
 * @property {string} name
 * @property {(status) => Status } status
 **/

/**
 *
 * @param {Service | GroupService} service
 * */
function Service(service) {
  SERVICES.push(service);
}

window.onload = function () {
  var Statuses = {
    success: "success",
    true: "success",
    false: "failure",
    pending: "pending",
  };

  /**
   * @param {HTMLElement} box
   **/
  function removeClasses(box) {
    box.classList.remove("pending");
    box.classList.remove("unknown");
    box.classList.remove("failure");
    box.classList.remove("success");
    box.classList.remove("waiting");
  }

  /**
   * @param {HTMLElement} box
   **/
  function handle_error(box) {
    removeClasses(box);
    box.classList.add("unknown");
  }

  function repeat(service) {
    check = function () {
      check_service(service);
    };
    setTimeout(check, service.interval || 30000);
  }

  function check_service(service) {
    if (Array.isArray(service.group)) {
      service.group.forEach(function (item) {
        set_box_waiting(item.box);
      });
      fetchingPipling(
        service.url,
        service.method,
        function (res) {
          service.group.forEach(function (item) {
            const status = item.status(res);
            removeClasses(item.box);
            item.box.classList.add(Statuses[status]);
            playIfNeeded(item, status);
          });
        },
        function () {
          service.group.forEach(function (item) {
            handle_error(item.box);
          });
        }
      ).then(function () {
        repeat(service);
      });
    } else {
      set_box_waiting(service.box);
      fetchingPipling(
        service.url,
        service.method,
        function (res) {
          const status = service.status(res);
          removeClasses(service.box);
          service.box.classList.add(Statuses[status]);
          playIfNeeded(service, status);
        },
        function () {
          handle_error(service.box);
        }
      ).then(function () {
        repeat(service);
      });
    }

    /**
     * @param {HTMLElement} box
     **/
    function set_box_waiting(box) {
      box.classList.add("waiting");
    }

    /**
     * @param {string} url
     * @param {string} method
     * @param {(res: any) => void} handle_response
     * @param {() => void} handle_error
     **/
    function fetchingPipling(url, method, handle_response, handle_error) {
      return fetch(url, {
        method: method || "GET",
        timeout: 3500,
      }).then(
        function (res) {
          if (res.status > 299 && res.status < 200) {
            handle_error(box);
            return;
          }

          res
            .text()
            .then(function (text) {
              const res = parseJSON(text);
              handle_response(res);
            })
            .catch(function (error) {
              console.error(error);
              handle_error();
            });
        },
        function (error) {
          console.error(error);
          handle_error();
        }
      );
    }
  }

  function initialize_service(service) {
    /**
     * @param {Service} service
     * @param {(el: HTMLElement) => void} hook_box
     **/
    function init_box(name, hook_box) {
      var box = document.querySelector(".service.template").cloneNode(true);
      box.classList.remove("template");
      box.querySelector(".title").innerText = name;

      document.getElementById("content").appendChild(box);
      hook_box(box);
    }
    if (Array.isArray(service.group)) {
      service.group.forEach(function (item) {
        init_box(item.name, function (box) {
          item.box = box;
        });
      });
    } else {
      init_box(service.name, function (box) {
        service.box = box;
      });
    }
    check_service(service);
  }

  /**
   * @param {ServiceLikeObj} service
   * @param {Status} status
   **/
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
  url: "/cgi-bin/ci.sh",
  group: [
    {
      name: "web",
      status: function (ciInfo) {
        var pipeline = ciInfo.filter(function (ci) {
          return ci.name === "web";
        });

        return pipeline.length > 0 && get_pipeline_status(pipeline[0]);
      },
    },
    {
      name: "admin",
      status: function (ciInfo) {
        var pipeline = ciInfo.filter(function (ci) {
          return ci.name === "admin";
        });

        return pipeline.length > 0 && get_pipeline_status(pipeline[0]);
      },
    },
  ],
});

// sample for azure devops
function get_pipeline_status(pipeline) {
  const lastStatus = pipeline.latestRun && pipeline.latestRun.status;

  if (lastStatus === 2) {
    return "success";
  }
  if (lastStatus === 1) {
    return "pending";
  }
  if (lastStatus === 0) {
    return "failure";
  }
  return "unknown";
}
