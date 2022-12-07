const CHARACTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789./_-"
const COLONY_NAMES = 
["New Warsaw", "Taciturn", "Lurk", "Stiff",
"Twig", "Courage", "Weeged", "Domino Hub",
"Splendor", "Fineld", "Prosperity", "Backbone",
"Prime Candidate", "Bushy", "Verid", "Sahly",

"Shembah", "Collyman", "Plockstick", "Krummer",
"Lherman", "Stember", "Otrob", "Galloklam", "Frenkhan",
"Xhenmen", "Mloomer", "Ohmnem", "Reefreder", "Gheern",
"Ozklerh", "Phernomack", "Walplunk", "Greckcheck",
"Bhenmbre", "Plinmfen", "Phokmer", "Chunmack",

"Magnaterre", "Rempank", "Qwerty", "Sdernack", 
"Wendowic", "Xemnolar", "Fherne", "Schloppe", "Qinne",
"Guettur", "Knitkneck", "Puurtern", "Shdovnek", 
"Grenchmag", "Plonolp", "Eerneman"]

function randomColonyName(){
    i = getRandomInt(0, COLONY_NAMES.length - 1)
    a = COLONY_NAMES[i]
    COLONY_NAMES.splice(i, 1)
    return a
}

const MIN_DEATH_AGE = 30

const PLANET_NAME = planetNameGenerator(((Math.random() * 10) % 8) + 3)

const TRANSPORTER_CAPACITY = 24
//const STORAGE_CAPACITY = 60
//const POWERHOUSE_PRODUCTION = 10
//const TRANSPORTER_PRODUCTION = 0.2

const power_consumption = {
    storage: 1,
    food_factory: 2,
    build_token_factory: 3,
    housing: 1,
    transporter_factory: 5
}

const build_cost = {
    storage: 2,
    food_factory: 3,
    build_token_factory: 5,
    housing: 2,
    transporter_factory: 10
}

const gender = {
    female: 0,
    male: 1,
    other: 2
}

class resource_type {
    constructor (name, size, can_be_transported_normally = true) {
        this.name = name
        this.size = size
        this.can_be_transported_normally = can_be_transported_normally
    }
}

function getRandomInt (min, max) {
    return Math.floor(Math.random() * (max - min) ) + min;
}

function planetNameGenerator (nameLength) {
    let name = ""
    for (let i = 0; i < nameLength; i++){
        if (i == nameLength || i == 0) r = Math.random(CHARACTERS.length) * (CHARACTERS.length - 4)
        else r = Math.random(CHARACTERS.length) * (CHARACTERS.length)
        name += CHARACTERS.charAt(r)
    }
    return name
}

class transport {
    constructor (destination) {
        this.content = []
        this.space_used = 0
        this.destination = destination
    }
    
    addToTransport (content) {
        if (resource_types[content].size + this.space_used <= TRANSPORTER_CAPACITY){
            this.space_used += resource_types[content].size
            this.content.push(content)
            return true
        }
        return false
    }

    removeFromTransport (i) {
        this.space_used -= resource_types[this.content[i]].size
        this.content.splice(i, 1)
    }
}

function generateExtroversion () {
    let a = Math.random() - Math.random()
    let b = -(a*a) + 1
    return b
}

class citizen {
    constructor (date, extroversion = -1) {
        this.birth_date = date
        this.gender = getRandomInt(0, 1)
        if (Math.random() > 0.88) {
            this.gender = gender.other
        }
        if (extroversion >= 1 || extroversion <= -1) {
            extroversion = generateExtroversion()
        }
    }

    oldAgeDeathProbability (date) {
        let age = date - this.birth_date
        if (age > MIN_DEATH_AGE){
            return (age - MIN_DEATH_AGE) / MIN_DEATH_AGE
        }
        return 0.0
    }
}

class building {
    constructor (name, production, consumption, cost, maintenance_interval = 3,
        workers = 0, worker_happiness_improvement = 0, colony_happiness_improvement = 0,
        storage_capacity = 0, storage_types = [], buildable = true) {
        //production, consumption, etc stored like
        ///[[item, amount], [item2, amount2]]
        this.name = name
        this.production = production
        this.consumption = consumption
        this.cost = cost
        this.workers = workers
        this.worker_happiness_improvement = worker_happiness_improvement
        this.colony_happiness_improvement = colony_happiness_improvement
        this.maintenance_interval = maintenance_interval
        this.storage_capacity = storage_capacity
        this.storage_types = storage_types
        this.buildable = buildable
        this.maintenance_counter = 0
    }

