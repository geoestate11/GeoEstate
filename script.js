// ✅ Firebase config and initialization
const firebaseConfig = {
  apiKey: "AIzaSyCLldNdHTfWzARUOr2fOKjyNZKupFre1aQ",
  authDomain: "geoestate-5f083.firebaseapp.com",
  projectId: "geoestate-5f083",
  storageBucket: "geoestate-5f083.appspot.com",
  messagingSenderId: "574587955628",
  appId: "1:574587955628:web:41de528cd618f03761b209",
  measurementId: "G-F0STEWZN4G",
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

// ✅ SheetDB API (replace with your real SheetDB URL)
const sheetdbUrl = "https://sheetdb.io/api/v1/YOUR_SHEETDB_URL";

// ✅ Initialize Leaflet map
const map = L.map("map").setView([20.5937, 78.9629], 5);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap contributors",
}).addTo(map);

// ✅ Drawing control
const drawnItems = new L.FeatureGroup();
map.addLayer(drawnItems);

const drawControl = new L.Control.Draw({
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

let currentDrawnLayer = null;

map.on(L.Draw.Event.CREATED, function (e) {
  drawnItems.clearLayers(); // Only one plot at a time
  currentDrawnLayer = e.layer;
  drawnItems.addLayer(currentDrawnLayer);
});

// ✅ Form submission
function handleFormSubmit(e) {
  e.preventDefault();

  if (!currentDrawnLayer) {
    alert("Please draw a plot on the map first.");
    return;
  }

  const name = document.getElementById("name").value;
  const owner = document.getElementById("owner").value;
  const price = document.getElementById("price").value;
  const area = document.getElementById("area").value;
  const description = document.getElementById("description").value;
  const coords = currentDrawnLayer.toGeoJSON().geometry.coordinates;
  const coordsString = JSON.stringify(coords);

  const data = {
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
    .then(res => res.json())
    .then(() => {
      alert("Plot submitted!");
      currentDrawnLayer = null;
      document.getElementById("property-form").reset();
      loadPlots();
    })
    .catch((err) => {
      alert("Error submitting data: " + err.message);
    });
}

// ✅ Load and display plots
function loadPlots() {
  fetch(sheetdbUrl)
    .then(res => res.json())
    .then(rows => {
      const plotList = document.getElementById("plot-list");
      plotList.innerHTML = "";
      drawnItems.clearLayers();

      rows.forEach((row) => {
        if (!row.Coordinates) return;
        try {
          const coords = JSON.parse(row.Coordinates);
          const latlngs = coords[0].map(pt => [pt[1], pt[0]]);
          const polygon = L.polygon(latlngs, { color: "blue" }).addTo(drawnItems);

          const item = document.createElement("div");
          item.style.padding = "5px";
          item.style.cursor = "pointer";
          item.innerHTML = `<strong>${row.Name}</strong> – ₹${row.Price} – ${row.Area} sq ft`;
          item.onclick = () => map.fitBounds(polygon.getBounds());
          plotList.appendChild(item);
        } catch (e) {
          console.warn("Invalid plot coordinates", e);
        }
      });
    })
    .catch((err) => {
      console.error("Failed to load plots:", err);
    });
}

// ✅ Login
function loginUser() {
  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;

  auth.signInWithEmailAndPassword(email, password)
    .then(() => {
      document.getElementById("login-status").innerText = "Login successful!";
      showAppUI(true);
    })
    .catch((error) => {
      document.getElementById("login-status").innerText = "Login failed: " + error.message;
    });
}

// ✅ Show/hide app based on login state
function showAppUI(isLoggedIn) {
  const loginModal = document.getElementById("loginModal");
  const loginBox = document.getElementById("login-box");
  const form = document.getElementById("property-form");

  if (form) form.style.display = isLoggedIn ? "block" : "none";
  if (loginBox) loginBox.style.display = isLoggedIn ? "none" : "block";
  if (loginModal) loginModal.style.display = isLoggedIn ? "none" : "flex";
}

// ✅ Handle auth state
document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("property-form");
  if (form) form.addEventListener("submit", handleFormSubmit);

  auth.onAuthStateChanged((user) => {
    showAppUI(!!user);
  });

  // Optional: Enter key submits login
  const emailInput = document.getElementById("login-email");
  const passInput = document.getElementById("login-password");
  if (emailInput && passInput) {
    emailInput.addEventListener("keydown", (e) => { if (e.key === "Enter") loginUser(); });
    passInput.addEventListener("keydown", (e) => { if (e.key === "Enter") loginUser(); });
  }

  loadPlots();
});
