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
      </style>
      <div id="map"></div>
      <nearby-places></nearby-places>
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
          this.infowindow = new google.maps.InfoWindow();
          const nearbyPlaces = this.shadowRoot.querySelector('nearby-places');
          nearbyPlaces.setLocationAndMap(userLocation, map);
        },
        (error) => {
          console.error('Error getting user location:', error);
        }
      );
    } else {
      console.error('Geolocation is not supported by this browser.');
    }
  }
}

customElements.define('user-location-map', UserLocationMap);