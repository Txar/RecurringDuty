const CHARACTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789._-"
const COLONY_NAMES = 
["New Warsaw", "Taciturn", "Lurk", "Stiff",
"Twig", "Courage", "Weeged", "Domino Hub",
"Splendor", "Fineld", "Prosperity", "Backbone",
"Prime Candidate", "Bushy", "Verid", "Sahly",

"Shembah", "Collyman", "Plockstick", "Krummer",
"Lherman", "Stember", "Otrob", "Galloklam", "Frenkhan"]

function planetNameGenerator(nameLength){
    let name = ""
    for (let i = 0; i < nameLength; i++){
        name += CHARACTERS.charAt(Math.random(CHARACTERS.length) * (CHARACTERS.length))
    }
    return name
}

//document.getElementById('element').hidden = true

console.log(planetNameGenerator(Math.random(10) * 10 + 3))

document.title = "Colony on " + planetNameGenerator(Math.random(10) * 10 + 3)