const REFORGES = ["Raggedy","Strengthened","Waxed","Fortunate","Excellent","Bustling","Honed","Hardened","Blooming","Glistening","NotSo","Dull","Hyper","Fair","Renowned","Loving","Gentle","Odd","Fast","Fair","Epic","Sharp","Heroic","Spicy","Legendary","Dirty","Fabled","Suspicious","Gilded","Warped","Withered","Bulky","Salty","Treacherous","Stiff","Lucky","Very","Highly","Extremely","Thicc","Absolutely","Even More", "Wise","Strong","Superior","Heavy","Light","Perfect","Refined","Deadly","Fine","Grand","Hasty","Neat","Rapid","Unreal","Awkward","Rich","Precise","Spiritual","Headstrong","Clean","Fierce","Mythic","Pure","Smart","Titanic","Necrotic","Ancient","Spiked","Cubic","Reinforced","Loving","Ridiculous","Empowered","Giant","Submerged","Jaded","Bizarre","Itchy","Ominous","Pleasant","Pretty","Shiny","Simple","Strange","Vivid","Godly","Demonic","Forceful","Hurtful","Keen","Strong","Unpleasant","Zealous","Silky","Bloody","Shaded","Sweet","Moil","Toil","Blessed","Bountiful","Magnetic","Fruitful","Refined","Stellar","Mithraic","Auspicious","Fleet","Heated","Ambered"]
const ALPHA = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"

const API = "https://api.hypixel.net/skyblock/auctions?page=0"
const ITEMSAPI = "https://api.hypixel.net/resources/skyblock/items"

var itemTable = new Map()

numberSort = function (a,b) {
    return a - b;
};



