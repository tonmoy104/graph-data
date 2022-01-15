function requireHTTPS(req, res, next) {
    // The 'x-forwarded-proto' check is for Heroku
    if (!req.secure && req.get('x-forwarded-proto') !== 'https') {
        return res.redirect('https://' + req.get('host') + req.url);
    }
    next();
}

const express = require('express');
const app = express();
console.log(process.env.NODE_ENV);
if (process.env.NODE_ENV === 'production') {
    app.use(requireHTTPS);
}

app.use(express.static("./dist/graph-data"));

app.get("/*", function(req, res) {
    res.sendFile("index.html", {root: "dist/graph-data"});
});
const port = process.env.PORT || 8080;
app.listen(port);

console.log("Server started on port " + port);