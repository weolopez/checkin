class GoogleAuth extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.shadowRoot.innerHTML = `
      <style>
        body {
          font-family: Arial, sans-serif;
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          background-color: #f0f0f0;
        }
        #login-container {
          text-align: center;
        }
        button {
          background-color: #4285f4;
          color: white;
          padding: 10px 20px;
          border: none;
          cursor: pointer;
          border-radius: 5px;
          font-size: 16px;
          display: flex;
          align-items: center;
        }
        button img {
          margin-right: 10px;
        }
        button:hover {
          background-color: #357ae8;
        }
        #user-info {
          margin-top: 20px;
        }
      </style>
      <div id="login-container">
        <button id="auth-btn">
          <img id="auth-img" src="" alt="Google Logo" style="width:20px; height:20px;">
          <span id="auth-text">Sign in with Google</span>
        </button>
        <div id="user-info"></div>
      </div>
    `;

    // TODO: Replace with your Firebase project configuration
    const firebaseConfig = {
      apiKey: "AIzaSyBOZUIb8LKPJv3udiZ92JptEKaKZtdYWSc",
      authDomain: "checkin-c8c02.firebaseapp.com",
      projectId: "checkin-c8c02",
      storageBucket: "checkin-c8c02.appspot.com",
      messagingSenderId: "462952736399",
      appId: "1:462952736399:web:1f70b38b279f32adc8b2fa",
      measurementId: "G-QY8348LGG7"
    };

    // Initialize Firebase
    firebase.initializeApp(firebaseConfig);

    // Google authentication provider
    const provider = new firebase.auth.GoogleAuthProvider();

    // Get the Auth instance
    const auth = firebase.auth();

    // Set persistence to LOCAL
    auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL)
      .then(() => {
        const authBtn = this.shadowRoot.getElementById('auth-btn');
        const authImg = this.shadowRoot.getElementById('auth-img');
        const authText = this.shadowRoot.getElementById('auth-text');

        // Handle sign-in with popup
        authBtn.addEventListener('click', () => {
          if (auth.currentUser) {
            auth.signOut().then(() => {
              console.log('User signed out');
            }).catch((error) => {
              console.error('Sign out error:', error);
            });
          } else {
            auth.signInWithPopup(provider)
              .then((result) => {
                console.log('Sign-in result:', result); // Log the result object
              })
              .catch((error) => {
                // Handle Errors here.
                const errorCode = error.code;
                const errorMessage = error.message;
                alert(`Error: ${errorMessage} (Code: ${errorCode})`);
              });
          }
        });

        // Listen for authentication state changes
        auth.onAuthStateChanged((user) => {
          if (user) {
            // User is signed in
            authImg.src = user.photoURL;
            authText.textContent = 'Logout';
            this.shadowRoot.getElementById('user-info').innerHTML = `
              <p>Welcome, ${user.displayName}!</p>
              <p>Email: ${user.email}</p>
            `;
          } else {
            // User is signed out
            authImg.src = 'https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg';
            authText.textContent = 'Sign in with Google';
            this.shadowRoot.getElementById('user-info').innerHTML = '';
          }
        });
      })
      .catch((error) => {
        console.error('Error setting persistence:', error);
      });
  }
}

customElements.define('google-auth', GoogleAuth);