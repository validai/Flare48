"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var dotenv = require("dotenv"); // ✅ Correct way to import dotenv
dotenv.config();
var app = (0, express_1.default)();
var PORT = process.env.PORT || 5000; // Render assigns PORT dynamically
app.use(express_1.default.json());
app.get('/', function (req, res) {
    res.send('Flare48 API is running...');
});
// Explicitly listen on 0.0.0.0 to accept external traffic
app.listen(PORT, '0.0.0.0', function () {
    console.log("\u2705 Server running on http://0.0.0.0:".concat(PORT));
});
