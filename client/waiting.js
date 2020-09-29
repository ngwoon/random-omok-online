const SERVER = "http://localhost:8080";

function init() {
    const info = document.querySelector(".js-info");
    const cookie = document.cookie;

    const cookieArr = cookie.split("=");

    localStorage.setItem(cookieArr[0], cookieArr[1]);

    let counter=0;
    const waitInterval = setInterval(() => {
        if(counter == 4) {
            counter = 0;
            info.innerHTML = "상대를 찾고 있습니다";
        } else {
            info.innerHTML += ".";
            ++counter;
        }
    }, 1000);
    
    fetch(SERVER+"/check").then((response) => {
        console.log(response.ok);
        if(response.ok) {
            clearInterval(waitInterval);
            location.href = SERVER+"/ready";
        }
    });

    window.onbeforeunload = function(event) {
        event.preventDefault();
        fetch(SERVER+"/out");
    }
}

init();