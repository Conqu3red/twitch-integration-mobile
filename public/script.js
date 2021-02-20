class TwitchData {
    constructor(){
        this.ClientID = "9bksp3cxt84auuicqxnnuk1y4mhrd6"
        this.ClientSecret = "fvilbl2jku0xixwfmz5euqi4vnml7f"
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
        let response = await fetch("https://id.twitch.tv/oauth2/token?client_id=" + this.ClientID + "&client_secret=" + this.ClientSecret + "&grant_type=client_credentials", 
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
                "Client-ID": this.ClientID
            }
        }
        )
        data = await response.json()
        if (data.error){
            console.log("error while getting streamer key: " + data.error)
        }
        else {
            if (data.data.length == 0){
                //alert("streamer not found")
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
    recreateCanvasController()
    updateCanvas()
    //console.log(slot)
    //let serialised = slot.SerializeBinary()
    //console.log("Serialised slot file")
    //let slot2 = BridgeSaveData.DeserializeBinary(serialised)
    //console.log("Deserialised slot file from the serialised version")
    //console.log(slot2)
}
async function submitSlot(){
    twitch.PolyKey = document.getElementById("PolyKey").value
    if (!twitch.PolyKey){
        alert("Please enter you pb2 twitch extension key!")
        return
    }
    await twitch.Populate()
    if (!twitch.streamerID){
        alert("streamer not found!")
        return
    }
    if (!twitch.streamerName || !twitch.TwitchKey) {
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
    if (connectResponse.status === 401){
        alert("invalid twitch extension key!")
        return
    }
    let connectJSON = await connectResponse.json()
    console.log(connectJSON)
    if (connectResponse.status === 418){
        alert("An error occured: " + connectJSON.message)
        return
    }

    
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
    let gzipped_data = pako.gzip(payloadBytes, {to: "binary"})
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


function distanceBetween(p1, p2){
    return Math.sqrt((p1.y-p2.y)**2+(p1.x-p2.x)**2)
}


// slot viewer

HTMLCanvasElement.prototype.getPointClicked = function (event) {
    var totalOffsetX = 0;
    var totalOffsetY = 0;
    var canvasX = 0;
    var canvasY = 0;
    var currentElement = this;

    do {
        totalOffsetX += currentElement.offsetLeft;
        totalOffsetY += currentElement.offsetTop;
    }
    while (currentElement = currentElement.offsetParent)

    canvasX = event.pageX - totalOffsetX;
    canvasY = event.pageY - totalOffsetY;

    // Fix for variable canvas width
    canvasX = Math.round( canvasX * (this.width / this.offsetWidth) );
    canvasY = Math.round( canvasY * (this.height / this.offsetHeight) );

    return new Vector(canvasX, canvasY)
}



let material_names = [
    null,
    "Road", "Reinforced Road", "Wood",
    "Steel", "Hydraulics", "Rope",
    "Cable", "Bungee Rope", "Spring"
]
let material_colors = [
    null, 
    "#5d4335", "#af621f", "#e3b06e",
    "#ba5d61", "#0966d6", "#8f6017",
    "#2f2f34", "#000000", "#d0af00"
]
let material_widths = [
    null,
    0.16, 0.16, 0.10,
    0.14, 0.14, 0.08,
    0.06, 0.14, 0.16
]
let material_cost_per_meter = [
    null,
    200, 400, 180,
    450, 750, 220,
    400, 000, 330
]
let material_total_lengths = [
    null, 
    0, 0, 0,
    0, 0, 0,
    0, 0, 0
]

function mapBridgeToCanvas(canvas, bottom_left, top_right){
    let x_scale = canvas.width/Math.abs(bottom_left.x-top_right.x)
    let y_scale = canvas.height/Math.abs(bottom_left.y-top_right.y)
    canvasController.scale = Math.min(x_scale, y_scale)
    canvasController.offset.x = - (bottom_left.x * canvasController.scale)
    canvasController.offset.y = canvas.height - (bottom_left.y * -canvasController.scale)
}


function drawCircle(context, position, radius, fill=false, startAngle=0, endAngle=360){
    let pos = canvasController.WorldToCameraPos(position)
    context.beginPath()
    context.arc(pos.x, pos.y, canvasController.scale*radius, startAngle/180 * Math.PI, endAngle/180 * Math.PI)
    if (fill) {
        context.fill()
    }
    else {
        context.stroke()
    }
}
function drawLine(context, p1, p2, width=0.1){
    p1 = canvasController.WorldToCameraPos(p1)
    p2 = canvasController.WorldToCameraPos(p2)
    context.lineWidth = width*canvasController.scale
    context.beginPath();
    context.moveTo(p1.x, p1.y);
    context.lineTo(p2.x, p2.y);
    context.stroke();
}

function drawRect(context, position, width, height, fill=false){
    let pos = canvasController.WorldToCameraPos(position)
    if (fill) {
        context.fillRect(pos.x, pos.y, canvasController.scale*width, canvasController.scale*height)
    }
    else {
        context.strokeRect(pos.x, pos.y, canvasController.scale*width, canvasController.scale*height)
    }
}

function drawSquare(context, position, radius, fill=false){
    let pos = canvasController.WorldToCameraPos(position)
    
    if (fill) {
        context.fillRect(pos.x-(canvasController.scale*radius), pos.y-(canvasController.scale*radius), canvasController.scale*radius*2, canvasController.scale*radius*2)
    }
    else {
        context.strokeRect(pos.x-(canvasController.scale*radius), pos.y-(canvasController.scale*radius), canvasController.scale*radius*2, canvasController.scale*radius*2)
    }
}



function drawNode(context, node){
    context.fillStyle = "yellow"
    context.strokeStyle = "black"
    context.lineWidth = 0.01*canvasController.scale
    drawCircle(context, node.m_Pos, 0.1, true)
    if (node.m_IsSplit){
        context.fillStyle = "#29f811"
        drawCircle(context, node.m_Pos, 0.1, true, 270, 90)
        drawLine(context, new Vector(node.m_Pos).sub(new Vector(0,0.1)), new Vector(node.m_Pos).add(new Vector(0,0.1)), 0.01)
    }
    drawCircle(context, node.m_Pos, 0.1)
}

function drawAnchor(context, anchor){
    context.fillStyle = "red"
    context.strokeStyle = "black"
    context.lineWidth = 0.01*canvasController.scale
    if (anchor.m_IsSplit){
        drawRect(context, new Vector(anchor.m_Pos).add(new Vector(-0.1,0.1)), 0.1, 0.2, true)
        drawRect(context, new Vector(anchor.m_Pos).add(new Vector(-0.1,0.1)), 0.1, 0.2, false)
        context.fillStyle = "#29f811"
        drawCircle(context, anchor.m_Pos, 0.1, true, 270, 90)
        drawCircle(context, anchor.m_Pos, 0.1, false, 270, 90)
    }
    else {
        drawSquare(context, anchor.m_Pos, 0.1, true)
        drawSquare(context, anchor.m_Pos, 0.1)
    }
}

function drawEdge(context, edge){
    // find positions
    let p1 = new Vector(), p2 = new Vector()
    slot_stored.m_BridgeJoints.concat(slot_stored.m_Anchors).forEach(joint => {
        if (joint.m_Guid == edge.m_NodeA_Guid){
            p1 = joint.m_Pos
        }
    })
    slot_stored.m_BridgeJoints.concat(slot_stored.m_Anchors).forEach(joint => {
        if (joint.m_Guid == edge.m_NodeB_Guid){
            p2 = joint.m_Pos
        }
    })
    context.strokeStyle = material_colors[edge.m_Material]
    drawLine(context, p1, p2, material_widths[edge.m_Material])
}

function calcLength(edge){
    let p1 = new Vector(), p2 = new Vector()
    slot_stored.m_BridgeJoints.concat(slot_stored.m_Anchors).forEach(joint => {
        if (joint.m_Guid == edge.m_NodeA_Guid){
            p1 = joint.m_Pos
        }
    })
    slot_stored.m_BridgeJoints.concat(slot_stored.m_Anchors).forEach(joint => {
        if (joint.m_Guid == edge.m_NodeB_Guid){
            p2 = joint.m_Pos
        }
    })
    material_total_lengths[edge.m_Material] += distanceBetween(p1,p2)
}


var container = document.getElementById("container")
var canvas = document.getElementById("canV"); 
var ctx = canvas.getContext("2d");
var summary = document.getElementById("slot_summary")

function recreateCanvasController(){
    let left = Infinity, right = -Infinity, top = -Infinity, bottom = Infinity
    slot_stored.m_BridgeJoints.concat(slot_stored.m_Anchors).forEach(joint => {
        left = joint.m_Pos.x < left ? joint.m_Pos.x : left
        right = joint.m_Pos.x > right ? joint.m_Pos.x : right
        top = joint.m_Pos.y > top ? joint.m_Pos.y : top
        bottom = joint.m_Pos.y < bottom ? joint.m_Pos.y : bottom
    })
    mapBridgeToCanvas(canvas, new Vector(left-1, bottom-1), new Vector(right+1, top+1))
}
let canvasController = {
    scale: 1,
    offset: new Vector(0,0),
    WorldToCameraPos: function (point){
        let response = new Vector(point)
        response.x = response.x*this.scale+this.offset.x
        response.y = response.y*(-this.scale)+this.offset.y
        return response
    }
}
recreateCanvasController()

updateCanvas()

let movementHandler = {
    leftMouseButtonPressed: false,
    prevPos: new Vector(),
    mobilePrevScale: 0
}
canvas.addEventListener("mousedown", e => {
    //console.log("left click down")
    if (e.button == 0){
        movementHandler.prevPos = canvas.getPointClicked(e)
        movementHandler.leftMouseButtonPressed = true
    }
})
canvas.addEventListener("mouseup", e => {
    //console.log(canvas.getPointClicked(e))
    //console.log("left click up")
    if (e.button == 0) movementHandler.leftMouseButtonPressed = false
})
canvas.addEventListener("mousemove", e => {
    if (movementHandler.leftMouseButtonPressed){
        canvasController.offset.add(canvas.getPointClicked(e).sub(movementHandler.prevPos))
        movementHandler.prevPos = canvas.getPointClicked(e)
    }
    //console.log(e)
})
canvas.onwheel = e => {
    e.preventDefault();
    canvasController.scale -= e.deltaY/50
}
canvas.ontouchstart = e => {
    e.preventDefault();
    movementHandler.prevPos = canvas.getPointClicked(e)
    //console.info(movementHandler.prevPos.x + " " + movementHandler.prevPos.y)
    movementHandler.leftMouseButtonPressed = true
}
canvas.ontouchmove = e => {
    if (movementHandler.leftMouseButtonPressed){
        canvasController.offset.add(canvas.getPointClicked(e).sub(movementHandler.prevPos))
        movementHandler.prevPos = canvas.getPointClicked(e)
    }
}
canvas.ontouchend = e => {
    movementHandler.leftMouseButtonPressed = false
}
canvas.ongesturestart = e => {
    movementHandler.mobilePrevScale = e.scale
}
canvas.ongesturechange = e => {
    canvasController.scale += (e.scale-movementHandler.mobilePrevScale)*100
    movementHandler.mobilePrevScale = e.scale
}


function updateCanvas(){
    // fill background
    ctx.fillStyle = "#283c64"
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // calculate prices
    material_total_lengths = [null,0,0,0,0,0,0,0,0,0]
    slot_stored.m_BridgeEdges.forEach(edge => {
        calcLength(edge)
    })
    while (summary.rows.length > 1){
        summary.deleteRow(1)
    }
    let totalCost = 0
    for (var i in material_names){
        if (i == 0) continue;
        let row = summary.insertRow()
        row.insertCell().textContent = material_names[i]
        row.insertCell().textContent = material_total_lengths[i].toLocaleString() + "m"
        totalCost += material_total_lengths[i]*material_cost_per_meter[i]
        row.insertCell().textContent = "$" + (material_total_lengths[i]*material_cost_per_meter[i]).toLocaleString()
    }
    let row = summary.insertRow()
    row.insertCell().textContent = "Total"
    row.insertCell().textContent =  material_total_lengths.reduce((a, b) => a + b, 0).toLocaleString() + "m"

    row.insertCell().textContent = "$" + totalCost.toLocaleString()

    // edges
    slot_stored.m_BridgeEdges.forEach(edge => {
        drawEdge(ctx, edge)
    })
    // joints
    slot_stored.m_BridgeJoints.forEach(joint => {
        drawNode(ctx, joint)
    })

    // anchors
    slot_stored.m_Anchors.forEach(anchor => {
        drawAnchor(ctx, anchor)
    })
}

setInterval(updateCanvas, 50)