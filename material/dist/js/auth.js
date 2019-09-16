//#region API Paths

const authApiBasePath = "https://ommkdunauc.execute-api.eu-central-1.amazonaws.com/dev";
const categoriesApiBasePath = "https://g8335hfcy0.execute-api.eu-central-1.amazonaws.com/dev";
const locationsApiBasePath = "https://6mo2qzbcag.execute-api.eu-central-1.amazonaws.com/dev"
const providersApiBasePath = "https://sclx4kb3lk.execute-api.eu-central-1.amazonaws.com/dev";
const reviewsApiBasePath = "https://2nhq1hidx6.execute-api.eu-central-1.amazonaws.com/dev";
const quotesApiBasePath = "https://z75j3glj94.execute-api.eu-central-1.amazonaws.com/dev";
const hardwareApiBasePath = "https://qnb9rnf3h8.execute-api.eu-central-1.amazonaws.com/dev";

//#endregion

//#region Authentication

function getBearerToken() {
    let token = Cookies.getJSON("idToken") ? Cookies.getJSON("idToken").jwtToken : undefined;
    if (!token) {
        $(location).attr("href", "pages-login.html");
        return;
    }
    return token;
}

function setTokens(tokens) {
    Cookies.set("accessToken", tokens.accessToken, { expires: new Date(tokens.accessToken.payload.exp * 1000) });
    Cookies.set("clockDrift", tokens.clockDrift);
    Cookies.set("idToken", tokens.idToken, { expires: new Date(tokens.idToken.payload.exp * 1000) });
    Cookies.set("refreshToken", tokens.refreshToken);
}

function getIdToken() {
    return Cookies.getJSON("idToken") || undefined;
}

function getAccessToken() {
    return Cookies.getJSON("accessToken") || undefined;
}

function getRefreshToken() {
    return Cookies.getJSON("refreshToken") || undefined;
}

async function login() {
    return await $.ajax({
        method: "POST",
        url: `${authApiBasePath}/auth`,
        contentType: "application/json",
        dataType: "json",
        cache: false,
        data: JSON.stringify({
            username: $("#email").val(),
            password: $("#password").val()
        })
    })
        .done((data, textStatus, jqXHR) => {
            logAjaxSuccess("GET /auth", data, textStatus, jqXHR);
            setTokens(data);
            return true;
        })
        .fail((jqXHR, textStatus, errorThrown) => {
            logAjaxError("GET /auth", jqXHR, textStatus, errorThrown);
            showError(textStatus);
        });
}

function isLoggedIn() {

    // Check if token is still valid
    var token = getBearerToken();

    console.log("Verifying token:", token);
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
            $(location).attr("href", "pages-login.html?message=" + encodeURI(textStatus));
        });
}

async function refreshToken() {
    await $.ajax({
        method: "POST",
        url: `${authApiBasePath}/refreshToken`,
        beforeSend: getHeaders,
        data: JSON.stringify({
            refreshToken: getRefreshToken(),
            idToken: getIdToken(),
            accessToken: getAccessToken()
        }),
        dataType: "json"
    })
        .done((data, textStatus, jqXHR) => {
            logAjaxSuccess("POST /auth/refreshToken", data, textStatus, jqXHR);
            updateTokens(data);
            loadCards();
        })
        .fail((jqXHR, textStatus, errorThrown) => {
            logAjaxError("POST /auth/refreshToken", jqXHR, textStatus, errorThrown);
            throw new Error(errorThrown);
        });
}

function updateTokens(data) {

    console.log("Updating tokens:", data);

    // Id token
    var idToken = Cookies.getJSON("idToken");
    idToken.jwtToken = data.idToken;
    console.log("Setting new idToken:", idToken);
    Cookies.set("idToken", idToken);

    // Access token
    var accessToken = Cookies.getJSON("accessToken");
    accessToken.jwtToken = data.accessToken;
    Cookies.set("accessToken", accessToken);
}

function getHeaders(jqXHR) {
    jqXHR.setRequestHeader("Authorization", `Bearer ${getBearerToken()}`);
}

//#endregion

//#region Users

async function getUsers() {
    return await $.ajax({
        method: "GET",
        url: `${authApiBasePath}/users`,
        beforeSend: getHeaders,
        dataType: "json"
    })
        .done((data, textStatus, jqXHR) => {
            logAjaxSuccess("GET /users", data, textStatus, jqXHR);
            return data;
        })
        .fail((jqXHR, textStatus, errorThrown) => {
            handleError(getUsers, jqXHR, textStatus, errorThrown);
        });
}

//#endregion

//#region Reviews

async function getReviews() {
    return await $.ajax({
        method: "GET",
        url: `${reviewsApiBasePath}/reviews`,
        beforeSend: getHeaders,
        dataType: "json"
    })
        .done((data, textStatus, jqXHR) => {
            logAjaxSuccess("GET /reviews", data, textStatus, jqXHR);
            return data;
        })
        .fail((jqXHR, textStatus, errorThrown) => {
            handleError(getReviews, jqXHR, textStatus, errorThrown);
        });
}

async function deleteReview(reviewId) {
    return await $.ajax({
        method: "DELETE",
        url: `${reviewsApiBasePath}/reviews/${reviewId}`,
        beforeSend: getHeaders,
        dataType: "json"
    })
        .done((data, textStatus, jqXHR) => {
            logAjaxSuccess("DELETE /reviews/" + reviewId, data, textStatus, jqXHR);
            return data;
        })
        .fail((jqXHR, textStatus, errorThrown) => {
            handleError(deleteReview(reviewId), jqXHR, textStatus, errorThrown);
        });
}

//#endregion

//#region Logging/Message/Error Handling

function logAjaxSuccess(apiFunction, data, textStatus, jqXHR) {
    console.log(apiFunction + " -> Data:", data);
    console.log(apiFunction + " -> Text Status:", textStatus);
    console.log(apiFunction + " ->  jqXHR:", jqXHR);
}

function logAjaxError(apiFunction, jqXHR, textStatus, errorThrown) {
    console.error(apiFunction + " -> jqXHR:", jqXHR);
    console.error(apiFunction + " -> Text Status:", textStatus);
    console.error(apiFunction + " -> Error Thrown:", errorThrown);
}

function showError(message) {
    $("#error").html(message);
    $("#error").show();
}

function showMessage(heading, message) {
    $.toast({
        heading: heading
        , text: message
        , position: 'top-right'
        , loaderBg: '#ff6849'
        , icon: 'info'
        , hideAfter: 3500
        , stack: 6
    })

}

function clearError() {
    $("#error").hide();
}

function handleError(functionCalled, jqXHR, textStatus, errorThrown) {
    logAjaxError(functionCalled, jqXHR, textStatus, errorThrown);
    if (jqXHR.status == 0) {
        // The token probably expired. Get a new one
        console.log("Status is 0. Trying to refresh token");
        refreshToken().then((tokens) => {
            updateTokens(tokens);
            functionCalled();
        }).catch((error) => {
            throw new Error(`Failed to call ${functionCalled}:" ${error}`);
        })
    }
}

//#endregion

//#region Logout

$("#logout").on("click", () => {
    Cookies.remove("accessToken");
    Cookies.remove("idToken");
    Cookies.remove("refreshToken");
    Cookies.remove("clockDrift");
    $(location).attr("href", "pages-login.html");
});

//#endregion
