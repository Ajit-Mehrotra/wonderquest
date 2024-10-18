import admin from "firebase-admin";
import fs from "fs";

// Read service account key from the secure location
const serviceAccount = JSON.parse(
  fs.readFileSync("./serviceAccountKey.json", "utf-8")
);
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

export default admin;
