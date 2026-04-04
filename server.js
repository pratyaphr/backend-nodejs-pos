import dotenv from "dotenv";
import app from "./src/app.js";

dotenv.config();

app.listen(5000, () => {
  console.log("Server running on port 5000");
});
