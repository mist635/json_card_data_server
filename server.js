const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const app = express();
const PORT = 3001;

// CORS許可（Reactがlocalhost:5173の場合）
app.use(cors({
  origin: "http://localhost:5173"
}));
app.use(express.json());

// 保存先フォルダ
const SAVE_DIR = path.join(__dirname, "data");

// フォルダが無ければ作成
if (!fs.existsSync(SAVE_DIR)) {
  fs.mkdirSync(SAVE_DIR);
}

app.post("/save", (req, res) => {
  const data = req.body;
  const filename = `form_${Date.now()}.json`;
  const filepath = path.join(SAVE_DIR, filename);

  fs.writeFile(filepath, JSON.stringify(data, null, 2), (err) => {
    if (err) {
      console.error("保存失敗:", err);
      return res.status(500).json({ success: false });
    }
    console.log("保存成功:", filepath);
    res.json({ success: true, filename });
  });
});

app.listen(PORT, () => {
  console.log(`🚀 サーバー起動中：http://localhost:${PORT}`);
});
