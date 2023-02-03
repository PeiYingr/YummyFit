const express = require("express");
const app = express();
const port = 3000;

const usersRouter = require("./router/user");
const foodsRouter = require("./router/food");
const intakeRouter = require("./router/intake");

app.use(express.static("./static"));
app.set("view engine", "ejs");
// Parse JSON bodies (bodyparser for json)
app.use(express.json()); 
app.use(express.urlencoded({ extended: false })); // 通常是接收前端提交表單時解析使用 

// pages
app.get("/", (req, res) => {
  res.render("index");
});
app.get("/sign", (req, res) => {
  res.render("sign");
});

// 將users的requests，導入到對應的Router處理
app.use("/api/user", usersRouter);
app.use("/api/food", foodsRouter);
app.use("/api/intake", intakeRouter);

app.listen(port, () => {
  console.log(`伺服器已經啟動在 http://localhost:${port}/`);
})