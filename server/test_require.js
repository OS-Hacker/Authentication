// quick require test for modified modules
try {
  const gen = require("./utils/GenerateTokens");
  const ctrl = require("./controllers/user.controller");
  console.log("Require OK");
} catch (err) {
  console.error("Require error:", err);
  process.exit(1);
}
