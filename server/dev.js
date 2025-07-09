// dev.js
const { app } = require("./lambda");

const PORT = 8000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Local server running at http://0.0.0.0:${PORT}`);
});

