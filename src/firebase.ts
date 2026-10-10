import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBPO8znkRghGAnL9Y9Y81F5fbOEE9JGrv8",
  authDomain: "gd-portfolio-3e9b1.firebaseapp.com",
  projectId: "gd-portfolio-3e9b1",
  storageBucket: "gd-portfolio-3e9b1.firebasestorage.app",
  messagingSenderId: "109462918205",
  appId: "1:109462918205:web:9bb4ae4a98b3f514b7c654",
  measurementId: "G-MT577TY9WW",
  databaseURL: "https://gd-portfolio-3e9b1-default-rtdb.firebaseio.com/"
};

const app = initializeApp(firebaseConfig);

export const db = getDatabase(app);
export const auth = getAuth(app); // Export the auth service