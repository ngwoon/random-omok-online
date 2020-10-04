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

            // 사용자가 의도적으로 게임을 끈 상태랑, 매칭이 되어서 ready 페이지로 넘어갈 때랑 구분하기 위해
            // ready 상태 진입 시 onbeforeunload 이벤트를 침묵시킨다.
            window.removeEventListener("onbeforeunload", beforeUnLoadListener, true);
            location.href = SERVER+"/ready";
        }
    });

    window.addEventListener = ("onbeforeunload", beforeUnLoadListener, true);
}

function beforeUnLoadListener(event) {
    event.preventDefault();
    fetch(SERVER+"/out");
}

init();