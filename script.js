const canvas = document.querySelector('canvas')
const ctx = canvas.getContext('2d')
const audio = new Audio('sound.mp3')

canvas.width = innerWidth
canvas.height = innerHeight

setTimeout(()=>{
    audio.currentTime = 2
    audio.play()
    audio.loop =true
},500)

const middle =V(canvas.width/2, canvas.height/2)

function drawCircle(x, y, r, color) {
    ctx.fillStyle = color
    ctx.beginPath()
    ctx.arc(x, y, r, 0, 2 * Math.PI)
    ctx.fill()
}

const nodes = []

function createNode() {
    let node = {
        radius: 5,
        position: V(300, 200),
        velocity: V(0.2, 0.1),
        color: 'rgb(200, 10, 10)',
        move(dt) {
            node.position.add(node.velocity.times(dt))
        },
        draw() {
            drawCircle(node.position.x, node.position.y, node.radius, node.color)
        },
        checkEdgeBounce() {
            if (node.position.y >= canvas.height - node.radius) {
                node.velocity.y = -node.velocity.y
                node.position.y = canvas.height - node.radius
            }
            if (node.position.x >= canvas.width - node.radius) {
                // right wall
                node.velocity.x = -node.velocity.x
                node.position.x = canvas.width - node.radius
            }
            if (node.position.y <= node.radius) {
                node.velocity.y = -node.velocity.y
                node.position.y = node.radius
            }
            if (node.position.x <= node.radius) {
                // left wall
                node.velocity.x = -node.velocity.x
                node.position.x = node.radius
            }
        }

    }
    return node
}

function checkEdgeBounce() {
    for (node of nodes) {
        node.checkEdgeBounce()
    }
}

function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
}

function moveNodes(dt) {
    for (node of nodes) {
        node.move(dt)
    }
}

const maxDistance = 100
const minDistance = 10

function rescale(min, max, value){
    return (value-min)/(max-min)
}

function drawLine(p1, p2, color){
    ctx.strokeStyle = color
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.moveTo(p1.x, p1.y)
    ctx.lineTo(p2.x, p2.y)
    ctx.stroke()
}

function drawConnection(node1, node2){
    let displacement = node2.position.minus(node1.position)
    let distance = displacement.norm()
    let alpha = rescale(maxDistance, minDistance, distance)
    let color = `hsla(180, 90%, 46%, ${alpha})`
    if(displacement.norm()<=maxDistance){
        // displacement.debugDraw(ctx, node1.position, 1, false, color)
        drawLine(node2.position, node1.position, color)
        if(distance>minDistance){
            // let nudge = displacement.normalize().times(-0.000001*distance) //ATTRACTION B/W NODES --ACTS LIKE SPRING ATTRACTION(-)&Repulsion for (+)
            let nudge = displacement.normalize().times(-0.01/(distance*distance)) //GRAVITY+Attraction -- ACTS LIKE SPRING ATTRACTION(-)&Repulsion for (+)
            node2.velocity.add(nudge)
            node1.velocity.subtract(nudge)
        }
    }
}

function drawConnections(){
    for (let i = 0; i < nodes.length; i++) {
        let node1 = nodes[i]
        for (let j = i + 1 ; j < nodes.length; j++) {
            let node2 = nodes[j]  
            drawConnection(node1, node2)       
        }        
    }
}

function draw() {
    clearCanvas()
    drawConnections()
    for (node of nodes) {
        node.draw()
    }
}

function frame(dt) {
    checkEdgeBounce()
    moveNodes(dt)
    draw()
}

let prevTime = 0
function animate() {
    let now = performance.now()
    let dt = now - prevTime
    prevTime = now
    requestAnimationFrame(animate)
    frame(dt)
}

function lerp(min, max, value){
    return (max-min)*value+min
}

// lerp(3,5,1) //return 5
// lerp(3,5,0.5) //return 4
// lerp(3,5,0) //return 3

function setup() {
    for (let i = 0; i < 90; i++) {
        let node = createNode()
        node.position.randomize(lerp(0, canvas.width/2, Math.random())).add(middle)
        node.velocity.randomize(lerp(0.08, 0.03, Math.random()))
        nodes.push(node)
    }
}

setup()
animate()
// restart()