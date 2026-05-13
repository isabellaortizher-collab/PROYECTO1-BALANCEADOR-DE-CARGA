function countNode(requestParams, response, context, events, done) {
  const body = response.body || "";

  const normalizedBody = body.toLowerCase();

  const knownNodes = [
    "backend1",
    "backend2",
    "backend3",
    "backend4",
    "backend5",
    "backend6",
    "backend7",
    "frontend1",
    "frontend2",
    "frontend3",
    "frontend4",
    "frontend5",
    "frontend6",
    "frontend7"
  ];

  let detected = false;

  for (const node of knownNodes) {
    if (normalizedBody.includes(node)) {
      events.emit("counter", `custom.distribution.${node}`, 1);
      detected = true;
    }
  }

  if (!detected) {
    events.emit("counter", "custom.distribution.unknown", 1);
  }

  return done();
}

module.exports = {
  countNode
};
