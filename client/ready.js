const SERVER = "http://localhost:8080";
const num = document.querySelector(".js-info");

function init() {
    let counter = 3;
    const countInterval = setInterval(() => {
        num.innerHTML = --counter;
        if(counter === 0) {
            clearInterval(countInterval);
            location.href = SERVER+"/game";
        }
    }, 1000);

    window.onbeforeunload = function(event) {
        event.preventDefault();
        if(counter !== 0)
            fetch(SERVER+"/out");
    }
}

init();