// https://firebase.google.com/docs/web/setup#available-libraries


function onSign(auth) {
    auth.signInWithPopup(provider)
        .then((result) => {
            let credential = result.credential;
            console.log(credential, result.user);

        }).catch((error) => {
            let errorCode = error.code;
            console.log(error, error.code);
        });
}

window.onload = function () {
    const firebaseConfig = {
        apiKey: "AIzaSyB2sJKaPgcsZObdtKPQ-ZI5oSmXapz7OIQ",
        databaseURL: "https://spok-relax-app.firebaseio.com"
    }

    firebase.initializeApp(
        firebaseConfig
    );

    const auth = firebase.auth();

    let provider = new firebase.auth.OAuthProvider(
        'apple.com'
    );

    provider.addScope(
        'email'
    );

    provider.addScope(
        'name'
    );

    provider.setCustomParameters({
        locale: 'ru'
    });

    document.getElementById('btnSignIn')
        .addEventListener('btnSignIn', () => {
            onSign(auth);
        });

}