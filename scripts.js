import * as  THREE from 'three'
import gsap from 'gsap'
import {OrbitControls} from 'three/addons/controls/OrbitControls.js'
import {PointerLockControls} from 'three/addons/controls/PointerLockControls.js'
import GUI from 'lil-gui'
import { color, cross, debug } from 'three/tsl'
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js'
import { Camera, Object3D, Raycaster, SpriteMaterial } from 'three/webgpu'

/* little doc

    things i need to research:
    instantiation of objects (maybe its just scene.add), hit detection(trancing, bulletspawn),
    events and or colision, possibly text actually

    juice ideas:
    impulse reaction of a duck getting hit, the other ducks get tiltet away from the impact point, curtains move
    particles, ofc. satisfying hit sounds, woow and ooh sounds(could be annoying).
    quack sounds, water splashes

    tinted Ducks that give special effects when hit. could be highlighted with a gasp sound on spawn
    and point lights highlighting it. confetti when hit, like a proper circus
    Homing bullets, bullet refill, inifite bullets
    BIG Bullets (would require slower ducks that have multiple targets(and more HP) where all targets need to be hit)

    environment interaction. Everytime player shoots tent in the back it moves(along with curtains).
    Player shoots curtain 5 times, it falls down. Another color appears.
    can repeat 3 times, after blue comes red then green after that the wood wall.
    That one will move lightly whenever it is hit


    controldecision
    either fps style, where the player can move the camera with limited frame,
    or the standard crosshair that is moved with the mouse and the camera (or the objects)
    are slightly moving depending on the position of the cursor

*/

/*
    stage 1 tutorial
        dimmed background highlighting a single duck. With a message "click to shoot"/"can you hit the duck?"
        *player shoots*
        -> hits duck: confetti, lights turn on, normal game starts
        -> doesnt hit duck: ???
    stage 2 game loop

*/

