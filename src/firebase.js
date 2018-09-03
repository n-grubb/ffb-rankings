import firebase from 'firebase';

const config = {
    apiKey: "AIzaSyDssn4mJkRK5eqWjJdOxYbmxwZFnoebNLI",
    authDomain: "ffb-rankings.firebaseapp.com",
    databaseURL: "https://ffb-rankings.firebaseio.com",
    projectId: "ffb-rankings",
    storageBucket: "ffb-rankings.appspot.com",
    messagingSenderId: "184722492632"
};
firebase.initializeApp(config);

export const provider = new firebase.auth.GoogleAuthProvider();
export const auth = firebase.auth();
export default firebase;