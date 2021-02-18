logger = {
    output : document.getElementById("output"),
    logInfo : function (string) {
        output.innerText += string + "\n"
    }
}


class TwitchData {
    static ClientID = "9bksp3cxt84auuicqxnnuk1y4mhrd6"
    static ClientSecret = "fvilbl2jku0xixwfmz5euqi4vnml7f"
    constructor(){
        this.streamerName = "";
        this.streamerID = ""
        this.TwitchKey = ""
        this.PolyKey = ""
    }
    async Populate(){
        this.PolyKey = document.getElementById("PolyKey").value
        this.streamerName = document.getElementById("StreamerName").value
        await this.getTwitchKey()
        await this.getStreamerId()
    }
    async getTwitchKey(){
        if (this.TwitchKey) return
        let response = await fetch("https://id.twitch.tv/oauth2/token?client_id=" + TwitchData.ClientID + "&client_secret=" + TwitchData.ClientSecret + "&grant_type=client_credentials", 
            {
                method: "post"
            }
        )
        let data = await response.json()
        this.TwitchKey = data["access_token"]
        console.log("Twitch key retrived")
    }
    async getStreamerId(){
        this.streamerID = ""
        let response = await fetch("https://api.twitch.tv/helix/users?login=" + this.streamerName,
        {
            method: "get",
            headers: {
                "Authorization": "Bearer " + this.TwitchKey,
                "Client-ID": TwitchData.ClientID
            }
        }
        )
        data = await response.json()
        if (data.error){
            console.log("error while getting streamer key: " + data.error)
        }
        else {
            if (data.data.length == 0){
                alert("streamer not found")
            }
            else {
                this.streamerID = data.data[0].id
                console.log("Streamer ID retrived")
            }
            
        }
        
    }
}
let twitch = new TwitchData()
let slot_stored = new BridgeSaveData()

target_string = "m_Bridge"
target = [109, 95, 66, 114, 105, 100, 103, 101]

function getSlot(){
    inp = document.getElementById("file_input")
    if (inp.files.length > 0){
        var reader = new FileReader()
        reader.onload = function () {
            var arrayBuffer = this.result,
            array = new Uint8Array(arrayBuffer)
            processSlot(array)
            document.getElementById("slotOutput").innerText = "Loaded " + inp.files[0].name
        };
        reader.readAsArrayBuffer(inp.files[0])
    }
}
window.data = []
function processSlot(data){
    console.log("Processing Slot...")
    index = new TextDecoder("ascii").decode(data).search("m_Bridge")
    data = data.slice(index+54)
    //logger.logInfo(new TextDecoder("ascii").decode(data))
    window.data = data
    let slot = BridgeSaveData.DeserializeBinary(data)
    console.log("Deserialised slot file")
    slot_stored = slot
    //console.log(slot)
    //let serialised = slot.SerializeBinary()
    //console.log("Serialised slot file")
    //let slot2 = BridgeSaveData.DeserializeBinary(serialised)
    //console.log("Deserialised slot file from the serialised version")
    //console.log(slot2)
}
async function submitSlot(){
    if (!twitch.PolyKey){
        alert("Please enter you pb2 twitch extension key!")
        return
    }
    await twitch.Populate()
    if (!twitch.streamerID || !twitch.streamerName || !twitch.TwitchKey) {
        alert("A field is missing!")
        return
    }
    let slot = slot_stored
    // twitch detection node
    let addTwitchDetectionNode = true
    slot.m_BridgeJoints.forEach(joint => {
        if (joint.m_Guid == "Bram2323IsTheBest!") addTwitchDetectionNode = false
    })
    if (addTwitchDetectionNode) slot.m_BridgeJoints.push(new BridgeJointProxy(new Vector(0,0, -10000), false, false, "Bram2323IsTheBest!"))
    let payloadBytes = slot.SerializeBinary()

    let connectResponse = await fetch("https://api.t2.drycactus.com/v1/viewer/stream/" + twitch.streamerID + "/connect",
        {
            method: "post",
            headers: {
                "Authorization": "Bearer " + twitch.PolyKey,
                "accept": "application/json"
            }
        }
    )
    let connectJSON = await connectResponse.json()
    console.log(connectJSON)

    
    let GetLevelResponse = await fetch("https://api.t2.drycactus.com/v1/" + "viewer/stream/" + twitch.streamerID + "/pull?delay=0",
        {
            method: "get",
            headers: {
                "Authorization": "Bearer " + twitch.PolyKey,
                "accept": "application/json"
            }
        }
    )
    let levelResponseJSON = await GetLevelResponse.json()
    console.log(levelResponseJSON)
    let levelHash = levelResponseJSON.level_hash
    console.log(levelHash)
    //let gzip_payload = new FormData();
    //gzip_payload.append("content", new Blob(payloadBytes, {type: "binary"}))
    let gzip_response = await fetch("./api/gzip",
        {
            method: "post",
            headers: {
                "Content-Type":"application/octet-stream"
            },
            body: payloadBytes
        }
    )
    let gzipped_data = await gzip_response.arrayBuffer()
    gzipped_data = new Uint8Array(gzipped_data)
    console.log(gzipped_data)
    console.log("Recieved gzipped data.")

    let form = new FormData()
    form.append("payload", new Blob([gzipped_data]), "file.zip")
    form.append("payload_hash", md5(gzipped_data))
    form.append("level_hash", levelHash)

    let sendBridgeResponse = await fetch("https://api.t2.drycactus.com/v1/" + "viewer/stream/" + twitch.streamerID + "/push",
        {
            method: "post",
            headers: {
                "Authorization": "Bearer " + twitch.PolyKey,
                "accept": "application/json"
            },
            body: form
        }
    )
    let sendBridgeResponseJSON = await sendBridgeResponse.json()
    console.log(sendBridgeResponseJSON)
    if (sendBridgeResponseJSON.id){
        alert("sent bridge!")
    }
    else {
        alert("an error occured: " + sendBridgeResponse)
    }
    
}