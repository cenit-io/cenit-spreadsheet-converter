var cpx = require("cpx");

console.log("STARTING COPYING OF COMPONENT FILES:");
console.log("--------------------------------------------------------------");

cpx.copy('src/**/*', '../../', function (err) {
    console.log("--------------------------------------------------------------");
    console.log("ENDED COPYING OF COMPONENT FILES.\n");
}).on("copy", function (e) {
    console.log("Copy file '%s' to '%s'.", e.srcPath, e.dstPath);
});