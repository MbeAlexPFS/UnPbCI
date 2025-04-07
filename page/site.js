let city_data = null
let univ_data = null
let city = sessionStorage.getItem("city")
fetch('../data/city.json')
.then(response => response.json())
.then(data => {
    city_data = data[city]
    render()
})
.catch(error => { console.error('Error loading JSON data:', error);});
fetch('../data/data.json')
.then(response => response.json())
.then(data => {
    univ_data = data[city]
    render()
})
.catch(error => { console.error('Error loading JSON data:', error);});

function render() {
    let city_title = document.querySelectorAll(".city")
    let city_desc = document.querySelector("#rdesc")
    let univ = document.querySelector("#stdesc")
    let galerie = document.querySelector("#gdesc")
    if (city_data != null && univ_data != null) {
        //header
        document.title = "UnPbCI - " + city

        //city title
        city_title.forEach((e) => {
            e.textContent = city
        })
        
        //city desc
        city_desc.innerHTML = 
        `<div class="col-md-6">
            <a href="${ city_data.MapImgUrl }" target="_blank">
                <img class="img-flud w-100" src="${ city_data.MapImgUrl }" height="400px">
            </a>
        </div>
        <div class="col-md-6">
            <h1 class="city" >${ city }</h1>
            <p><strong><span id="city-desc">${ city_data.Desc }</span></strong></p>
        </div>`

        //univ
        univ.innerHTML = ``

        Object.keys(univ_data).forEach((un) => {
            univ.innerHTML +=
            `<div class="row border border-dark shadow p-3 m-2">
                <div class="col-md-4">
                    <img
                        src="${univ_data[un].ImgUrl}"
                        class="img-fluid rounded-top"
                        alt=""
                        height="400px"
                    />      
                </div>
                <div class="col-md-8">
                    <h1>${univ_data[un].Title}</h1>
                    <h6 class="text-secondary">${univ_data[un].ShortDesc}</h6>
                    <p class="mt-3">
                        ${univ_data[un].Desc}
                    </p>
                    <p>Pour plus d"information voir : <a href="${univ_data[un].fullDesc}" target="_blank" >${univ_data[un].fullDesc}</a> </p>
                </div>
            </div>`    
        })

        //galerie
        galerie.innerHTML = ``
        Object.keys(univ_data).forEach((un) => {
            galerie.innerHTML +=
            `<div class="col-md"><img width="300px" src="${univ_data[un].ImgUrl}" height="300px"></div>`
        })
    }
}