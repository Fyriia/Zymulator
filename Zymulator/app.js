const zym = {
    stages: ['begging', 'default','default2', 'happy', 'sad'],
    thirstScale: 10,
    hungerScale: 10,
    coldnessScale: 50,
    thirsty: false,
    hungry: false,
    cold: false,
};



let weather = {};
let currentLocation = {lat: '', long:''};
const apiKey = 'd2ae4acd2e95caad80c781a00fbe3a7c';
const $weatherDisplay = document.getElementById('weather-display');
const $begging = document.getElementById('begging');
const $default = document.getElementById('default');
const $default2 = document.getElementById('default2');
const $happy = document.getElementById('happy');
const $sad = document.getElementById('sad');
const $fire = document.getElementById('fire');
const $water = document.getElementById('water');
const $food = document.getElementById('food');
const $dimmer = document.getElementById('dimmer');
let raindrops = document.getElementsByClassName('drops');
let flakes = document.getElementsByClassName('flakes');
let clouds = document.getElementsByClassName('cloud');
const $snowButton = document.getElementById('snowy-button');
const $rainButton = document.getElementById('rainy-button');
const $sunButton = document.getElementById('sunny-button');
const $cloudButton = document.getElementById('cloudy-button');

$snowButton.addEventListener("click", forceSnow);
$rainButton.addEventListener("click", forceRain);
$sunButton.addEventListener("click", forceSun);
$cloudButton.addEventListener("click", forceClouds);

function setupDragAndDrop() {
    const dropTarget = document.getElementById('target');

    document.addEventListener('dragover', (event) => {
        event.preventDefault();
    });


    dropTarget.addEventListener('drop', (event) => {
        event.preventDefault();
        const data = event.dataTransfer.getData('text/plain');
        const draggableElement = document.getElementById(data);


        handleDrop(draggableElement);
    });

    [$fire, $water, $food].forEach(item => {
        item.addEventListener('dragstart', (event) => {
            event.dataTransfer.setData('text/plain', event.target.id);
        });
    });
}


function handleDrop(utility) {
    if (utility === $fire && zym.cold){
        zym.cold = false;
        update();}

    if (utility === $food && zym.hungry){
        zym.hungry = false;
        update();
    }
    if (utility === $water && zym.thirsty){
        zym.thirsty = false;
        update();
    }
}


function getCurrentLocation() {
    return new Promise((resolve, reject) => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    currentLocation.lat = position.coords.latitude;
                    currentLocation.long = position.coords.longitude;
                    console.log(currentLocation);
                    resolve(currentLocation);
                },
                (error) => {
                   console.error('Couldn\'t retrieve location information.');
                }
            );
        } else {
            reject(console.error('Geolocation is not supported by this browser.'));
        }
    });
}

