import React from "react";

function RideDataCard({data}) {

      return (
        <div style={{ border: '1px solid black', margin: '10px', padding: '10px' }}>
          <p>Trip ID : - {data.tripID}</p>
          <p>Driver Name: - {data.driverName}</p>
          <p>Driver Ph : - {data.driverPhoneNumber}</p>
          <p>Cab Number : - {data.cabNumber}</p>
          <p>Feedback : - {data.feedback}</p>
          <p>Status :- {data.status}</p>
        </div>
      );
  }

  export default RideDataCard;