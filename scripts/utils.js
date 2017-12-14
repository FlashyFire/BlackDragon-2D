function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) === ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) === 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}
function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    var expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}
function savePlayerName() {
    setCookie('player', document.getElementById("playerName").value, 5);
}
function updateScores(playerName, score) {
    if (playerName)
        playerName = playerName.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    else
        playerName = "None";
    var scores = [];
    var data = getCookie("scores");
    if (data)
        scores = JSON.parse(data);
    var item = {
        name: playerName,
        score: score
    };
    var inserted = false;
    for (var i = 0; i < scores.length; i++) {
        if (scores[i].score <= score) {
            scores.splice(i, 0, item);
            inserted = true;
            break;
        }
    }
    if (!inserted && scores.length < 10)
        scores.push(item);
    if (scores.length > 10)
        scores.splice(9, 1);
    data = JSON.stringify(scores);
    setCookie('scores', data, 30);
}
