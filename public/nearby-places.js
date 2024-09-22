class NearbyPlaces extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.render();
  }

  connectedCallback() {
    this.initMap();
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        #map {
          height: 400px;
          width: 100%;
        }
        #results {
          margin-top: 20px;
        }
      </style>
      <h1>Find Nearby Businesses</h1>
      <div id="map"></div>
      <div id="results"></div>
    `;
  }

  initMap() {
    let map, service, infowindow;

    // Get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const userLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };

        // Initialize the map centered at the user's location
        map = new google.maps.Map(this.shadowRoot.getElementById('map'), {
          center: userLocation,
          zoom: 15
        });

        // Create an InfoWindow to display place details
        infowindow = new google.maps.InfoWindow();

        // Create a PlacesService instance attached to the map
        service = new google.maps.places.PlacesService(map);

        // Search for nearby places (e.g., restaurants within a 500m radius)
        const request = {
          location: userLocation,
          radius: '5000', // Search radius in meters
          type: ['restaurant'] // Type of place to search for
        };

        // Perform a nearby search
        service.nearbySearch(request, (results, status) => {
          this.handleSearchResults(results, status, map, infowindow);
        });
      }, () => {
        this.handleLocationError(true, map);
      });
    } else {
      this.handleLocationError(false, map);
    }
  }

  handleSearchResults(results, status, map, infowindow) {
    const resultsContainer = this.shadowRoot.getElementById('results');

    if (status === google.maps.places.PlacesServiceStatus.OK) {
      resultsContainer.innerHTML = '<h2>Nearby Restaurants:</h2>';
      results.forEach((place) => {
        this.createMarker(place, map, infowindow);
        resultsContainer.innerHTML += `<p><strong>${place.name}</strong>: ${place.vicinity}</p>`;
      });
    } else {
      resultsContainer.innerHTML = '<p>No places found nearby.</p>';
    }
  }

  createMarker(place, map, infowindow) {
    const marker = new google.maps.Marker({
      map: map,
      position: place.geometry.location
    });

    // Add click listener to display place details in an InfoWindow
    google.maps.event.addListener(marker, 'click', function() {
      infowindow.setContent(place.name + '<br>' + place.vicinity);
      infowindow.open(map, this);
    });
  }

  handleLocationError(browserHasGeolocation, map) {
    const defaultLocation = { lat: 33.774830, lng: -84.296310 };
    map = new google.maps.Map(this.shadowRoot.getElementById('map'), {
      center: defaultLocation,
      zoom: 15
    });
    alert(browserHasGeolocation ? 
      'Error: The Geolocation service failed.' : 
      'Error: Your browser doesn\'t support geolocation.');
  }
}

customElements.define('nearby-places', NearbyPlaces);