    needsMaintenance () {
        return this.maintenance_counter > this.maintenance_counter
    }

    resetMaintenanceCounter () {
        this.maintenance_counter = 0
    }

    update () {
        this.maintenance_counter++
    }

    canBeStored (resource_name) {
        if (this.storage_capacity == 0) return false

        for (let i = 0; i < this.storage_types.length; i++) {
            return (this.storage_capacity[i] == resource_name)
        }
        return false
    }
}

class colony {
    constructor (x, y, name){
        this.x = x
        this.y = y
        this.name = name

        this.transporters = 0
        this.resources = {} //id : amount
        this.citizens = []

        this.deaths = 0
        this.non_old_age_deaths = 0

        this.build_tokens = 0
        this.energy_units = 0
        this.food = 0

        this.new_resources = {} // id : amount
        /*this.new_build_tokens = 0
        this.new_energy_units = 0
        this.new_food = 0*/
        this.new_transporters = 0
        this.new_citizens = 0

        this.buildings = []
        this.new_buildings = []
    }

    consumeProduce () {
        let maxCapacity = this.maxCapacity()
        let lostResources = {}
        this.buildings.forEach(i => {
            let can_produce = true
            let r = {}
            Object.assign(r, this.new_resources);
            i.consumption.forEach(j => {
                if (isNaN(r[j[0]])) r[j[0]] = 0
                r[j[0]] -= j[1]
                if (r[j[0]] < 0) {
                    can_produce = false
                }
            })
            if (can_produce) {
                i.production.forEach(j => {
                    if (isNaN(r[j[0]])) r[j[0]] = 0

                    if (r[j[0]] + j[1] > maxCapacity[j[0]]){
                        if (isNaN(lostResources[j[0]])) lostResources[j[0]] = 0
                        lostResources[j[0]] + j[1]
                    }
                    else temp_resources[j[0]] += j[1]
                })
                this.new_resources = r
            }
            else {
                notifs.push(new notif("Insufficient resources!", "A " + i.name + " in " + this.name + " couldn't produce because the needed resources weren't provided."))
            }
        })
        if (Object.keys(lostResources).length > 0) {
            let details = "You lost resources from production in " + this.name + " because the storage was full.<br>Resources lost:"
            for (let i in lostResources) {
                details += "<br>" + lostResources[i] + "x" + " " + i
            }
            notifs.push(new notif("Resources lost!", details))
        }
    }

    maxCapacity () {
        let capacity = {}
        this.buildings.forEach(i => {
            if (!(i.storage_capacity == 0)){
                i.storage_types.forEach(j => {
                    if (isNaN(capacity[j[0]])) capacity[j[0]] = 0
                    capacity[j[0]] += j[1] * i.storage_capacity
                })
            }
        })
        return capacity
    }

    capacity () {
        let capacity = this.maxCapacity()
        for (let i in this.new_resources) {
            if (i[0] == resource_names.citizen) capacity[i] -= this.citizens.length
            else capacity[i] -= this.new_resources[i]
        }
        return capacity
    }

    canCitizensBeBorn () {
        if (this.citizens.some(citizen => citizen.gender == gender.female) && this.citizens.some(citizen => citizen.gender == gender.male)) {
            return this.capacity[resource_names.citizen]
        }
        return 0
    }

    oldAgeDeaths () {
        let new_citizens = []
        for (let i = 0; i < this.citizens.length; i++){
            if (Math.random() > this.citizens[i].oldAgeDeathProbability()) {
                new_citizens.push(this.citizens[i])
            }
        }
        this.citizens = new_citizens
    }

    calcHappiness () {
        return 0
    }

    unpackTransporter (t) {
        let capacity = this.capacity()
        let lostResources = {}

        t.content.forEach(i => {
            let j = resource_types[i].name
            if (isNaN(capacity[j]) || capacity[j] - 1 < 0) {
                if (isNaN(lostResources[j])) lostResources[j] = 0
                lostResources[j]++
            }
            else {
                if (isNaN(this.new_resources[j])) this.new_resources[j] = 0
                this.new_resources[j]++
            }
        });

        if (Object.keys(lostResources).length > 0){
            let details = "You lost resources from a transport to " + colonies[t.destination].name + " because the storage was full.<br>Resources lost:"
            for (let i in lostResources) {
                details += "<br>" + lostResources[i] + "x" + " " + i
            }
            notifs.push(new notif("Resources lost!", details))
        }
        this.new_transporters++
    }

