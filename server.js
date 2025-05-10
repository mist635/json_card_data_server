const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const fetch = require("node-fetch");

const app = express();
const PORT = 3001;

app.use(cors({
  origin: "*"
}));
app.use(express.json());

// 保存先フォルダ
const SAVE_DIR = path.join(__dirname, "data");

// フォルダが無ければ作成
if (!fs.existsSync(SAVE_DIR)) {
  fs.mkdirSync(SAVE_DIR);
}

// GitHubへPushする関数
async function pushToGitHub(fileName, jsonContent) {
  const repoOwner = process.env.GITHUB_USER;
  const repoName = process.env.GITHUB_REPO;
  const token = process.env.GITHUB_TOKEN;

  const filePath = `data/${fileName}`;
  const githubApiUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${filePath}`;

  const message = `Add ${fileName}`;
  const content = Buffer.from(jsonContent).toString("base64");

  const response = await fetch(githubApiUrl, {
    method: "PUT",
    headers: {
      Authorization: `token ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message,
      content,
    }),
  });

  const result = await response.json();

  if (response.ok) {
    console.log(`✅ GitHubにPush成功: ${filePath}`);
  } else {
    console.error("❌ GitHubへのPush失敗:", result);
  }
}

// /saveエンドポイント
app.post("/save", async (req, res) => {
  const data = req.body;
  const filename = `form_${Date.now()}.json`;
  const filepath = path.join(SAVE_DIR, filename);

  const jsonContent = JSON.stringify(data, null, 2);

  fs.writeFile(filepath, jsonContent, async (err) => {
    if (err) {
      console.error("保存失敗:", err);
      return res.status(500).json({ success: false });
    }
    console.log("保存成功:", filepath);

    // GitHubへPush
    await pushToGitHub(filename, jsonContent);

    res.json({ success: true, filename });
  });
});

app.listen(PORT, () => {
  console.log(`🚀 サーバー起動中：http://localhost:${PORT}`);
});
