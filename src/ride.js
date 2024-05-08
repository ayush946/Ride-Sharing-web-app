import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import io from 'socket.io-client';

function Ride() {
  const { rideId } = useParams();
  const [rideDetails, setRideDetails] = useState(null);
  const [location, setLocation] = useState(null);
  const [feedback, setFeedback] = useState('');
  const socket = io('http://localhost:3001');

  useEffect(() => {
    socket.emit('get ride', rideId);
    socket.on('ride data', (data) => {
      setRideDetails(data.rideInfo);
      setLocation({latitude: data.latitude, longitude: data.longitude});

      // Calculate distance to destination
    const distance = getDistanceFromLatLonInKm(
      data.latitude, 
      data.longitude, 
      data.rideInfo.destination.latitude, 
      data.rideInfo.destination.longitude
    );

    // Show notifications based on distance
    if (distance < 0.1) {
      alert('Ride complete');
    } else if (distance < 1) {
      alert('Getting close to destination');
    }
    });
  }, [rideId, socket]);

  const handleFeedbackSubmit = async () => {
    socket.emit('post feedback', rideId, feedback);
    socket.on('feedback success', (message) => {
      alert(message);
    });
    socket.on('feedback error', (message) => {
      console.error(message);
    });
  };

  if (!rideDetails || !location) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Ride Details</h1>
      <p>Trip ID: {rideDetails.tripID}</p>
      <p>Driver Name: {rideDetails.driverName}</p>
      <p>Driver Phone Number: {rideDetails.driverPhoneNumber}</p>
      <p>Cab Number: {rideDetails.cabNumber}</p>
      <h2>Live Location</h2>
      <p>Latitude: {location.latitude}</p>
      <p>Longitude: {location.longitude}</p>
      <MapContainer center={[location.latitude, location.longitude]} zoom={13} style={{ height: "400px", width: "100%" }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='© <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        />
        <Marker position={[location.latitude, location.longitude]} />
        {rideDetails.destination && <Marker position={[rideDetails.destination.latitude, rideDetails.destination.longitude]} />}
      </MapContainer>
      <h2>Submit Feedback</h2>
      <textarea value={feedback} onChange={e => setFeedback(e.target.value)} />
      <button onClick={handleFeedbackSubmit}>Submit Feedback</button>
    </div>
  );
}
   

function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1); 
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
  ; 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  const d = R * c; // Distance in km
  return d;
}

function deg2rad(deg) {
  return deg * (Math.PI/180)
}


export default Ride;
