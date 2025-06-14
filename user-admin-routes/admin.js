const express = require("express");
const router = express.Router();
const { passwordValidator, validate } = require("../utils/validators");
const apiSecurity = require("../middlewares/apiSecurity");
const admin = require("firebase-admin");
const db = admin.firestore();

router.post("/create",
  passwordValidator,
  validate,
  apiSecurity(["POST"]),
  async (req, res) =>{
    try{
      const { email, password, displayName, role } = req.body;
      if (!email || !password) {
        res.status(400).json({
          error: "Email and password are required"
        });
        return;
      }
      const userRecord = await admin.auth().createUser({
        email,
        password,
        displayName: displayName || "",
      });
      const token = await admin.auth().createCustomToken(userRecord.uid);
      const creationTime = userRecord.metadata.creationTime;
      const dateObj = new Date(creationTime);
      const createdAtDate = dateObj.toLocaleDateString();
      const createdAtTime = dateObj.toLocaleTimeString();
      
      if (role == 'users') {
        await db.collection("users").doc(userRecord.uid).set({
                email,
                name: displayName,
                role,
                createdAtDate,
                createdAtTime,
              });
      }

      else if (role == 'admin') {
    await db.collection("admin").doc(userRecord.uid).set({
        email,
        name: displayName,
        role,
        createdAtDate,
        createdAtTime,
      });
      }

      

      res.status(201).json({
        success: true,
        secureToken: true,
        user: {
          uid: userRecord.uid,
          email: userRecord.email,
          name: userRecord.displayName,
          createdAt: createdAtDate,
          createdAtTime: createdAtTime
        },
        token
      });
    } catch (error) {
      console.error("Error:", error);
      res.status(400).json({
        error: error.message || "User creation failed",
        code: error.code
      });
    }
  });

// Get all users
router.get(
  "/",
  apiSecurity(["GET"]),
  async (req, res) => {
    try {

      const snapshot = await db.collection("admin").get();

      const users = [];
      snapshot.forEach(doc => {
        users.push({
          id: doc.id,
          name: doc.data().name,
          email: doc.data().email,
          role: doc.data().role
        });
      });

      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ error: error });
    }
  }
);

// Get unique user

router.get(
  "/:id",
  apiSecurity(["GET"]),
  async (req, res) => {
    try {

      const doc = await db.collection("admin").doc(req.params.id).get();

      if (!doc.exists) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json({
        id: doc.id,
        name: doc.data().name,
        email: doc.data().email,
        role: doc.data().role
      });
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ error: error });
    }
  }
);



module.exports = router;