async function fetchWeather() {
    try {
        await getCurrentLocation();
    } catch (error) {
        console.error(error.message);
        if (!currentLocation.lat || !currentLocation.long) {
            currentLocation.lat = '48.18565863388932';
            currentLocation.long = '16.356703182031964';
        }
    }

    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${currentLocation.lat}&lon=${currentLocation.long}&appid=${apiKey}&units=metric`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            console.error(`HTTP error! status: ${response.status}`);
        }
        weather = await response.json();
        console.log(weather);
    } catch (err) {
        console.error('Error fetching weather data:', err);
    }
}

async function init() {
    await fetchWeather();

    const weatherId = weather.weather[0].id;
    let currentTemp = weather.main.temp;
    let weatherStation = weather.name;
    let currentSitch = weather.weather[0].main;

   $weatherDisplay.innerHTML = `<p class="display-text">${currentTemp}°C <br> 
                                ${currentSitch}<br>
                                Data from:<br>${weatherStation}</p>`
    if (currentTemp <= 10) {
        $weatherDisplay.innerHTML = `<p class="display-text"><span class="cold">${currentTemp}°C</span> <br> 
                                ${currentSitch}<br>
                                Data from:<br>${weatherStation}</p>`
    } else if (currentTemp <= 26) {
        $weatherDisplay.innerHTML = `<p class="display-text"><span class="medium">${currentTemp}°C</span> <br> 
                                ${currentSitch}<br>
                                Data from:<br>${weatherStation}</p>`
    } else {
        $weatherDisplay.innerHTML = `<p class="display-text"><span class="hot">${currentTemp}°C</span> <br> 
                                ${currentSitch}<br>
                                Data from:<br>${weatherStation}</p>`
    }
    zym.coldnessScale = 50;
    zym.hungerScale = 10;
    zym.thirstScale = 10;
    for (const raindrop of raindrops) {
        raindrop.classList.add('hidden');
    }
    for (const cloud of clouds) {
        cloud.classList.add('hidden');
    }
    for (const flake of flakes) {
        flake.classList.add('hidden');
    }
    $dimmer.classList.add('hidden');


    if (weatherId > 199 && weatherId < 600) {
        console.log("rain");
        for (const raindrop of raindrops) {
            raindrop.classList.remove('hidden');
        }
        for (const cloud of clouds) {
            cloud.classList.remove('hidden');
        }
        $dimmer.classList.remove('hidden');

        zym.coldnessScale = 5;

    } else if (weatherId > 599 && weatherId < 700) {
        console.log("snow");
        for (const flake of flakes) {
            flake.classList.remove('hidden');
        }
        for (const cloud of clouds) {
            cloud.classList.remove('hidden');
        }
        $dimmer.classList.remove('hidden');
        zym.coldnessScale = 5;
    } else if ((weatherId > 700 && weatherId < 800) || weatherId > 800) {
        console.log("clouds");
        for (const cloud of clouds) {
            cloud.classList.remove('hidden');
        }
        zym.hungerScale = 5;
        $dimmer.classList.remove('hidden');
    } else if (weatherId === 800) {
        console.log("clear");
        zym.thirstScale = 5;
    }
}

function getRandomInterval(scale) {
    return Math.floor(Math.random() * scale * 1000 + scale * 1000);
}

function weightedRandomSelect() {
    const inverseThirstScale = 1 / zym.thirstScale;
    const inverseHungerScale = 1 / zym.hungerScale;
    const inverseColdnessScale = 1 / zym.coldnessScale;

    const totalInverseScale = inverseThirstScale + inverseHungerScale + inverseColdnessScale;
    const rand = Math.random() * totalInverseScale;

    if (rand < inverseThirstScale) {
        return 'thirsty';
    } else if (rand < inverseThirstScale + inverseHungerScale) {
        return 'hungry';
    } else {
        return 'cold';
    }
}

function triggerNeed() {
    const need = weightedRandomSelect();

    switch (need) {
        case 'thirsty':
            zym.thirsty = true;
            break;
        case 'hungry':
            zym.hungry = true;
            break;
        case 'cold':
            zym.cold = true;
            break;
    }
    update();
    const nextInterval = getRandomInterval(Math.min(zym.thirstScale, zym.hungerScale, zym.coldnessScale));
    setTimeout(triggerNeed, nextInterval);
}


function update(){
    console.log('hungry: ' + zym.hungry);
    console.log('thirsty: ' + zym.thirsty);
    console.log('cold: ' + zym.cold);
let randomize = Math.random();
document.getElementById('need-fire').classList.add('hidden');
document.getElementById('need-water').classList.add('hidden');
document.getElementById('need-food').classList.add('hidden');
    for (const stage of zym.stages) {
        document.getElementById(stage).classList.add('hidden');
    }

    if (zym.thirsty || zym.hungry || zym.cold){
        if (randomize <= 0.5) {
            $begging.classList.remove('hidden');
        } else {
            $sad.classList.remove('hidden')
    }
    } else if (!zym.thirsty && !zym.hungry && !zym.cold){
        $happy.classList.remove('hidden');
    } else {
        if (randomize <= 0.5) {
            $default.classList.remove('hidden');
        } else {
            $default2.classList.remove('hidden');
        }
    }
    if (zym.thirsty) {
        document.getElementById('need-water').classList.remove('hidden');
    }
    if (zym.cold){
        document.getElementById('need-fire').classList.remove('hidden');
    }
    if (zym.hungry) {
        document.getElementById('need-food').classList.remove('hidden');
    }
}

function forceSnow(){
    for (const flake of flakes) {
        flake.classList.remove('hidden');
    }
    for (const cloud of clouds) {
        cloud.classList.remove('hidden');
    }
    for (const drop of raindrops) {
        drop.classList.add('hidden');
    }
    $dimmer.classList.remove('hidden');
}

function forceRain(){
    for (const flake of flakes) {
        flake.classList.add('hidden');
    }
    for (const cloud of clouds) {
        cloud.classList.remove('hidden');
    }
    for (const drop of raindrops) {
        drop.classList.remove('hidden');
    }
    $dimmer.classList.remove('hidden');
}

function forceSun(){
    for (const flake of flakes) {
        flake.classList.add('hidden');
    }
    for (const cloud of clouds) {
        cloud.classList.add('hidden');
    }
    for (const drop of raindrops) {
        drop.classList.add('hidden');
    }
    $dimmer.classList.add('hidden');
}

function forceClouds(){
    for (const flake of flakes) {
        flake.classList.add('hidden');
    }
    for (const cloud of clouds) {
        cloud.classList.remove('hidden');
    }
    for (const drop of raindrops) {
        drop.classList.add('hidden');
    }
    $dimmer.classList.remove('hidden');
}


init();
setupDragAndDrop();
setTimeout(triggerNeed, 5000);




