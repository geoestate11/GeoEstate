// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCLldNdHTfWzARUOr2fOKjyNZKupFre1aQ",
  authDomain: "geoestate-5f083.firebaseapp.com",
  projectId: "geoestate-5f083",
  storageBucket: "geoestate-5f083.firebasestorage.app",
  messagingSenderId: "574587955628",
  appId: "1:574587955628:web:41de528cd618f03761b209",
  measurementId: "G-F0STEWZN4G"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
// Your Firebase config
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
var sheetdbUrl = "https://sheetdb.io/api/v1/YOUR_SHEETDB_URL"; // replace with yours

// Setup map
var map = L.map("map").setView([20.5937, 78.9629], 5); // Center on India

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap contributors",
}).addTo(map);

// Add draw controls
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

// Store latest drawn polygon
var currentDrawnLayer = null;

map.on(L.Draw.Event.CREATED, function (e) {
  drawnItems.clearLayers(); // allow only one
  currentDrawnLayer = e.layer;
  drawnItems.addLayer(currentDrawnLayer);
});

// Handle form submission
document
  .getElementById("property-form")
  .addEventListener("submit", function (e) {
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
      data: [
        {
          Name: name,
          Owner: owner,
          Price: price,
          Area: area,
          Description: description,
          Coordinates: coordsString,
        },
      ],
    };

    fetch(sheetdbUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((res) => res.json())
      .then(() => {
        alert("Plot submitted!");
        currentDrawnLayer = null;
        document.getElementById("property-form").reset();
        loadPlots(); // refresh
      })
      .catch((err) => alert("Error: " + err));
  });

// Load all saved plots
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

loadPlots();function loginUser() {
  var email = document.getElementById("login-email").value;
  var password = document.getElementById("login-password").value;

  firebase.auth().signInWithEmailAndPassword(email, password)
    .then((userCredential) => {
      document.getElementById("login-status").innerText = "Login successful!";
      document.getElementById("property-form").style.display = "block";
      document.getElementById("login-box").style.display = "none";
    })
    .catch((error) => {
      document.getElementById("login-status").innerText = "Login failed.";
    });
}

firebase.auth().onAuthStateChanged((user) => {
  if (user) {
    document.getElementById("property-form").style.display = "block";
    document.getElementById("login-box").style.display = "none";
  } else {
    document.getElementById("property-form").style.display = "none";
    document.getElementById("login-box").style.display = "block";
  }
});
// Your Firebase config
const firebaseConfig = {
  apiKey: "PASTE_YOUR_API_KEY",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "xxxxxxxxxxx",
  appId: "xxxxxxxxxxxxxxxxxxxx"
};

firebase.initializeApp(firebaseConfig);

// Handle login
function login() {
  const email = document.querySelector('input[type="email"]').value;
  const password = document.querySelector('input[type="password"]').value;

  firebase.auth().signInWithEmailAndPassword(email, password)
    .then((userCredential) => {
      document.getElementById("loginModal").style.display = "none";
    })
    .catch((error) => {
      document.getElementById("loginError").innerText = "Login failed: " + error.message;
    });
}

// Auto-hide login modal if already logged in
firebase.auth().onAuthStateChanged((user) => {
  if (user) {
    document.getElementById("loginModal").style.display = "none";
  } else {
    document.getElementById("loginModal").style.display = "flex";
  }
});

