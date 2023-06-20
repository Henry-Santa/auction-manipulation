const REFORGES = ["Raggedy","Strengthened","Waxed","Fortunate","Excellent","Bustling","Honed","Hardened","Blooming","Glistening","NotSo","Dull","Hyper","Fair","Renowned","Loving","Gentle","Odd","Fast","Fair","Epic","Sharp","Heroic","Spicy","Legendary","Dirty","Fabled","Suspicious","Gilded","Warped","Withered","Bulky","Salty","Treacherous","Stiff","Lucky","Very","Highly","Extremely","Thicc","Absolutely","Even More", "Wise","Strong","Superior","Heavy","Light","Perfect","Refined","Deadly","Fine","Grand","Hasty","Neat","Rapid","Unreal","Awkward","Rich","Precise","Spiritual","Headstrong","Clean","Fierce","Mythic","Pure","Smart","Titanic","Necrotic","Ancient","Spiked","Cubic","Reinforced","Loving","Ridiculous","Empowered","Giant","Submerged","Jaded","Bizarre","Itchy","Ominous","Pleasant","Pretty","Shiny","Simple","Strange","Vivid","Godly","Demonic","Forceful","Hurtful","Keen","Strong","Unpleasant","Zealous","Silky","Bloody","Shaded","Sweet","Moil","Toil","Blessed","Bountiful","Magnetic","Fruitful","Refined","Stellar","Mithraic","Auspicious","Fleet","Heated","Ambered"]
const ALPHA = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"

const API = "https://api.hypixel.net/skyblock/auctions?page=0"
const ITEMSAPI = "https://api.hypixel.net/resources/skyblock/items"

const urlParams = new URLSearchParams(window.location.search);
const myParam = urlParams.get('item');

var uuidName = new Map()

var itemTable = new Map()

numberSort = function (a,b) {
    return a - b;
};

function createWidget(auctionInfo){
    console.log(auctionInfo)
    
    var image_link = "https://nmsr.nickac.dev/headiso/" + auctionInfo.n
    var price = auctionInfo.p
    var name = uuidName.get(auctionInfo.n)
    console.log(name)
    var container = document.createElement("div")
    container.style.display = "block"
    container.classList.add("widget")
    container.style.height = "100%"
    container.style.backgroundColor = "rgba(194,37,69,0.5)"
    document.getElementById("b").appendChild(container);
    
    var namecontainer = document.createElement("div")
    namecontainer.style.display = "block"
    container.appendChild(namecontainer)
    var image = document.createElement("img")
    image.src = image_link
    image.classList.add("small-image")
    namecontainer.appendChild(image)
    var priceText = document.createElement("h2")
    priceText.classList.add("coin")
    priceText.textContent = price.toLocaleString()
    priceText.style.color = "black"
    priceText.style["-webkit-text-fill-color"] = "black"
    container.appendChild(priceText)
    var nameLabel = document.createElement("h2")
    nameLabel.classList.add("name-label");
    nameLabel.textContent = name
    nameLabel.style["-webkit-text-fill-color"] = "black"
    nameLabel.style.color = "black"
    namecontainer.appendChild(nameLabel)
}

async function getItemTable(){
    var resp = await fetch(ITEMSAPI);
    var json = await resp.json()
    json.items.forEach(async item => {
        let real_name = ""
        for (let char of item.name){
            if (ALPHA.includes(char)) {
                real_name += char;
            }
        }
        REFORGES.forEach(reforge => {
            real_name = real_name.replace(reforge, "")
        })
        var image_link = "./images/" + item.material.toLowerCase() + ".png"
        if (item.material == "SKULL_ITEM"){
            if (item.skin == undefined){
                console.log(item)
            } else{
                var hash = JSON.parse(atob(item.skin)).textures.SKIN.url.split("/")
                hash = hash[hash.length-1]
                image_link = "https://nmsr.nickac.dev/headiso/" + hash
                
            }
        }

        itemTable.set(real_name, {name : item.name, id : item.id, image : image_link})
    })
}
async function loadPage(){
    await getItemTable()
    document.getElementById("main").src = itemTable.get(myParam).image;
    if (itemTable.get(myParam).image.includes("png")){
        document.getElementById("a").classList.add("item");
    }
    document.getElementById("name").innerText = itemTable.get(myParam).name;
    var resp = await fetch(API)
    var json = await resp.json()
    var pages = json.totalPages

    var items = new Map()
    var promises = []
    for (let i = 0; i < pages; i++){
        promises.push(new Promise(async (resolve, reject) => {
            
        
        var response = await fetch(`https://api.hypixel.net/skyblock/auctions?page=${i}`)
        var j = await response.json()
        j.auctions.forEach(auction => {
            if (!auction.bin) { }
            else {
                let real_name = ""
                for (let char of auction["item_name"]){
                    if (ALPHA.includes(char)) {
                        real_name += char;
                    }
                }
                REFORGES.forEach(reforge => {
                    real_name = real_name.replace(reforge, "")
                })
                if (real_name == "HurricaneBowx") {
                    real_name = "HurricaneBow"
                }
                if (!(items.has(real_name))){
                    items.set(real_name, [])
                }

                items.get(real_name).push({p:auction["starting_bid"], n:auction["auctioneer"]})
            }
        });
        console.log("Page loaded", i)
        resolve()
    }))
    }
    await Promise.all(promises)
    const myItem = items.get(myParam)
    var nameLookup = []
    for (let priceinfo of myItem){
        nameLookup.push(new Promise( async (resolve, reject) => {
            let resp = await fetch("https://api.minetools.eu/uuid/" + priceinfo.n)
            let jso = await resp.json()
            let name = jso.name
            console.log(name)
            priceinfo.name = name
            uuidName.set(priceinfo.n, name)
            resolve()
        }
        ))
        
    }
    await Promise.all(nameLookup)
    myItem.sort((a,b) => {
        return a.p - b.p
    })
    
    console.log(myItem)
    myItem.forEach(p => {
        console.log(p.name)
        console.log(uuidName.get(p.n))
        createWidget(p, p.name)
    })
}
loadPage()

const nroof = document.getElementById("b");

nroof.addEventListener("wheel", (evt) => {
    evt.preventDefault();
    console.log(evt.deltaY)
    for (let i = 0; i < 300; i++){
        setTimeout(()=> {
            if (evt.deltaY > 0) {nroof.scrollLeft += 3} else{
                nroof.scrollLeft -= 3;
            }
            
        }, i)
    }
    
});