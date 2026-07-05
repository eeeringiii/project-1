(function () {
  var ENDPOINT = (document.currentScript && document.currentScript.getAttribute("data-endpoint")) ||
    "/api/funnel/event";
  fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ stage: "lp_visit" }),
    keepalive: true,
  }).catch(function () {});
})();
