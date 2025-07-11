// Import the functions from Firebase Modular SDK
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCLldNdHTfWzARUOr2fOKjyNZKupFre1aQ",
  authDomain: "geoestate-5f083.firebaseapp.com",
  projectId: "geoestate-5f083",
  storageBucket: "geoestate-5f083.appspot.com", // ✅ Fixed ".app" to ".com"
  messagingSenderId: "574587955628",
  appId: "1:574587955628:web:41de528cd618f03761b209",
  measurementId: "G-F0STEWZN4G"
};

// Initialize Firebase and modules
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);

// SheetDB URL (replace with actual)
const sheetdbUrl = "https://sheetdb.io/api/v1/YOUR_SHEETDB_URL";

// Setup map (Leaflet)
var map = L.map("map").setView([20.5937, 78.9629], 5);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap contributors",
}).addTo(map);

// Draw controls
var drawnItems = new L.FeatureGroup();
map.addLayer(drawnItems);

var drawControl = new L.Control.Draw({
  draw: {
    polygon: true,
    polyline: false,
    rectangle: false,
    circle: false,
    marker: false,
    circlemarker: false,
  },
  edit: {
    featureGroup: drawnItems,
  },
});
map.addControl(drawControl);

var currentDrawnLayer = null;
map.on(L.Draw.Event.CREATED, function (e) {
  drawnItems.clearLayers();
  currentDrawnLayer = e.layer;
  drawnItems.addLayer(currentDrawnLayer);
});

// Submit form
document.getElementById("property-form").addEventListener("submit", function (e) {
  e.preventDefault();

  if (!currentDrawnLayer) {
    alert("Please draw a plot on the map first.");
    return;
  }

  var name = document.getElementById("name").value;
  var owner = document.getElementById("owner").value;
  var price = document.getElementById("price").value;
  var area = document.getElementById("area").value;
  var description = document.getElementById("description").value;
  var coords = currentDrawnLayer.toGeoJSON().geometry.coordinates;
  var coordsString = JSON.stringify(coords);

  var data = {
    data: [{
      Name: name,
      Owner: owner,
      Price: price,
      Area: area,
      Description: description,
      Coordinates: coordsString,
    }],
  };

  fetch(sheetdbUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
    .then((res) => res.json())
    .then(() => {
      alert("Plot submitted!");
      currentDrawnLayer = null;
      document.getElementById("property-form").reset();
      loadPlots();
    })
    .catch((err) => alert("Error: " + err));
});

// Load existing plots
function loadPlots() {
  fetch(sheetdbUrl)
    .then((res) => res.json())
    .then((rows) => {
      document.getElementById("plot-list").innerHTML = "";
      drawnItems.clearLayers();

      rows.forEach((row) => {
        var coords = JSON.parse(row.Coordinates);
        var latlngs = coords[0].map((pt) => [pt[1], pt[0]]);
        var polygon = L.polygon(latlngs, { color: "blue" }).addTo(drawnItems);

        var item = document.createElement("div");
        item.style.padding = "5px";
        item.style.cursor = "pointer";
        item.innerHTML = `<strong>${row.Name}</strong> – ₹${row.Price} – ${row.Area} sq ft`;
        item.onclick = () => map.fitBounds(polygon.getBounds());
        document.getElementById("plot-list").appendChild(item);
      });
    });
}

loadPlots();

// Handle login
function loginUser() {
  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;

  signInWithEmailAndPassword(auth, email, password)
    .then(() => {
      document.getElementById("login-status").innerText = "Login successful!";
      document.getElementById("property-form").style.display = "block";
      document.getElementById("login-box").style.display = "none";
    })
    .catch((error) => {
      document.getElementById("login-status").innerText = "Login failed.";
    });
}

// Auth state observer
onAuthStateChanged(auth, (user) => {
  if (user) {
    document.getElementById("property-form").style.display = "block";
    document.getElementById("login-box").style.display = "none";
    document.getElementById("loginModal").style.display = "none";
  } else {
    document.getElementById("property-form").style.display = "none";
    document.getElementById("login-box").style.display = "block";
    document.getElementById("loginModal").style.display = "flex";
  }
});