function createWidget(imageUrl, itemName, buyoutPrice, roofPrice, isRoof, real_name) {
    const containerId = isRoof ? 'roof' : 'no-roof';
    const container = document.getElementById(containerId);

    const widget = document.createElement('div');
    widget.classList.add('widget');
    if (isRoof) {
    widget.classList.add('roof');
    }

    const name = document.createElement('h3');
    name.textContent = itemName;
    widget.appendChild(name);

    const imageContainer = document.createElement('div');
    imageContainer.classList.add('image-container');
    const imageL = document.createElement('a');
    imageL.href = "./viewer.html?item="+real_name
    imageL.target = "_blank"
    const image = document.createElement('img');
    image.src = imageUrl;
    if (image.src.includes("png")){
        imageContainer.classList.add("item");
    }
    imageContainer.appendChild(imageL);
    imageL.appendChild(image)

    widget.appendChild(imageContainer);

    const priceContainer = document.createElement('div');
    priceContainer.classList.add('price-container');

    const buyoutLabel = document.createElement('p');
    buyoutLabel.textContent = 'Buyout Price: ';
    priceContainer.appendChild(buyoutLabel);

    const buyout = document.createElement('span');
    buyout.classList.add('price');
    buyout.textContent = '$' + buyoutPrice.toLocaleString("en-US");;
    buyoutLabel.appendChild(buyout);

    if (isRoof) {
        const roofPriceLabel = document.createElement('p');
    roofPriceLabel.textContent = 'Roof Price: ';
    priceContainer.appendChild(roofPriceLabel);
    const roofPriceElement = document.createElement('span');
    roofPriceElement.classList.add('price');
    roofPriceElement.textContent = '$' + roofPrice.toLocaleString("en-US");;
    roofPriceLabel.appendChild(roofPriceElement);
    }
    widget.appendChild(priceContainer);

    container.appendChild(widget);
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

async function getManips(MAX_ITEMS, MIN_ITEMS, MAX_BUY_IN, MIN_MULTI, MIN_FLAT, MAX_MIN_PRICE, MIN_MIN_PRICE, HIDE_NO_ROOF_MANIPS, HIDE_DUNGEON_ITEMS){

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
            else if (auction["item_lore"].toLowerCase().includes("furniture")) { }
            else if (auction["item_name"].toLowerCase().includes("pet skin")) { }
            else if (auction["item_name"].toLowerCase().includes("minion skin")) { }
            else if (auction["item_name"].toLowerCase().includes("potion")) { }
            else if (auction["item_lore"].toLowerCase().includes("cosmetic")) { }
            else if (auction["item_name"].toLowerCase().includes("rune")) { }
            else if (auction["item_lore"].toLowerCase().includes("dungeon") && HIDE_DUNGEON_ITEMS) { }
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

                items.get(real_name).push(auction["starting_bid"])
            }
        });
        console.log("Page loaded", i)
        resolve()
    }))
    }
    await Promise.all(promises)
    var roof_manips = new Map()
    var no_roof_manips = new Map()
    


    items.forEach((prices, itemname) => {
        prices.sort(numberSort);
        let m_price = prices[0]
        let h_price = m_price
        let money_left = MAX_BUY_IN
        if (m_price > MAX_MIN_PRICE || m_price < MIN_MIN_PRICE){  } else{
            let ind = 0;
            while (money_left > 0 && ind < prices.length){
                h_price = prices[ind];
                money_left -= h_price
            
                if (money_left < 0){
                    money_left += h_price
                    break
                }
                ind++
            }
            if ((h_price > m_price * MIN_MULTI && h_price >= MIN_FLAT) || ind === prices.length){
                if (ind < MIN_ITEMS || ind > MAX_ITEMS){
                
                } else if ( money_left < 0){

                } else if (prices.length == ind){
                    no_roof_manips.set(itemname, MAX_BUY_IN - money_left)
                
                } else{
                    roof_manips.set(itemname, [h_price, MAX_BUY_IN - money_left])
                }
            }
        }
        
    })
    document.getElementById("roof").innerHTML = ""
    document.getElementById("no-roof").innerHTML = ""
    roof_manips = new Map([...roof_manips.entries()].sort((a, b) => b[1][0] - a[1][0]));
    no_roof_manips = new Map([...no_roof_manips.entries()].sort((a, b) => a[1] - b[1]));

    
    roof_manips.forEach((data, name) => {
        try{
        item_data = itemTable.get(name);
        createWidget(item_data.image, item_data.name, data[1], data[0], true, name)
        } catch{
            console.log(name, data)
        }
    })
    console.log(no_roof_manips)
    no_roof_manips.forEach((data, name) => {
        try{
        item_data = itemTable.get(name);

        createWidget(item_data.image, item_data.name, data, 0, false, name)
        } catch{
            console.log(name, data)
        }
    })
}

getItemTable();




  // Example usage:

document.getElementById('submitButton').addEventListener('click', function() {
    const maxItems = document.getElementById('maxItems').value;
    const minItems = document.getElementById('minItems').value;
    const maxBuyIn = document.getElementById('maxBuyIn').value;
    const minMultiplier = document.getElementById('minMultiplier').value;
    const minFlat = document.getElementById('minFlat').value;
    const maxFirstPrice = document.getElementById('maxFirstPrice').value;
    const minFirstPrice = document.getElementById('minFirstPrice').value;
    const hideDungeon = document.getElementById('hideDungeonItems').value;

    document.getElementById("roof").innerHTML = "Loading..."
    document.getElementById("no-roof").innerHTML = "Loading..."

    getManips(maxItems, minItems, maxBuyIn, minMultiplier, minFlat, maxFirstPrice, minFirstPrice, false, hideDungeon);

    
});


const roof = document.getElementById("roof");

roof.addEventListener("wheel", (evt) => {
    evt.preventDefault();
    for (let i = 0; i < 300; i++){
        setTimeout(()=> {
            roof.scrollLeft += evt.deltaY
        }, i)
    }
});
const nroof = document.getElementById("no-roof");

nroof.addEventListener("wheel", (evt) => {
    evt.preventDefault();
    for (let i = 0; i < 300; i++){
        setTimeout(()=> {
            nroof.scrollLeft += evt.deltaY
        }, i)
    }
    
});