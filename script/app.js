//------ Données ------
sessionStorage.setItem("city","Abidjan")
//site donnée
let sitedata
fetch('../data/data.json')
        .then(response => response.json())
        .then(data => {
            sitedata = data
        }).catch(error => { console.error('Error loading JSON data:', error);
        });

//------ Rendre la carte ------
//Généré des couleurs
function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

//taille du cadre
var width = window.innerWidth,
    height = window.innerHeight;

//-- creation de la carte dans un svg --
var svg = d3.select("#my_dataviz")
    .attr("width", width)
    .attr("height", height)
    .on("click",reset)

// map et projection
var projection
var path

// charge la carte
d3.json("../data/gadm41_CIV_3.json").then(function (data) {
    // Ajuster la projection
    projection = d3.geoMercator().fitSize([width, height], data);
    path = d3.geoPath().projection(projection);

    // Créer un groupe pour chaque regions
    var regionGroups = svg.selectAll("g.region")
        .data(data.features)
        .enter()
        .append("g")
        .attr("class", "region")
        .on("click", zoomToFeature);

    // Dessiner les paths
    regionGroups.append("path")
        .attr("class", d => `${d.geometry.type} no-checked`)
        .attr("name", d => d.properties.NAME_3)
        .attr("fill", "#fff")
        .attr("stroke", "#000")
        .attr("d", path);

    // Ajouter les textes
    regionGroups.append("text")
        .attr("class", d => (sitedata[d.properties.NAME_3] != undefined ? " " : "empty") + " region-label")
        .attr("text-anchor", "middle")
        .attr("x", d => path.centroid(d)[0])
        .attr("y", d => path.centroid(d)[1])
        .attr("onclick",d => "toPage('"+d.properties.NAME_3+"')").text(d => d.properties.NAME_3)

        //première mise à jours
        init()
});

//-- Fonction de zoom --
//Zoom sur une region
function zoomToFeature(event, d) {
    if (! event.target.classList.contains("no-checked")) { //ne pas zoomer lors de la deselection
        // Empêche le reset aussi
        event.stopPropagation();

        svg.transition()
            .duration(750)
            .call(
                zoom.transform,
                d3.zoomIdentity
                    .translate(width / 2, height / 2)
                    .scale(2)  // Zoom ×2
                    .translate(-path.centroid(d)[0], -path.centroid(d)[1])
            );
    }
}

//système de navigation
const zoom = d3.zoom()
    .scaleExtent([0.5, 8])
    .on('zoom', zoomed);

svg.call(zoom);

function zoomed(event) {
    svg.selectAll('path')
        .attr('transform', event.transform);

    svg.selectAll(".region-label").attr('transform', event.transform);
}

function reset() {
    svg.transition().duration(750).call(zoom.transform, d3.zoomIdentity);
}

//------ initiation des entrées ------
var selectedRegion
var searchInput
function init() {
    //recupere la barre de recherche
    selectedRegion = "empty"
    searchInput = document.querySelector("#search")
    searchInput.oninput = () => {
        update()    
    }

    //selectionne et deselectionne une region
    let mp = document.querySelectorAll(".MultiPolygon")
    mp.forEach((p) => {
        p.setAttribute("stroke",getRandomColor())
        p.onclick = () => {
            if (p.classList.contains("no-checked")) {
                mp.forEach((e) => {
                    if (! e.classList.contains("no-checked") ) {
                        e.classList.add("no-checked")
                    }
                })
                p.classList.remove("no-checked")
                p.setAttribute("fill", p.getAttribute("stroke"))
                selectedRegion = p.getAttribute("name")
                update() 
            }else{
                p.classList.add("no-checked")
                selectedRegion = "empty"
                update()
            }
        }
    })

    //première mise à jour
    update()
}

function toPage(city) {
    sessionStorage.setItem("city",city)
    location.replace("page/site.html")
}

//mis à jour fonction
function update() {
    let container = document.querySelector("#container")
    container.innerHTML = ``
    Object.keys(sitedata).forEach((region) => {
    if (Object.keys(sitedata[selectedRegion]).length == 0 && selectedRegion != "empty") { //aucun site dans un region
        container.innerHTML = `<div title="empty" class="w-100 h-100 bg-secondary text-white d-flex align-items-center text-center p-2"><h6>Aucun site trouvé dans cette la region ${selectedRegion}</h6></div>`      
        
    }else if (Object.keys(sitedata[region]).length > 0) { 
        Object.keys(sitedata[region]).forEach((el) => {
            let site = sitedata[region][el]
            if (region == selectedRegion && (site.Title).toLowerCase().includes(searchInput.value.toLowerCase()) || ((site.Title).toLowerCase().includes(searchInput.value.toLowerCase()) && selectedRegion == "empty" )) {
                container.innerHTML +=
                `<div class="shadow p-3 mb-5 rounded border border-dark">
                
                    <div class="card-title">
                        <h4 >${site.Title}</h4>
                        <h6 class="text-secondary">${region}</h6>
                    <div>
                    
                    <p class="card-text">${site.ShortDesc}</p>
                    <div class="d-grid gap-2">
                        <button
                            type="button"
                            name="`+region+`,`+el+`"
                            data-bs-toggle="modal" data-bs-target="#seeMore"
                            class="btn btn-primary showBtn"
                        >
                            Voir plus
                        </button>
                    </div>
                
                </div> `
            }    
        })
        
    }})
    if (searchInput.value != "" && container.innerHTML == ``) {
        container.innerHTML = `<div title="empty" class="w-100 h-100 bg-secondary text-white d-flex align-items-center text-center p-2"><h6>Aucun site ne correspond à votre recherche</h6></div>`   
    }
    document.querySelectorAll(".showBtn").forEach((btn) => {
        btn.onclick = () => { show(btn.getAttribute("name").split(",")[0],btn.getAttribute("name").split(",")[1]) }
    })  
     
}

//change popup data


function show(region,site) {
    let sregion = document.querySelector("#showRegion")
    sregion.textContent = region
    let popup = document.querySelector("#show")
    popup.innerHTML =
    `<div class="text-end">
            <h1>${sitedata[region][site].Title}</h1>
            <p>${sitedata[region][site].ShortDesc}</p>
        </div>
    <p class="tjustify w-100 mt-2">
        ${sitedata[region][site].Desc}
    </p>
    <p class="text-center mt-2">
        <button class="btn btn-primary" onclick="toPage('${ region }')">Site de la ville</button>
    </p>
    `
}