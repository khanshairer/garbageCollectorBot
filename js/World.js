import * as THREE from 'three';
import * as Setup from './setup.js';
import { DynamicEntity } from './entities/DynamicEntity.js';
import { LevelMap } from './maps/LevelMap.js';

import { Item } from './entities/Item.js';


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
    this.addEntityToWorld(this.recycloBot);
  
  }

  // Add an entity to the world
  addEntityToWorld(entity) {
    this.scene.add(entity.mesh);
    this.entities.push(entity);
  }

  // Update our world
  update() {
    let dt = this.clock.getDelta();

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