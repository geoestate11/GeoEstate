function initMap() {
  const center = { lat: 28.7041, lng: 77.1025 };

  const map = new google.maps.Map(document.getElementById("map"), {
    zoom: 17,
    center: center,
    mapTypeId: "satellite"
  });

  // Fake parcel polygon
  const parcelCoords = [
    { lat: 28.7041, lng: 77.1025 },
    { lat: 28.7041, lng: 77.1030 },
    { lat: 28.7045, lng: 77.1030 },
    { lat: 28.7045, lng: 77.1025 }
  ];

  const parcel = new google.maps.Polygon({
    paths: parcelCoords,
    strokeColor: "#00FF00",
    strokeOpacity: 0.8,
    strokeWeight: 2,
    fillColor: "#00FF00",
    fillOpacity: 0.35
  });

  parcel.setMap(map);

  const infoWindow = new google.maps.InfoWindow({
    content: "<strong>701 Fairview Ave NE</strong><br>Owner: John Doe<br>Status: For Sale"
  });

  parcel.addListener("click", (event) => {
    infoWindow.setPosition(event.latLng);
    infoWindow.open(map);
  });
}
