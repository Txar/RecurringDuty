const CHARACTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789._-"
const COLONY_NAMES = 
["New Warsaw", "Taciturn", "Lurk", "Stiff",
"Twig", "Courage", "Weeged", "Domino Hub",
"Splendor", "Fineld", "Prosperity", "Backbone",
"Prime Candidate", "Bushy", "Verid", "Sahly",

"Shembah", "Collyman", "Plockstick", "Krummer",
"Lherman", "Stember", "Otrob", "Galloklam", "Frenkhan",
"Xhenmen", "Mloomer", "Ohmnem", "Reefreder", "Gheern",
"Ozklerh", "Phernomack", "Walplunk", "Greckcheck",
"Bhenmbre", "Plinmfen", "Phokmer", "Chunmack"]

function randomColonyName(){
    return COLONY_NAMES[getRandomInt(0, COLONY_NAMES.length - 1)]
}

const MIN_DEATH_AGE = 30

const PLANET_NAME = planetNameGenerator(Math.random(10) * 10 + 3)

const TRANSPORTER_CAPACITY = 12
const STORAGE_CAPACITY = 60
const POWERHOUSE_PRODUCTION = 10
const TRANSPORTER_PRODUCTION = 0.2

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

const contents = {
    citizen: 0,
    build_token: 1,
    energy_unit: 2,
    food: 3
}

class resource_type {
    constructor (name, size) {
        this.name = name
        this.size = size
    }
}

function getRandomInt (min, max) {
    return Math.floor(Math.random() * (max - min) ) + min;
}

function planetNameGenerator (nameLength) {
    let name = ""
    for (let i = 0; i < nameLength; i++){
        name += CHARACTERS.charAt(Math.random(CHARACTERS.length) * (CHARACTERS.length))
    }
    return name
}

class transport {
    constructor (destination) {
        this.content = []
        this.weight = 0
        this.destination = destination
    }
    
