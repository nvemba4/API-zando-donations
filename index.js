const admin = require("firebase-admin");
const express = require("express");
const bodyParser = require('body-parser');
const cors = require("cors");
const port = 4000;

// Importa e inicializa
// require("./config/firebase-config");


 const serviceAccount = require("../functions/config/zandosoci-projecto-firebase.json");  
 admin.initializeApp({
     credential: admin.credential.cert(serviceAccount),

 });

 const app = express();
// call routes
const userRoutes = require("./user-admin-routes/users");
const adminRoutes = require("./user-admin-routes/admin");
const donationsRoutes = require('./routes/donationsRouter');
const updateDonationStatusTransitionRoutes = require('./routes/routeUpdateTransitionDonationStatus');
const authRoutes = require('./routes/auth');
const distributionCenterRoutes = require("./routes/distributionCentersRoutes");
const storeRoutes = require('./routes/storeRoutes');
const logsRoutes = require('./routes/status-logsRoutes ');

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Content-Type");
    next();
});

app.use(cors({ origin: true }));
app.use(express.json());
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));


app.get("/hello", (req, res) => {
    return res.status(200).send("Firebase connection is working");
});

app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/donations", donationsRoutes);
app.use('/api/auth', authRoutes);
// updateDonationsTransitionRoutes
app.use('/api/updateDonationStatus', updateDonationStatusTransitionRoutes);
app.use('/api/center', distributionCenterRoutes);
app.use('/api/stores', storeRoutes);
app.use("/api/logs", logsRoutes);


















// app.use((err, req, res, next) => {
//   console.error(err.stack);
//   res.status(500).json({ success: false, message: err.stack });
// });

 app.listen(port, "0.0.0.0", () => {
     console.log(`Express server running on http://localhost:${port}`);
 });

//  module.exports = app;





// http://10.0.2.2:3000/restaurants/
// Export to Firebase Cloud Functions
//  exports.app = functions.https.onRequest(app);