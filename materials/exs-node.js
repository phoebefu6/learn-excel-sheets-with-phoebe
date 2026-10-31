/* Run the SAME engine file the browser runs, over the SAME data file, and print the ladder as JSON.
   Usage: node materials/exs-node.js > ladder-node.json */
var fs = require("fs"), path = require("path"), vm = require("vm");
var A = path.join(__dirname, "..", "assets");
var sandbox = { window: {} };
sandbox.window.window = sandbox.window;
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(path.join(A, "exs-data.js"), "utf8"), sandbox);
vm.runInContext(fs.readFileSync(path.join(A, "exs-live.js"), "utf8").replace('typeof window !== "undefined" ? window : this', "window"), sandbox);
var EXS = sandbox.window.EXS;
var out = { truth: EXS.truth(), ladder: EXS.ladder({}), anti: EXS.ladder({ approx: true }),
  brk: EXS.ladder({ brk: true }), selfTest: EXS.selfTest(), selfTestFault: EXS.selfTest("looseExact"),
  pivot: EXS.pivotDemo() };
process.stdout.write(JSON.stringify(out, null, 1));