    newTransport (transporter) {
        if (this.new_transporters > 0){

            /*let temp_food = this.new_food
            let temp_build_tokens = this.new_build_tokens
            let temp_citizens = this.new_citizens
            let temp_energy_units = this.new_energy_units*/

            let temp_resources = this.new_resources

            transporter.content.forEach(i => {
                if (isNaN(temp_resources[resource_types[i].name])) {
                    temp_resources[resource_types[i].name] = 0
                }

                temp_resources[resource_types[i].name]--
                if (temp_resources[resource_types[i].name] < 0) return false;
            })

            /*for (let i = 0; i < transporter.content.length; i++){
                if (transporter.content[i] == contents.citizen) {
                    temp_citizens--
                }
                else if (transporter.content[i] == contents.build_token) {
                    temp_build_tokens--
                }
                else if (transporter.content[i] == contents.energy_unit) {
                    temp_energy_units--
                }
                else if (transports.content[i] == contents.food) {
                    temp_food++
                }
            }*/

            for (let i = 0; i < temp_resources.length; i++){
                if (0 > temp_resources[i]) return false
            }

            /*this.new_food = temp_food
            this.new_build_tokens = temp_build_tokens
            this.new_citizens = temp_citizens
            this.new_energy_units = temp_energy_units*/
            this.new_resources = temp_resources
            this.new_transporters--
            return true
        }
        return false
    }

    calcScore () {
        return this.citizens.length * this.calcHappiness()
    }

    canAfford (b, doBuild = true) {
        let temp_resources = this.new_resources
        for (let i = 0; i < b.cost.length; i++){
            if (isNaN(temp_resources[b.cost[i][0]]) || temp_resources[b.cost[i][0]] < b.cost[i][1]){
                return false
            }
            else {
                temp_resources[b.cost[i][0]] -= b.cost[i][1]
            }
        }
        if (doBuild) {
            this.new_resources = temp_resources
            this.new_buildings.push(b)
        }
        return true
    }
}

class notif {
    constructor (title, details){
        this.title = title
        this.details = details
    }

    /*returnHTML () {
        return '<div id="notif"><div class="notif_title">' + this.title
        + '</div><div class="notif_details">' + this.details
        + '<button type="button" onclick="closeNotif()">OK</button></div></div>'
    }*/

    returnInnerHTML () {
        return '<div class="notif_title"><div class="window_title_inside">' + this.title
        + '</div></div><div class="notif_details">' + this.details
        + '</div><form id="notif_ok_form"><button type="button" class="notif_ok_button" onclick="closeNotif()">OK</button></form>'
    }
}






function closeNotif() {
    let notifWindow = document.getElementById("notif")
    if (!openNotif()) {
        notifWindow.hidden = true
    }
}

function openNotif() {
    let notifWindow = document.getElementById("notif")
    if (notifs.length > 0){
        notifWindow.hidden = false
        notifWindow.innerHTML = notifs[0].returnInnerHTML()
        notifs.shift()
        return true
    }
    return false
}

function openTransferResources () {
    document.getElementById("big_window_title").innerText = "Transfer resources"
    bigWindowContent = document.getElementById("big_window_details")

    if (editedTransport == null) {
        pointOfDeparture = currentColony
        editedTransport = new transport(currentColony)
    }

    let endResult = "<table id='transfer_table'>"
    
    let coloniesOptions = ""
    for (let i = 0; i < colonies.length; i++) {
        coloniesOptions += "<option value='" + i + "'"
        if (i == pointOfDeparture){
            coloniesOptions += " selected='select'"
        }
        coloniesOptions += ">" + colonies[i].name + "</option>"
    }
    endResult += "<tr><td>Choose point of departure :</td><td><select onchange='updateEditedTransport()' id='point_of_departure'>" + coloniesOptions + "</select></td></tr>"

    coloniesOptions = ""
    for (let i = 0; i < colonies.length; i++) {
        coloniesOptions += "<option value='" + i + "'"
        if (i == editedTransport.destination){
            coloniesOptions += " selected='select'"
        }
        coloniesOptions += ">" + colonies[i].name + "</option>"
    }
    endResult += "<tr><td>Choose colony of destination: </td><td><select onchange='updateEditedTransport()' id='destination'>" + coloniesOptions + "</tr></table><br>"
    endResult += "<div id='transporter_items'>"

    for (let i in editedTransport.content) {
        endResult += "<div class='transporter_item'>" + resource_types[editedTransport.content[i]].name 
        + " (size " + resource_types[editedTransport.content[i]].size + ")<button type='button' class='plus_button' onclick='removeFromEditedTransport(" + i + ")'>-</button></div>"
    }

    endResult += "</div><div class='transporter_item' id='add_to_transport_div'><select onchange='updateEditedTransport()' id='add_to_transport'>"
    for (let i = 0; i < resource_types.length; i++) {
        if (resource_types[i].can_be_transported_normally) {
            endResult += "<option value='" + i + "'"
            if (i == lastSelectedResource) endResult += " selected='select'"
            endResult += ">" + resource_types[i].name + " (size " + resource_types[i].size + ")</option>"
        }
    }
    endResult += "</select><button type='button' class='plus_button' onclick='addToEditedTransport()'>+</button></div>"

    endResult += "<br><button type='button' class='' onclick='sendTransport()'>Send transport</button>"
    bigWindowContent.innerHTML = endResult
    openBigWindow()
}

