class UserProfileCRUD extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.user = null;
    this.db = null;
  }

  connectedCallback() {
    this.render();
    this.initializeFirebase();
    this.setupEventListeners();
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          font-family: Arial, sans-serif;
        }
        form {
          display: flex;
          flex-direction: column;
          gap: 10px;
          max-width: 300px;
          margin: 20px auto;
        }
        button {
          cursor: pointer;
          padding: 5px 10px;
        }
        #status {
          margin-top: 20px;
          font-weight: bold;
        }
      </style>
      <form id="profileForm">
        <input type="text" id="name" placeholder="Name" required>
        <input type="email" id="email" placeholder="Email" required>
        <input type="tel" id="phone" placeholder="Phone">
        <button type="submit" id="saveBtn">Save Profile</button>
        <button type="button" id="deleteBtn">Delete Profile</button>
      </form>
      <div id="status"></div>
    `;
  }

  initializeFirebase() {
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
    this.db = firebase.firestore();
    const auth = firebase.auth();

    auth.onAuthStateChanged((user) => {
      this.user = user;
      if (user) {
        this.loadUserProfile();
      } else {
        this.showStatus('Please log in to manage your profile.');
      }
    });
  }

  setupEventListeners() {
    const form = this.shadowRoot.getElementById('profileForm');
    const deleteBtn = this.shadowRoot.getElementById('deleteBtn');

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.saveProfile();
    });

    deleteBtn.addEventListener('click', () => {
      this.deleteProfile();
    });
  }

  async loadUserProfile() {
    if (!this.user) return;

    try {
      const docRef = this.db.collection('users').doc(this.user.uid);
      const docSnap = await docRef.get();

      if (docSnap.exists) {
        const data = docSnap.data();
        this.shadowRoot.getElementById('name').value = data.name || '';
        this.shadowRoot.getElementById('email').value = data.email || '';
        this.shadowRoot.getElementById('phone').value = data.phone || '';
        this.showStatus('Profile loaded successfully.');
      } else {
        this.showStatus('No profile found. Create a new one.');
      }
    } catch (error) {
      this.showStatus(`Error loading profile: ${error.message}`);
    }
  }

  async saveProfile() {
    if (!this.user) {
      this.showStatus('Please log in to save your profile.');
      return;
    }

    const name = this.shadowRoot.getElementById('name').value;
    const email = this.shadowRoot.getElementById('email').value;
    const phone = this.shadowRoot.getElementById('phone').value;

    const profileData = {
      name,
      email,
      phone,
      updatedAt: new Date()
    };

    try {
      const docRef = this.db.collection('users').doc(this.user.uid);
      await docRef.set(profileData, { merge: true });
      this.showStatus('Profile saved successfully.');
    } catch (error) {
      this.showStatus(`Error saving profile: ${error.message}`);
    }
  }

  async deleteProfile() {
    if (!this.user) {
      this.showStatus('Please log in to delete your profile.');
      return;
    }

    if (confirm('Are you sure you want to delete your profile?')) {
      try {
        const docRef = this.db.collection('users').doc(this.user.uid);
        await docRef.delete();
        this.shadowRoot.getElementById('profileForm').reset();
        this.showStatus('Profile deleted successfully.');
      } catch (error) {
        this.showStatus(`Error deleting profile: ${error.message}`);
      }
    }
  }

  showStatus(message) {
    const status = this.shadowRoot.getElementById('status');
    status.textContent = message;
  }
}

customElements.define('user-profile-crud', UserProfileCRUD);