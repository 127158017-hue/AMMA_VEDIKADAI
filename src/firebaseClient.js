import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCOIGoFUcsz41VTrHfiTO17EOAKrD2GpEk",
  authDomain: "vedikadai-67de8.firebaseapp.com",
  projectId: "vedikadai-67de8",
  storageBucket: "vedikadai-67de8.firebasestorage.app",
  messagingSenderId: "1247924804",
  appId: "1:1247924804:web:b9cd7d92178712f58ee211",
  measurementId: "G-94K6YKYS5E"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const storage = getStorage(app);
