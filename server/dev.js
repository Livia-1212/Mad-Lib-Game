// dev.js
const { app } = require("./lambda");

const PORT = 8000;
app.listen(PORT, () => {
  console.log(`🚀 Local server running at http://localhost:${PORT}`);
});
