var map = L.map('map');
map.setView([46.286, -93.867], 7);
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);



// Add weather radar to the map
var radarUrl = 'https://mesonet.agron.iastate.edu/cgi-bin/wms/nexrad/n0r.cgi';
var radarDisplayOptions = {
  layers: 'nexrad-n0r-900913',
  format: 'image/png',
  transparent: true
};
var radar = L.tileLayer.wms(radarUrl, radarDisplayOptions).addTo(map);

// Get GeoJSON data from the NWS weather alerts API
var weatherAlertsUrl = 'https://api.weather.gov/alerts/active';
$.getJSON(weatherAlertsUrl, function(data) {
  L.geoJSON(data, {
    // Color all alert polygons orange, but color Severe polygons red
    style: function(feature){
      var alertColor = 'orange';
      if (feature.properties.severity === 'Severe') alertColor = 'red';
      return { color: alertColor }
    },
    // Add a popup on each feature showing the NWS alert headline
    onEachFeature: function(feature, layer) {
      layer.bindPopup(feature.properties.headline);
    }
  }).addTo(map);
});

// Add WWA to the map
var wwaUrl = 'https://mesonet.agron.iastate.edu/cgi-bin/wms/us/wwa.cgi?';
var wwaOptions = {
  format: 'image/png',
  transparent: true,
  layers: 'warnings_c'
};
var wwa = L.tileLayer.wms(wwaUrl, wwaOptions).addTo(map);

map.on('contextmenu', function(e) {
  var lat = e.latlng.lat;
  var lng = e.latlng.lng;

  L.popup()
    .setLatLng(e.latlng)
    .setContent('<p>Select the weather impact:</p>' +
                '<input type="radio" name="selectedImpact" value="Tree Down">Tree Down<br>' +
                '<input type="radio" name="selectedImpact" value="Wind Damage">Wind Damage<br>' +
                '<input type="radio" name="selectedImpact" value="Vehicle Spun Out">Vehicle Spun Out<br>' +
                '<input type="radio" name="selectedImpact" value="Tornado Damage">Tornado Damage<br>' +
                '<input type="radio" name="selectedImpact" value="Vehicle Stuck in Snowbank">Vehicle Stuck in Snowbank<br>' +
                '<input type="radio" name="selectedImpact" value="Lightning Strike">Lightning Strike<br>' +
                '<input type="radio" name="selectedImpact" value="Flooding">Flooding<br>' +
                '<input type="radio" name="selectedImpact" value="Power Outage">Power Outage<br>' +
                '<p>Enter a brief comment:</p>' +
                '<input type="text" name="comment"><br><br>' +
                '<button onclick="submitPoint()">Submit</button>')
    .openOn(map);

  function submitPoint() {
    var selectedImpact = document.querySelector('input[name="selectedImpact"]:checked').value;
    var comment = document.getElementsByName('comment')[0].value;

    $.ajax({
      type: 'POST',
      url: 'submit_point.php',
      data: { impact: selectedImpact, comment: comment, lat: lat, lng: lng },
      success: function(data) {
        // Code to handle successful submission
      },
      error: function(xhr, status, error) {
        // Code to handle submission error
      }
    });
  }
});
