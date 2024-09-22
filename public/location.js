class UserLocationMap extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.render();
        this.loadGoogleMapsAPI();
    }

    render() {
        this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          width: 100%;
          height: 400px;
        }
        #map {
          width: 100%;
          height: 100%;
        }
        #places {
          margin-bottom: 10px;
        }
      </style>
      <div id="places"></div>
      <div id="map"></div>
    `;
    }

    loadGoogleMapsAPI() {
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyBpDg8h68EYDQKlXim3zMliS3Z9_HLaFMM&callback=googleMapsLoaded`;
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);

        window.googleMapsLoaded = () => {
            this.initMap();
        };
    }

    initMap() {
        const mapOptions = {
            zoom: 15,
            center: { lat: 0, lng: 0 },
        };

        const map = new google.maps.Map(this.shadowRoot.getElementById('map'), mapOptions);

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const userLocation = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    };

                    map.setCenter(userLocation);

                    new google.maps.Marker({
                        position: userLocation,
                        map: map,
                        title: 'Your Location',
                    });

                    this.fetchNearbyPlaces(userLocation, map);
                },
                (error) => {
                    console.error('Error getting user location:', error);
                }
            );
        } else {
            console.error('Geolocation is not supported by this browser.');
        }
    }

     async fetchNearbyPlaces(location, map) {
      const placesDiv = this.shadowRoot.getElementById('places');
      placesDiv.innerHTML = '<h3>Nearby Places:</h3>';
    
      const service = new google.maps.places.PlacesService(map);
    
      const request = {
        location: new google.maps.LatLng(location.lat, location.lng),
        radius: '100',
      };
    
      service.nearbySearch(request, (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
          if (results.length > 0) {
            const placesList = document.createElement('ul');
            results.forEach(place => {
              const listItem = document.createElement('li');
              listItem.textContent = place.name;
              placesList.appendChild(listItem);
              this.createMarker(place, map);
            });
            placesDiv.appendChild(placesList);
          } else {
            placesDiv.innerHTML += '<p>No nearby places found.</p>';
          }
        } else {
          console.error('Error fetching nearby places:', status);
          placesDiv.innerHTML += '<p>Error fetching nearby places.</p>';
        }
      });
    }
    
    createMarker(place, map) {
      const placeLoc = place.geometry.location;
      const marker = new google.maps.Marker({
        map: map,
        position: placeLoc,
      });
    
      const infoWindow = new google.maps.InfoWindow();
    
      google.maps.event.addListener(marker, 'click', function () {
        infoWindow.setContent(place.name);
        infoWindow.open(map, marker);
      });
    }
}

customElements.define('user-location-map', UserLocationMap);