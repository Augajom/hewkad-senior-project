// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore"; // 👈 1. เพิ่มบรรทัดนี้

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAh0iOOx7aERp83Mt9h41mUiAxWyoMcHPE",
  authDomain: "hewkad-live-chat-app.firebaseapp.com",
  projectId: "hewkad-live-chat-app",
  storageBucket: "hewkad-live-chat-app.firebasestorage.app",
  messagingSenderId: "624847098241",
  appId: "1:624847098241:web:618cb51493a273ec3a5880",
  measurementId: "G-WZN3TYY945"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// 
// 
// 
// 
// 👇 2. เพิ่มบรรทัดนี้เพื่อ export 'db' ออกไปให้ไฟล์อื่นใช้
export const db = getFirestore(app);