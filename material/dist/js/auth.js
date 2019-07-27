var cognitoUser = undefined;
var currentSession = undefined;
var accessToken = undefined;

const authApiBasePath = "https://ommkdunauc.execute-api.eu-central-1.amazonaws.com/dev";
const categoriesApiBasePath = "https://g8335hfcy0.execute-api.eu-central-1.amazonaws.com/dev";
const locationsApiBasePath = "https://6mo2qzbcag.execute-api.eu-central-1.amazonaws.com/dev"
const providersApiBasePath = "https://sclx4kb3lk.execute-api.eu-central-1.amazonaws.com/dev";
const reviewsApiBasePath = "https://2nhq1hidx6.execute-api.eu-central-1.amazonaws.com/dev";
const quotesApiBasePath = "https://z75j3glj94.execute-api.eu-central-1.amazonaws.com/dev";
const usersApiBasePath = "https://ommkdunauc.execute-api.eu-central-1.amazonaws.com/dev";

function isLoggedIn() {

    // Check if token is still valid
    var token;

    try {
        token = JSON.parse(localStorage.getItem("idToken")).jwtToken;
    } catch (error) {
        console.error(error);
        $(location).attr("href", "pages-login.html");
    }
    $.ajax({
        method: "POST",
        url: `${authApiBasePath}/verifyToken`,
        contentType: "application/json",
        dataType: "json",
        cache: false,
        data: JSON.stringify({
            token: token
        })
    })
        .done((data, textStatus, jqXHR) => {
            console.log("Text Status:", textStatus);
            console.log("Data:", data);
            console.log("jqXHR:", jqXHR);
            // All good, nothing to do here
        })
        .fail((jqXHR, textStatus, errorThrown) => {
            console.error("jqXHR:", jqXHR);
            console.error("Text Status:", textStatus);
            console.error("Error Thrown:", errorThrown);
            $(location).attr("href", "pages-login.html&message=" + encodeURI(testStatus));
        });
}

function updateTokens(data) {
    // Id token
    var idToken = localStorage.getItem("idToken");
    idToken.jwtToken = data.idToken;
    localStorage.setItem("idToken", JSON.stringify(idToken));

    // Access token
    var accessToken = localStorage.getItem("accessToken");
    accessToken.jwtToken = data.accessToken;
    localStorage.setItem("accessToken", JSON.stringify(accessToken));

    // Update var
    accessJwtToken = JSON.parse(localStorage.getItem('idToken')).jwtToken;
}

function logAjaxSuccess(apiFunction, data, textStatus, jqXHR) {
    console.log(`${apiFunction} -> Data:`, data);
    console.log(`${apiFunction} -> Text Status: ${textStatus}`);
    console.log(`${apiFunction} -> jqXHR: ${jqXHR}`);
}

function logAjaxError(apiFunction, jqXHR, textStatus, errorThrown) {
    console.error(`${apiFunction} -> jqXHR:`, jqXHR);
    console.error(`${apiFunction} -> Text Status: ${textStatus}`);
    console.error(`${apiFunction} -> Error Thrown: ${errorThrown}`);
}

$("#logout").on("click", () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("idToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("clockDrift");
    $(location).attr("href", "pages-login.html");
});

function showError(message) {
    $("#error").html(message);
    $("#error").show();
}
