let selectedFilters = [];

const vacanciesList = document.getElementById('vacancy__section');
const searchBtn = document.getElementById('searchBtn');


function createVacancyItem(vacancy) {
    let container = document.createElement('div');
    container.className = 'vacancy';

    let title = document.createElement('a');
    title.setAttribute('href', vacancy.link);
    title.className = 'vacancy__title';
    title.textContent = vacancy.title;

    let shortInfo = document.createElement('div');
    shortInfo.className = 'vacancy__short__desc-info';
    shortInfo.textContent = vacancy.short_info;

    let desc = document.createElement('div');
    desc.className = 'vacancy__desc';
    desc.textContent = vacancy.desc;

    container.appendChild(title);
    container.appendChild(shortInfo);
    container.appendChild(desc);

    vacanciesList.appendChild(container);
}

searchBtn.addEventListener('click', () => {
    console.log('Start search vacancies');
    vacanciesList.textContent = 'Wait, while we search vacancies...';
    
    fetch('http://localhost:3000/selected', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            category: selectedFilters[0],
            exprerience: selectedFilters[1]
        }),
    })
    .then(response => response.json())
    .then(data => {
        const vacancies = data.vacancies;
        vacanciesList.textContent = ''; // Clear list 
        vacancies.forEach((x) => {
            createVacancyItem(x);
        });
    })
    .catch(error => {
        console.error('Fetch error while search vacancies:', error);
    });
});

// Return id of active item
function findActiveItem(item__list) {
    let itemid = false;
    item__list.map((item) => { 
        if (item.classList.contains('active')) {
            itemid = item.id;
        } 
    });

    return itemid;
}

// Response for selecting item (category, experience, level)
function selectItem(selected_item, item_list) {
    if (selected_item.classList.contains('active')) {
        selected_item.classList.remove('active');
    } else {
        if (findActiveItem(item_list) != false) {
            let item = document.getElementById(findActiveItem(item_list));
            item.classList.remove('active')
        };

        selected_item.classList.add('active');
    }

    selectedFilters[0] = findActiveItem(categories);
    selectedFilters[1] = findActiveItem(expreriences);
}

// Adds event listeners on every category
function AddSelectHandler(items) {
    items.map((item) => {
        item.addEventListener('click', () => {
            selectItem(item, items);
        });
    });
}

const js = document.getElementById('JavaScript');
const fullstack = document.getElementById('Fullstack');
const java = document.getElementById('Java');
const nodejs = document.getElementById('Node.js');
const python = document.getElementById('Python');
const c = document.getElementById('C%2B%2B');

let categories = [js, fullstack, java, python, nodejs,  c];
AddSelectHandler(categories);

const noexp = document.getElementById('no_exp');
const one__year = document.getElementById('1y');
const two__years = document.getElementById('2y');
const three__years = document.getElementById('3y');
const five__years = document.getElementById('5y');

let expreriences = [noexp, one__year, two__years, three__years, five__years];
AddSelectHandler(expreriences);