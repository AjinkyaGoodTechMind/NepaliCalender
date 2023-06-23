const app = require("./app");
const connectDatabase = require("./config/database");

//Config
if (process.env.NODE_ENV !== "PRODUCTION") {
  require("dotenv").config({ path: "./config/config.env" });
}

//Connecting to database
connectDatabase();

const PORT = process.env.PORT || 4000;

const server = app.listen(PORT, () => {
  console.log(`Server is working on http://localhost:${PORT}`);
});
