import React, { useState, useEffect } from "react";
import { getAuth, signOut } from "firebase/auth";
import ridesData from './rides.json';
import { v4 as uuidv4 } from 'uuid';
import {  ref, set, remove, get } from "firebase/database";
import {db} from "./firebase"
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import RideDataCard from "./rideDataCard";
import { database } from "./firebase";
async function generateLink(rideDetails) {
    try {
      const rideId = uuidv4();
      const newRideRef = ref(db, 'rides/' + rideId);
      await set(newRideRef, rideDetails);
      const rideUrl = `http://localhost:3000/ride/${rideId}`;
      return rideUrl;
    } catch (error) {
      console.error("Error generating link: ", error);
    }
  }


function Traveler(user) {
    const logout = () => {
        const auth = getAuth();
        signOut(auth).then(() => {
        }).catch((error) => {
        });
    };

    const [bookRide, setBookRide] = useState(false);
    const handleBookRide = () =>{
        setBookRide(true);
    }

    const [reviewRide, setReviewRide] = useState([]);
    const [showReview, setShowReview] = useState(false);
    const handleReviewRide = async () => {
      const ridesRef = ref(db,'rides');
      let rideArray = [];
      await get(ridesRef).then((snapshot) => {
        snapshot.forEach(element => {
          const rideData = element.val();
          const rideId = element.key;
          rideArray.push({id: rideId, ...rideData});
        });
      })
      setReviewRide(rideArray);
      setShowReview(true);
  }
  
    return (
        <div> 
            <button style={{margin:'3px'}} onClick={handleBookRide}>Book a ride</button>
            {bookRide && <BookRide/>}
            <button onClick={handleReviewRide}> Review ride</button>
            {showReview && <ReviewRide data ={reviewRide} />}
            <button style={{backgroundColor: 'red', margin:'3px'}} onClick= {logout}> LogOut</button>
        </div>
    );
}


function BookRide() {
  const [rides, setRides] = useState([]);
  const [link, setLink] = useState();
  const [showLink, setShowLink] = useState(false);
  const [linkId, setLinkId] = useState();
  //console.log(ridesData);
  // inserting the ride details form rides.json in the rides array
  useEffect(() => {
      setRides(ridesData);
  }, []);

  // selectedRide will store the ride which is selected by the user.
  const [selectedRide, setSelectedRide] = useState(null);

  const handleStartRide = async (ride) => {
    try {
      setSelectedRide(ride);
      const rideLink = await generateLink(ride);
      // seperating the linkId form the generated ridelink and storing it in rideId variable
      let parts = rideLink.split('/');
      const rideId = parts[parts.length - 1];
      setLink(rideLink);
      setLinkId(rideId);
      setShowLink(true);

      // Start watching the user's position
      if (navigator.geolocation) {
        navigator.geolocation.watchPosition((position) => {
          const { latitude, longitude } = position.coords;
          const locationRef = ref(db, 'locations/' + rideId);
          set(locationRef, { latitude, longitude });
        });
      } else {
        console.log("Geolocation is not supported by this browser.");
      }
    } catch (error) {
      console.error("Error in handleStartRide: ", error);
    }
  }
  const [location, setLocation] = useState(null);
  

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.watchPosition((position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      });
    }
  }, []);

 

  async function deleteRide(rideId) {
    try {
      const rideRef = ref(db, 'rides/' + rideId);
      await remove(rideRef);
    } catch (error) {
      console.error("Error deleting ride: ", error);
    }
  }

  // Call deleteRide function when the journey is complete
  const handleCompleteRide = async () => {
    try {
      await deleteRide(linkId);
      setShowLink(false);
      setSelectedRide(null);
    } catch (error) {
      console.error("Error in handleCompleteRide: ", error);
    }
  };
  const shareOnWhatsApp = (shareLink) => {
      const text = `Hey, You can track my ride here: ${shareLink}`;
      const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
      window.open(url, '_blank');
  };


// Add a button to complete the ride
  return (
      <div style={{margin:'10px',  padding:'10px' , border: '2px solid'}}>
        {!showLink && 
          rides.map((ride) => (
            <div style={{border:'1px double', margin:'5px', padding:'3px'}} key={ride.id}>
                <p>{ride.name} - {ride.location}</p>
                <button style={{backgroundColor:'green'}} onClick={() => handleStartRide(ride)}>Start Ride</button>
            </div>
        ))
        }
        {showLink && <button style={{backgroundColor: 'green'}} onClick = {() => shareOnWhatsApp(link)}>Share on WhatsApp</button>}
        {/* {showLink && <Link to={`/ride/${linkId}`}>Start Ride</Link>} */}
        {showLink && location && selectedRide && (
          <MapContainer center={[location.latitude, location.longitude]} zoom={13} style={{ height: "400px", width: "100%" }}>
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='© <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            />
            <Marker position={[location.latitude, location.longitude]} />
            {selectedRide.destination && <Marker position={[selectedRide.destination.latitude, selectedRide.destination.longitude]} />}
          </MapContainer>
        )}          
        {showLink && <button onClick={handleCompleteRide}>Complete Ride</button>}
      </div>
  );
}

function ReviewRide ( {data} ) {
  return (
    <div>
      {data.map( (val, index) => (
        <RideDataCard key={index} data={val} />
      ))}
    </div>
  )
}


export default Traveler;