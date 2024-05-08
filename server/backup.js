const express = require('express');
const cors = require('cors');
const app = express();
const port = 3001;

const bodyParser = require('body-parser');
app.use(cors()); // Enable CORS

//setting up firebase

const admin = require("firebase-admin");

const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://ridesharing-2c67f-default-rtdb.asia-southeast1.firebasedatabase.app"
});
const db = admin.database();




app.get('/ride/:rideId', async (req, res) => {
  const { rideId } = req.params;
  const locationRef = db.ref('locations/' + rideId);
  const rideRef = db.ref('rides/' + rideId);

  let rideData;
  let locationData;

  // Fetch ride data
  await rideRef.once('value', (snapshot) => {
    rideData = snapshot.val();
  });

  // Fetch location data and attach ride data
  locationRef.on('value', (snapshot) => {
    locationData = snapshot.val();
    if (locationData) {
      locationData.rideInfo = rideData; // Attach ride data to location data
      res.json(locationData);
      console.log(locationData);
    } else {
      res.status(404).send('Location not found');
    }
  }, (errorObject) => {
    console.log("The read failed: " + errorObject.name);
    res.status(500).send('Error reading location data');
  });
});


app.use(bodyParser.json()); // for parsing application/json

app.post('/ride/:rideId/feedback', async (req, res) => {
  const { rideId } = req.params;
  const { feedback } = req.body;
  const rideRef = db.ref('rides/' + rideId);
  
  // Update the ride with the feedback
  rideRef.update({ feedback }, (error) => {
    if (error) {
      res.status(500).send('Error updating feedback');
    } else {
      res.send('Feedback updated successfully');
    }
  });
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
