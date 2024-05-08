const express = require('express');
const cors = require('cors');
const app = express();
const port = 3001;
const http = require('http').createServer(app);
const io = require('socket.io')(http, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});
// const bodyParser = require('body-parser');

app.use(cors()); // Enable CORS

//setting up firebase
const admin = require("firebase-admin");
const { firestore } = require('firebase-admin');

const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://ridesharing-2c67f-default-rtdb.asia-southeast1.firebasedatabase.app"
});
const db = admin.database();
const firestoreDb = firestore();


io.on('connection', (socket) => {
  console.log('a user connected');
  socket.on('get ride', async (rideId) => {
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
        socket.emit('ride data', locationData);
      }
    });
  });

  socket.on('post feedback', async (rideId, feedback) => {
    const rideRef = db.ref('rides/' + rideId);
    let rideData;
    await rideRef.once('value', (snapshot) => {
      rideData = snapshot.val();
    })
    // Update the ride with the feedback
    rideRef.update({ feedback }, (error) => {
      if (error) {
        socket.emit('feedback error', 'Error updating feedback');
      } else {
        socket.emit('feedback success', 'Feedback updated successfully');
      }
    });

    const rideDocRef = firestoreDb.collection('rides').doc(rideId);
    rideDocRef.set({...rideData, feedback}, {merge:true})
    .then( () => {
      socket.emit('feedback success', 'Feedback updated successfully in Firestore');
    })
    .catch((error) => {
      socket.emit('feedback error', 'Error updating feedback in Firestore');
    })

  });

});

http.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
