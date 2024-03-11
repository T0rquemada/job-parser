const express = require('express');
const cors = require('cors');
const https = require('https');

const app = express();
app.use(express.json());
app.use(cors());
const port = 3000;

// Correct and return link depending on selected filters
function prepareLink(category, exprerience, url) {
    if (category === undefined && exprerience === undefined) {
        console.log("Return link for empty filters");
        return url;
    }

    if (category != false) url += `?primary_keyword=${category}`;
    if (exprerience != false && category != false) {url += `&exp_level=${exprerience}`}
    else if (exprerience != false) {url += `?exp_level=${exprerience}`};

    return url;
}

// Return vacancy in html
function parse(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let html = '';
            
            res.setEncoding('utf-8');
    
            res.on('data', (chunk) => {
                // Cut off some things from html
                chunk = chunk.replace(/\n/g, '');
                chunk = chunk.replace(/\t/g, '');
                chunk = chunk.replace(/<br>/g, '');
    
                html += chunk;
            });
    
            res.on('error', (error) => {
                //console.error('Error:', error.message);
                reject(error)
            });
    
            res.on('end', () => {
                const regExp = /<li\s[^>]+class="list-jobs__item job-list__item"[^>]*>[\s\S]*?<\/li>/gi;
                html = html.match(regExp);
                resolve(html);
            });
        });
    });
}

// Return array of vacancies objects
function extractVacancies(html) {
    // Return vacancy title
    function extractTitle(html) {
        const regExp = /<a\sclass="h3 job-list-item__link"[^>][\s\S]*?<\/a>/;
        let title = html.match(regExp);
        title = title[0];
        title = title.slice(title.indexOf('>') + 1);
        title = title.slice(0, title.indexOf('<'));
        title = title.slice(14);    // Slice spaces before title
        
        return title;
    }

    // Return link on vacancy
    function extractLink(html) {
        const regExp = /<a\sclass="h3 job-list-item__link"[^>][\s\S]*?<\/a>/;
        let link = html.match(regExp);
        link = link[0];
        link = link.slice(0, link.indexOf('>') + 1);
        link = link.match(/href="[\s\S]*"/);
        link = link[0];
        link = link.slice(6, link.length - 1);

        return 'https://djinni.co' + link;
    }

    function extractInfo(html) {
        const regExp = /<div\sclass="job-list-item__job-info font-weight-500">[\s\S]*?<\/div>/;
        let info = html.match(regExp);
        info = info[0];   
        info = info.slice(info.indexOf('>') + 1);   // Cut off div's html
        info = info.replace(/<\/div>/gi, ''); 
        info = info.replace(/<span[^>]*>/gi, '');   // Cut off span html
        info = info.replace(/<\/span>/gi, '');
        info = info.replace(/ /g, '');

        return info;
    }

    function extractDesc(html) {
        let desc = html.match(/<span\sid="job-description-[\s\S]*<\/span>/)[0];

        let fullDesc = desc.match(/data-original-text="(.*?)">/)[0];
        fullDesc = fullDesc.replace(/<b>/g, '');
        fullDesc = fullDesc.replace(/<\/b>/g, '');
        fullDesc = fullDesc.slice(19)

        return fullDesc
    }
    
    try {
        let vacancies = [];
    
        html.map((x) => {
            let vacancy = {
                title: extractTitle(x),
                link: extractLink(x),
                short_info: extractInfo(x),
                desc: extractDesc(x) 
            };
    
            vacancies.push(vacancy);
        });

        return vacancies;
    } catch(err) {
        console.error(err);
    }
};

async function findVacancies(category, exprerience, res) {
    let url = prepareLink(category, exprerience, 'https://djinni.co/jobs/')
    console.log('URL: ', url);
    let html = await parse(url);
    let result = extractVacancies(html);

    let vacancies = [];
    result.forEach((x) => vacancies.push(x));
    res.json({ message: 'Vacancies finded successfully', vacancies: vacancies});    // Send vacancies to client
}

// Receive selected filters
app.post('/selected', (req, res) => {
    let {category, exprerience} = req.body;
    console.log("Seleceted: ", category, " ", exprerience);

    findVacancies(category, exprerience, res);
});

app.get('/', (req, res) => {
    console.log("Request: ", req);
    res.send(JSON.stringify('Hello World!'));
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
})