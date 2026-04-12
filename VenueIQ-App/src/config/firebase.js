import { initializeApp } from 'firebase/app'
import { getAnalytics } from 'firebase/analytics'
import { getDatabase, ref, set, onValue } from 'firebase/database'

const firebaseConfig = {
  apiKey: "AIzaSyDemo-VenueIQ-Key",
  authDomain: "venueiq-demo.firebaseapp.com",
  databaseURL: "https://venueiq-demo-default-rtdb.firebaseio.com",
  projectId: "venueiq-demo",
  storageBucket: "venueiq-demo.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:venueiq"
}

export const app = initializeApp(firebaseConfig)
export const db = getDatabase(app)
export { ref, set, onValue }
