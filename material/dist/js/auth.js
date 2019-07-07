var cognitoUser = undefined;
var currentSession = undefined;
var accessToken = undefined;

const categoriesApiBasePath = "https://g8335hfcy0.execute-api.eu-central-1.amazonaws.com/dev";
const locationsApiBasePath = "https://6mo2qzbcag.execute-api.eu-central-1.amazonaws.com/dev"

function isLoggedIn() {
    var data = {
        UserPoolId: 'eu-central-1_7iruUqdsk',
        ClientId: '3gbfhl35avtb3uop6o5scbd0sd'
    };
    var userPool = new AmazonCognitoIdentity.CognitoUserPool(data);
    cognitoUser = userPool.getCurrentUser();

    if (cognitoUser != null) {
        cognitoUser.getSession(function (err, session) {
            if (err || !session.isValid()) {
                $(location).attr("href", "pages-login.html");
                return;
            }
            console.log('session validity: ' + session.isValid());
            console.log("Session:", session);
            currentSession = session;
            accessToken = session.idToken.jwtToken;
        });
    } else {
        $(location).attr("href", "pages-login.html");
    }
}

isLoggedIn();

$("#logout").on("click", () => {
    if (cognitoUser != null) {
        cognitoUser.signOut();
        $(location).attr("href", "pages-login.html");
    }
});