function removeFromEditedTransport (i) {
    editedTransport.removeFromTransport(i)
    openTransferResources()
}

function addToEditedTransport () {
    if (editedTransport.addToTransport(Number(document.getElementById('add_to_transport').value))) {
        updateEditedTransport()
        openTransferResources()
    }
    else {
        alert("Too little space in the transporter to add that!")
    }
}

function updateEditedTransport () {
    pointOfDeparture = Number(document.getElementById("point_of_departure").value)
    editedTransport.destination = Number(document.getElementById("destination").value)
    lastSelectedResource = Number(document.getElementById("add_to_transport").value)
}

function sendTransport () {
    if (pointOfDeparture == editedTransport.destination) {
        alert("Why would you send resources from a city to itself?")
    }
    else if (colonies[pointOfDeparture].newTransport(editedTransport)){
        updateEditedTransport()
        transports.push(editedTransport)
        editedTransport = null
        closeBigWindow()
    }
    else {
        alert(colonies[pointOfDeparture].name + " can't afford sending that transport.")
    }
}

function openTechTree () {
    document.getElementById("big_window_title").innerText = "Tech tree"
    openBigWindow()
}

function openColonySelection(){
    document.getElementById("big_window_title").innerText = "Select a colony"
    d = document.getElementById("big_window_details")
    d.innerHTML = ""
    for (let i = 0; i < colonies.length; i++){
        if (i == currentColony) d.innerHTML += '<div class="colony_selected">' + colonies[i].name 
        + '<div class="colony_citizen_amount">' + colonies[i].citizens.length + '</div></div>'

        else d.innerHTML += '<div class="colony_select clickable" onclick="selectColony(' + i + ')">' + colonies[i].name
        + '<div class="colony_citizen_amount">' + colonies[i].citizens.length + '</div></div>'
    }
    d.innerHTML += '<div class="colony_select clickable" onclick="createNewColony()">Create a new colony</div>'

    openBigWindow()
}

function openManageFacilities () {
    document.getElementById("big_window_title").innerText = "Manage facilities"
    bigWindowContent = document.getElementById("big_window_details")
    let endResult = ""

    endResult += "<div id='transporter_items'>"

    for (let i = 0; i < colonies[currentColony].buildings.length; i++) {
        endResult += "<div class='transporter_item'>" + colonies[currentColony].buildings[i].name 
        + "<button type='button' class='plus_button' onclick='removeBuilding(" + i + ")'>-</button></div>"
    }

    endResult += "</div><div class='transporter_item' id='add_to_transport_div'><select onchange='updateCurrentFacility()' id='current_facility'>"
    let count = 0
    for (let i in building_types) {
        if (building_types[i].buildable && colonies[currentColony].canAfford(building_types[i], false)) {
            endResult += "<option value='" + i + "'"
            if (i == lastSelectedFacility) endResult += " selected='select'"
            endResult += ">" + count + " " + building_types[i].name + "</option>"
            count++
        }
    }
    if (count == 0) {
        endResult += "<option value='null' selected='select'>Can't afford anything :(</option>"
    }

    endResult += "</select><button type='button' class='plus_button' onclick='buildNewFacility()'>+</button></div>"

    bigWindowContent.innerHTML = endResult
    openBigWindow()
}

function updateCurrentFacility () {
    lastSelectedFacility = document.getElementById("current_facility").value
}

function removeBuilding (i) {
    colonies[currentColony].buildings.splice(i, 1)
    openManageFacilities()
}

