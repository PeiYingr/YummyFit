const express = require("express");
const app = express();
const port = 3000;

const usersRouter = require("./router/user");
const foodsRouter = require("./router/food");
const intakeRouter = require("./router/intake");
const photoRouter = require("./router/photo");
const targetRouter = require("./router/target");
const ocrRouter = require("./router/ocr");
const authRouter = require('./router/auth');

app.use(express.static("./static"));
app.set("view engine", "ejs");
// Parse JSON bodies (bodyparser for json)
app.use(express.json()); 
app.use(express.urlencoded({ extended: false })); // 通常是接收前端提交表單時解析使用 

// pages
app.get("/", (req, res) => {
  res.render("index");
});
app.get("/login", (req, res) => {
  res.render("sign");
});
app.get("/member", (req, res) => {
  res.render("member");
});
app.get("/community", (req, res) => {
  res.render("community");
});

// 將users的requests，導入到對應的Router處理
app.use("/api/user", usersRouter);
app.use("/api/food", foodsRouter);
app.use("/api/intake", intakeRouter);
app.use("/api/photo", photoRouter);
app.use("/api/target", targetRouter);
app.use("/api/ocr", ocrRouter);
app.use("/auth", authRouter);

app.listen(port, () => {
  console.log(`伺服器已經啟動在 http://localhost:${port}/`);
})