// #region Projectsetup, Inputs

    //#region basic Projectsetup

    const clock = new THREE.Clock()
    const scene = new THREE.Scene()

    //canvas
    const canvas = document.querySelector('canvas.webgl')
    const canvasSize = { width: window.innerWidth, height: window.innerHeight}

    //Camera
    var aspectRatio = canvasSize.width / canvasSize.height
    const camera = new THREE.PerspectiveCamera(75, aspectRatio , .1, 100)
    camera.position.set(0,0,7)
    scene.add(camera)
    //const camera = new THREE.OrthographicCamera(-3 * aspectRatio, 3 * aspectRatio, -3, 3, 0.1 , 1000)

    //renderer
    const renderer = new THREE.WebGLRenderer({
        canvas: canvas
    })
    renderer.setSize(canvasSize.width , canvasSize.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

    //Listener for resizing the window, updating all required variables
    window.addEventListener('resize', ()=>{
        canvasSize.width = window.innerWidth
        canvasSize.height = window.innerHeight
        aspectRatio = canvasSize.width / canvasSize.height
        //weird that the resetting of camera.aspect is needed. if i set aspectRatio, the variable should be
        //updated in the camera object. it probably copies the value on assign it instead of referencing
        camera.aspect = aspectRatio
        camera.updateProjectionMatrix()
        renderer.setSize(canvasSize.width,canvasSize.height)
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    })
    // #endregion

    // #region Inputs

    //const inputs = new OrbitControls(camera, canvas)
    //inputs.minPolarAngle = Math.PI * 0.4
    //inputs.maxPolarAngle = Math.PI * 0.6
    //inputs.enableDamping = true
    //inputs.isLocked = true

    const rayCaster = new THREE.Raycaster()
    const rayOrigin = camera.position.clone()
    let mousePos = {x: 0, y: 0}
    window.addEventListener('mousemove', (event)=>{
        mousePos.x = (event.clientX /window.innerWidth * 2) - 1
        mousePos.y = 1 - (event.clientY /window.innerHeight * 2)
    })
    window.addEventListener('click', ()=>{

        //functionality with aiming the mouse
        const coordMultiplier = 2
        rayCaster.setFromCamera(mousePos,camera)
        const intersectedObjs = rayCaster.intersectObjects(scene.children, true)
        intersectedObjs[0].object.remove()
        scene.remove(intersectedObjs[0].object)

    })
    //on double click toggle fullscreen
    window.addEventListener('dblclick', ()=>{

        const fullscreenElement = document.fullscreenElement || document.webkitFullscreenElement
        if(fullscreenElement)
        {
            //this syntax "?.()" is called optional chaining. 
            // it checks if the method is valid/exists before running the method
            document.exitFullscreen?.()
            document.webkitFullscreenElement?.()
        }else {
            canvas.requestFullscreen?.()
            canvas.webkitFullscreenElement?.()
        }

    })

    // #endregion
// #endregion


// #region helperFunctions

    function instantiate(obj, position, scale, rotation){
        const objCopy = obj.clone()
        position? objCopy.position.copy(position) : null
        scale? objCopy.scale.copy(scale) : null
        rotation? objCopy.rotation.copy(rotation) : null

        scene.add(objCopy)
        return objCopy
    }
    
    let targetCounter = 0
    function instantiateShootingTarget(obj, position, scale, rotation){
        instantiate(obj, position, scale, rotation)
        targetCounter++
    }
// #endregion

// #region Loaders, geometry, Hud

    // #region Loaders

    const loadManager = new THREE.LoadingManager()
    loadManager.onError =  (texture)=>{
        console.log('OnError', texture)
    }
    const texLoader = new THREE.TextureLoader(loadManager)
    const gltfLoader = new GLTFLoader(loadManager)
    //the empty arrow func is there to fool the program, that the onload function is implemented.
    //theres an error while loading if its not there so, dont touch.
    gltfLoader.load('/models/StaticMeshesLightsCamera.gltf', (gltf)=>{
        //console.log(gltf)
        scene.add(gltf.scene)
    })
    gltfLoader.load('/models/TargetsHudMovableAssets.gltf', (gltf)=>{
        console.log(gltf)
        addHudOnLoad(gltf)

        //assign Meshes
        wave1 = gltf.scene.getObjectByName('waves001')
        wave2 = gltf.scene.getObjectByName('waves002')
        wave3 = wave1.clone()
        DuckYellow1 = gltf.scene.getObjectByName('TargetDuckYellow005')
        DuckYellow2 = gltf.scene.getObjectByName('TargetDuckYellow006')
        standWood1 = gltf.scene.getObjectByName('StandWood003')
        standWood2 = gltf.scene.getObjectByName('StandWood004')
        standWoodBroken = gltf.scene.getObjectByName('StandWoodHit002')
        standMetal = gltf.scene.getObjectByName('StandMetal001')
        standMetalBroken = gltf.scene.getObjectByName('StandMetalHit002')
        standWood1.position.set(-.1,-1.95,-0.1)
        standWood2.position.set(-.1,-1.95,-0.1)
        standMetal.position.set(-.1,-1.95,-0.1)
        standWoodBroken.position.set(-.1,-1.95,-0.1)
        standMetalBroken.position.set(-.1,-1.95,-0.1)


        //Assign Meshes to targetGroups
        TargetDuckYellow1.add(DuckYellow1)
        TargetDuckYellow1.add(standWood1)
        TargetDuckYellow2.add(DuckYellow2)
        TargetDuckYellow2.add(standMetal)
        //add Meshes
        scene.add(wave1)
        scene.add(wave2)
        scene.add(wave3)

        gltfObjsLoaded=true

    })


    // #endregion
    // #region geometry
    //const axesHelper = new THREE.AxesHelper()
    //scene.add(axesHelper)

    let gltfObjsLoaded = false
    let wave1
    let wave2
    let wave3
    let DuckYellow1
    let DuckYellow2
    let standWood1
    let standWood2
    let standWoodBroken
    let standMetal
    let standMetalBroken
    let crosshair


    const TargetDuckYellow1 = new THREE.Group
    const TargetDuckYellow2 = new THREE.Group
    
    

    //camera.lookAt(axesHelper.position)
    // #endregion
    // #region hud
    //const cameraHud = new THREE.OrthographicCamera(0, window.innerWidth,window.innerHeight, 0, -10, 10)
    //cameraHud.position.set(0,0,7)
    function addHudOnLoad(gltf){
        crosshair = gltf.scene.children[0]
    }

    // #endregion

// #endregion


// #region drawdebugstuff
const gui = new GUI({
    width: 300,
    title: 'draw debug stuff',
    closeFolders: true
}).hide()

window.addEventListener('keydown', (event) =>{
    //the gui._hidden part returns a bool and turns the entire thing into a toggle, very handy
    if(event.key == 'h') gui.show(gui._hidden)
})

const debugVars = {}

const guiFolderWaves = gui.addFolder('waves')
const wavePos= {
    wave1x: 15, wave1y: -2.25,  wave2x: -15, wave2y: -2.375, wave3x: 15, wave3y: -2.5   
}

// #endregion

//event tick
const eventTick = () =>{
    
    
    //set timevariables
    let elapsedTime = clock.getElapsedTime()
    
    //object updates
    if(gltfObjsLoaded){
        //Animate
        wave1.position.set(wavePos.wave1x + Math.sin(elapsedTime*.6) , wavePos.wave1y +(Math.sin(elapsedTime*.6)*.1),(Math.sin(elapsedTime*.6)*.1))
        wave2.position.set(wavePos.wave2x - Math.sin(elapsedTime*.8), wavePos.wave2y +(Math.sin(elapsedTime*.8)*.1), 1 +(Math.sin(elapsedTime*.8)*.1))
        wave3.position.set(wavePos.wave3x + Math.sin(elapsedTime), wavePos.wave3y +(Math.sin(elapsedTime)*.1), 2 + (Math.sin(elapsedTime)*.1))

        instantiate(TargetDuckYellow1, new THREE.Vector3(1,0,0))
    
    }

    elapsedTime > 100?  elapsedTime = 0 : null
    //inputs.update()
    renderer.render(scene, camera)
    window.requestAnimationFrame(eventTick)

}
eventTick()
