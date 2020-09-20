function init() {
    const info = document.querySelector(".js-info");
    let counter=0;
    setInterval(() => {
        if(counter == 4) {
            counter = 0;
            info.innerHTML = "상대를 찾고 있습니다";
        } else {
            info.innerHTML += ".";
            ++counter;
        }
    }, 1000);
}

init();