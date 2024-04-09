// https://firebase.google.com/docs/web/setup#available-libraries

function onSign(
    auth,
    provider
) {
    auth.signInWithRedirect(
        provider
    );
}

function onAuthStateChanged(
    user
) {
    if (user == null) {
        document
            .body
            .style
            .visibility = 'visible';
        return;
    }

    window
        .location
        .href = "createOrder?id=" + user.uid;
}

window.onload = function () {

    const firebaseConfig = {
        apiKey: "AIzaSyB2sJKaPgcsZObdtKPQ-ZI5oSmXapz7OIQ",
        authDomain: "spok-relax-app.firebaseapp.com",
    }

    const app = firebase.initializeApp(
        firebaseConfig
    );

    const auth = app.auth();

    auth.onAuthStateChanged(
        onAuthStateChanged
    );

    let provider = new firebase.auth.OAuthProvider(
        'apple.com'
    );

    provider.addScope('email');
    provider.addScope('name');

    provider.setCustomParameters({
        locale: 'ru'
    });

    document.getElementById('mainDivBtnGet')
        .addEventListener('click', () => {
            onSign(auth, provider);
        });

}