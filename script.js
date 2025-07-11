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

loadPlots();
