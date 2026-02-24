import * as THREE from 'three';
import * as Setup from './setup.js';
import { DynamicEntity } from './entities/DynamicEntity.js';
import { LevelMap } from './maps/LevelMap.js';

import { Item } from './entities/Item.js';
import { SteeringBehaviours } from './ai/steering/SteeringBehaviours.js';


/**
 * World class holds all information about our game's world
 */
export class World {

  // Creates a world instance
  constructor() {
    this.scene = Setup.createScene();
    this.camera = Setup.createCamera();
    this.renderer = Setup.createRenderer();

    this.clock = new THREE.Clock();

    this.entities = [];
  }

  // Initialize objects in our world
  init() {
    this.map = new LevelMap();
    
    Setup.createLight(this.scene);
    Setup.showHelpers(this.scene, this.camera, this.renderer, this.map);

    // Creating RecycloBot
    this.recycloBot = new DynamicEntity({ 
      position: this.map.getRandomPosition(),
      color: 'red'
    });

    // Create a charger
    this.charger = new Item({ 
    type: Item.Type.Charger,
    position : new THREE.Vector3(0,0,12),
    color:"yellow" 
    });

    // create a trash bin
    this.trash_bin  = new Item({ 
    type: Item.Type.TrashBin,
    position : new THREE.Vector3(-12,0,0),
    color:"black" 
    }); 
    
    // create a recylce bin
    this.recyle_bin = new Item({ 
    type: Item.Type.RecyclingBin,
    position : new THREE.Vector3(12,0,0),
    color:"blue" 
    }); 

    // make trashes
    this.MakeMessyAround(15);


    this.addEntityToWorld(this.recycloBot);
    this.addEntityToWorld(this.charger);
    this.addEntityToWorld(this.trash_bin);
    this.addEntityToWorld(this.recyle_bin);
  
  }

  // Add an entity to the world
  addEntityToWorld(entity) {
    this.scene.add(entity.mesh);
    this.entities.push(entity);
  }
  
  // create objects at random locations 
  MakeMessyAround(n, minDistance = 1.5){  // Add minimum distance parameter
    let i = 0;
    let Maxtry = 0;
    let usedPositions = [];  // Store as array for distance checking
    usedPositions.push({x: this.recyle_bin.position.x, z: this.recyle_bin.position.z});
    usedPositions.push({x: this.trash_bin.position.x, z: this.recyle_bin.position.z});
    usedPositions.push({x: this.charger.position.x, z: this.recyle_bin.position.z});
    while(i < n && Maxtry < 500){
        Maxtry++;
        
        let x_axis = Math.floor(Math.random() * 25) - 12;
        let z_axis = Math.floor(Math.random() * 25) - 12;
        
        // Check distance from all existing items
        let tooClose = false;
        for(let pos of usedPositions) {
            let dx = pos.x - x_axis;
            let dz = pos.z - z_axis;
            let distance = Math.sqrt(dx*dx + dz*dz);
            
            if(distance < minDistance) {
                tooClose = true;
                break;
            }
        }
        
        if(tooClose) {
            continue;  // Skip if too close to another item
        }
        
        // Store position for future distance checks
        usedPositions.push({x: x_axis, z: z_axis});
        
        // Create the item
        let itemType = x_axis % 2 === 0 ? Item.Type.Trash : Item.Type.Recyclable;
        let itemColor = x_axis % 2 === 0 ? "brown" : "pink";
        
        let item = new Item({ 
            type: itemType,
            position: new THREE.Vector3(x_axis, 0, z_axis),
            color: itemColor 
        });
        
        this.addEntityToWorld(item);
        i++;
    }
    
    if(Maxtry >= 500) {
        console.log(`Only placed ${i} items out of ${n} requested (max attempts reached)`);
    }
}


  // Update our world
  update() {
    let dt = this.clock.getDelta();
    var wander = SteeringBehaviours.wander(this.recycloBot);
    this.recycloBot.applyForce(wander);



    for (let e of this.entities) {
      if (e.update)
        e.update(dt, this.map);
    }
  }

  // Render our world
  render() {
    this.renderer.render(this.scene, this.camera);
  }

}