    addToTransport (content) {
        if (size[content] + this.weight <= TRANSPORTER_CAPACITY){
            this.weight += size[content]
            this.content.push(content)
            return true
        }
        return false
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
        if (Math.random() > 0.88){
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
    constructor (name, production, consumption, cost, maintenance_interval = 3, workers = 0, worker_happiness_improvement = 0, colony_happiness_improvement = 0, storage_capacity = 0, storage_types = [], buildable = true) {
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
    }

    canBeStored (resource_name) {
        if (this.storage_capacity == 0) return false

        for (let i = 0; i < this.storage_types.length; i++) {
            if (this.storage_capacity[i] == resource_name) return true
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
        this.new_build_tokens = 0
        this.new_energy_units = 0
        this.new_food = 0
        this.new_transporters = 0
        this.new_citizens = 0

        this.buildings = []
    }

    capacity() {
        return STORAGE_CAPACITY * this.storages
    }

    canCitizensBeBorn () {
        return this.citizens.some(citizen => citizen.gender == gender.female) && this.citizens.some(citizen => citizen.gender == gender.male)
    }

    oldAgeDeaths () {
        let new_citizens = []
        for (let i = 0; i < this.citizens.length; i++){
            if (Math.random() > this.citizens[i].oldAgeDeathProbability) {
                new_citizens.push(this.citizens[i])
            }
        }
        this.citizens = new_citizens
    }

    calcHappiness () {
        return 0
    }

    newTransport (transporter) {
        if (this.new_transporters > 0){

            /*let temp_food = this.new_food
            let temp_build_tokens = this.new_build_tokens
            let temp_citizens = this.new_citizens
            let temp_energy_units = this.new_energy_units*/

            let transporter_copy = transporter

            let temp_resources = new_resources

            while (transporter_copy.length > 0){
                this.temp_resources[transporter_copy[0]]--
                if (this.temp_resources[transporter_copy[0]] < 0) return false;
                transporter_copy.shift()
            }

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

            for (let i = 0; i < this.temp_resources.length; i++){
                if (0 > this.temp_resources[i]) return false
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

    calcScore() {
        return this.citizens.length * this.calcHappiness()
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
    if (notifs.length > 0){
        notifWindow.innerHTML = notifs[0].returnInnerHTML
        notifs.pop(0)
    }
    else {
        notifWindow.hidden = true
    }
}

function openNotif() {
    let notifWindow = document.getElementById("notif")
    if (notifs.length > 0){
        notifWindow.hidden = false
        notifWindow.innerHTML = notifs[0].returnInnerHTML()
        notifs.pop(0)
        return true
    }
    return false
}

function nextTurn () {
    date++
    if (colonies.length == 0){

    }

    for (let i = 0; i < colonies.length; i++){
        colonies[i].citizens = colonies[i].new_citizens
        colonies[i].transporters = colonies[i].new_transporters
        colonies[i].food = colonies[i].new_food
        colonies[i].build_tokens = colonies[i].new_build_tokens
        colonies[i].energy_units = colonies[i].new_energy_units
        colonies[i].oldAgeDeaths()
    }

    for (let i = 0; i < transports.length; i++){
        colonies[transport[i].destination]++
        for (let j = 0; j < transports.content.length; j++){
            if (transports.content[j] == contents.citizen) {
                colonies[transports[i].destination].citizens++
            }
            else if (transports.content[j] == contents.build_token) {
                colonies[transports[i].destination].build_token++
            }
            else if (transports.content[j] == contents.energy_unit) {
                colonies[transports[i].destination].energy_unit++
            }
            else if (transports.content[j] == contents.food) {
                colonies[transports[i].destination].food++
            }
        }
    }
    transports = []

    for (let i = 0; i < colonies.length; i++){
        if (colonies[i]){
            if (colonies[i].food < colonies[i].citizens){
                let amount = colonies[i].citizens.length - colonies[i].food
                for (let j = 0; j < amount; j++){
                    colonies[i].citizens[getRandomInt(0, colonies[i].citizens.length)].pop
                }
                colonies[i].food -= amount
                colonies[i].deaths += amount
                colonies[i].non_old_age_deaths += amount
            }
        }
    }
    openNotif()
}

function openTransferResources(){
    document.getElementById("big_window_title").innerText = "Transfer resources"
    bigWindowContent = document.getElementById("big_window_details")
    openBigWindow()
}

function openTechTree(){
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

        else d.innerHTML += '<div class="colony_select" onclick="selectColony(' + i + ')">' + colonies[i].name
        + '<div class="colony_citizen_amount">' + colonies[i].citizens.length + '</div></div>'
    }
    d.innerHTML += '<div class="colony_select" onclick="createNewColony()">Create a new colony</div>'

    openBigWindow()
}

function openManageFacilities(){
    document.getElementById("big_window_title").innerText = "Manage facilities"
    openBigWindow()
}

function openBigWindow(){
    document.getElementById("big_window").hidden = false
}

function closeBigWindow(){
    document.getElementById("big_window").hidden = true
}

function selectColony(n){
    currentColony = n
    openColonySelection()
}

function createNewColony(){
    
}

//document.getElementById('element').hidden = true

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
    new resource_type(resource_names.citizen, 1),
    new resource_type(resource_names.building_materials, 4),
    new resource_type(resource_names.metasubstance, 5),
    new resource_type(resource_names.fabricated_goods, 3),
    new resource_type(resource_names.energy_unit, 10),
    new resource_type(resource_names.food, 2),
    new resource_type(resource_names.research_data, 1),
]

const building_types = [
    new building("Colony base", [], [], [[resource_names.building_materials, 10]], 8, 0, 0, 0, 0, [], false),
    new building("Housing", [], [[resource_names.energy_unit, 4]], [[resource_names.building_materials, 5], [resource_names.metasubstance, 1]], 3, 0, 0, 0, 6, [resource_names.citizen]),
    new building("Metasubstance extractor", [[resource_names.metasubstance, 5]], [[resource_names.energy_unit, 10]], [[resource_names.building_materials, 12]], 5, 0, 0, -1, 0, []),
    new building("General goods factory", [[resource_names.fabricated_goods, 4]], [[resource_names.energy_unit, 10]], [[resource_names.building_materials, 10], [resource_names.metasubstance, 5]])
]

let date = 0
let colonies = []
let notifs = []
let transports = []
let orders = []
let currentColony = 0

function load () {
    notifs.push(new notif("haha", "this is a test"))

    openNotif()

    document.getElementById("cityName").innerText = COLONY_NAMES[getRandomInt(0, COLONY_NAMES.length)]
    document.title = "Colony on " + PLANET_NAME

    colonies.push(new colony(0, 0, randomColonyName()))
    colonies.push(new colony(0, 0, randomColonyName()))
}