function buildNewFacility () {
    updateCurrentFacility()
    if (lastSelectedFacility == null) alert("This colony can't afford to build anything!")
    else colonies[currentColony].canAfford(building_types[lastSelectedFacility])
    openManageFacilities()
}

function openBigWindow () {
    document.getElementById("big_window").hidden = false
}

function closeBigWindow () {
    document.getElementById("big_window").hidden = true
}

function selectColony (n) {
    currentColony = n
    updateResourceManager()
    openColonySelection()
}

function updateResourceManager () {
    document.getElementById("cityName").innerText = colonies[currentColony].name
    local_resources = document.getElementById("local_resources")
    local_resources.innerHTML = ""

    for (let i in colonies[currentColony].resources){
        local_resources.innerHTML += "<tr><td>" + i + ":</td><td>" + colonies[currentColony].resources[i] + "</td></tr>"
    }
}

function createNewColony(){
    if (colonies[currentColony].canAfford(building_types["Colony base"])){
        colonies.push(new colony(0, 0, randomColonyName()))
        openColonySelection()
    }
    else {
        alert("This colony can't afford building a new colony.")
    }
}





const size = {
    research_data: 1,
    citizen: 1,
    build_materials: 4,
    energy_unit: 3,
    food: 2,
    metasubstance: 5,
    fabricated_goods: 3
}

const resource_names = {
    citizen: "Citizen",
    building_materials: "Building materials",
    metasubstance: "Metasubstance",
    fabricated_goods: "Fabricated goods",
    energy_unit: "Energy",
    food: "Food",
    research_data: "Research data"
}

const resource_types = [
    new resource_type(resource_names.citizen, 1, false),
    new resource_type(resource_names.building_materials, 4),
    new resource_type(resource_names.metasubstance, 5),
    new resource_type(resource_names.fabricated_goods, 3),
    new resource_type(resource_names.energy_unit, 10, false),
    new resource_type(resource_names.food, 2),
    new resource_type(resource_names.research_data, 6),
]

const building_types = {
    "Colony base": new building("Colony base", [], [], [[resource_names.building_materials, 10]], 8, 0, 0, 0, 0, [], false),
    "Housing": new building("Housing", [], [[resource_names.energy_unit, 4]], [[resource_names.building_materials, 5], [resource_names.metasubstance, 1]], 3, 0, 0, 0, 6, [resource_names.citizen]),
    "Metasubstance extractor": new building("Metasubstance extractor", [[resource_names.metasubstance, 5]], [[resource_names.energy_unit, 10]], [[resource_names.building_materials, 12]], 5, 0, 0, -1, 0, []),
    "General goods factory": new building("General goods factory", [[resource_names.fabricated_goods, 4]], [[resource_names.energy_unit, 10]], [[resource_names.building_materials, 10], [resource_names.metasubstance, 5]])
}

let lastSelectedResource = null
let lastSelectedFacility = null
let pointOfDeparture = 0
let editedTransport = null
let date = 0
let colonies = []
let notifs = []
let transports = []
let orders = []
let currentColony = 0

function nextTurn () {
    date++
    if (colonies.length == 0){

    }

    for (let i in transports) colonies[transports[i].destination].unpackTransporter(transports[i])
    transports = []

    for (let i = 0; i < colonies.length; i++){
        colonies[i].resources = colonies[i].new_resources
        colonies[i].transporters = colonies[i].new_transporters
        colonies[i].buildings = colonies[i].new_buildings
        colonies[i].consumeProduce()
        colonies[i].oldAgeDeaths()
    }

    /*for (let i = 0; i < colonies.length; i++){
        if (colonies[i]){
            if (colonies[i].food < colonies[i].citizens){
                let amount = colonies[i].citizens.length - colonies[i].food
                for (let j = 0; j < amount; j++){
                    colonies[i].citizens.splice(getRandomInt(0, colonies[i].citizens.length), 1)
                }
                colonies[i].food -= amount
                colonies[i].deaths += amount
                colonies[i].non_old_age_deaths += amount
            }
        }
    }*/
    updateResourceManager()
    openNotif()
}

function load () {
    document.title = "Colony on " + PLANET_NAME

    colonies.push(new colony(0, 0, randomColonyName()))
    colonies.push(new colony(0, 0, randomColonyName()))
    colonies[1].new_resources[resource_names.building_materials] = 30000000000
    colonies[1].new_transporters = 3
    updateResourceManager()
    nextTurn()

    console.log("Script loaded succesfully.")
}