const SERVER = "http://localhost:8080";
const num = document.querySelector(".js-info");

function init() {
    let counter = 3;
    const countInterval = setInterval(() => { 
        if(counter == 0) {
            clearInterval(countInterval);
            location.href = SERVER+"/game";
        } else
            num.innerHTML = --counter;
    }, 1000);
}

init();