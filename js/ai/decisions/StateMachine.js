import { State } from "./State.js";
import { SteeringBehaviours } from "../steering/SteeringBehaviours.js";
import { Item } from "../../entities/Item.js";

export class StateMachine {
  constructor() {
    // Define the states for the state machine
    this.statesNames = [
      "SearchingForItems",
      "DeliverTrash",
      "DeliverRecycling",
      "LowBattery",
      "Charging",
    ];
    // Create State objects for each state name and store them in an array
    this.states = [];
    
    // Initialize the states array with State objects
    for (let name of this.statesNames) {
      let newState = new State(name);
      this.states.push(newState);
    }


    this.currentState = this.states[0];
    this.check = 0;
    this.chargingTimer = 0;
    this.arrivedAtCharger = false;
    this.dropOffTimer = 0;
    this.isWaiting = false;
  }
   
  // Getter and setter for the current state
  getState() {
    return this.currentState.getName();
  }

  setState(stateName) {
    for (let state of this.states) {
      if (state.getName() === stateName) {
        this.currentState = state;
        break;
      }
    }
  }
  
  // Method to switch states based on conditions
  switchState(bot, trashEntities, garbage, recycle, charger, dt, scene, entities) {
    // Get the name of the current state to determine behavior
    const stateName = this.currentState.getName();
    
    // Handle behavior for each state
    if (stateName === "Charging") {
      console.log("Charging...");
      bot.velocity.set(0, 0, 0);
      this.chargingTimer += dt;

      if (this.chargingTimer >= 3.0) {
        this.chargingTimer = 0;
        this.currentState = this.states[0];
      }
      return;
    }

    if (this.isWaiting) {
      this.dropOffTimer += dt;

      if (this.dropOffTimer >= 1) {
        this.isWaiting = false;
        this.dropOffTimer = 0;

        if (this.check >= 3) {
          this.check = 0;
          this.currentState = this.states[3];
        } else {
          this.currentState = this.states[0];
        }
      }
      return;
    }

    if (stateName === "SearchingForItems") {
      console.log("Searching for items...");
      const isCollided = this.detectCollision(bot, trashEntities);

      if (isCollided.collided === true) {
        isCollided.item.mesh.visible = false;
        scene.remove(isCollided.item.mesh);

        const removedItem = isCollided.item;
        const index = entities.indexOf(removedItem);
        // Remove the item from the entities array
        entities.splice(index, 1);

        if (isCollided.item.type === Item.Type.Trash) {
          this.currentState = this.states[1];
          this.check += 1;
          return Item.Type.Trash;
        } else if (isCollided.item.type === Item.Type.Recyclable) {
          this.currentState = this.states[2];
          this.check += 1;
          return Item.Type.Recyclable;
        }
      } else {
        const wanderForce = SteeringBehaviours.wander(bot);
        bot.applyForce(wanderForce);
      }
    } else if (stateName === "DeliverTrash") {
      const arriveForce = SteeringBehaviours.arrive(bot, garbage);
      bot.applyForce(arriveForce);

      const dx = bot.mesh.position.x - garbage.mesh.position.x;
      const dz = bot.mesh.position.z - garbage.mesh.position.z;
      const distanceXZ = Math.sqrt(dx * dx + dz * dz);

      if (distanceXZ < 1.0 && !this.isWaiting) {
        bot.velocity.set(0, 0, 0);
        this.isWaiting = true;
        this.dropOffTimer = 0;
      }
    } else if (stateName === "DeliverRecycling") {
      const arriveForce = SteeringBehaviours.arrive(bot, recycle);
      bot.applyForce(arriveForce);

      const dx = bot.mesh.position.x - recycle.mesh.position.x;
      const dz = bot.mesh.position.z - recycle.mesh.position.z;
      const distanceXZ = Math.sqrt(dx * dx + dz * dz);

      if (distanceXZ < 1.0 && !this.isWaiting) {
        bot.velocity.set(0, 0, 0);
        this.isWaiting = true;
        this.dropOffTimer = 0;
      }
    } else if (stateName === "LowBattery") {
      console.log("Low battery! Heading to charger.");  
      const arriveForce = SteeringBehaviours.arrive(bot, charger, 1.5, 1.5);
      bot.applyForce(arriveForce);

      const dx = bot.mesh.position.x - charger.mesh.position.x;
      const dz = bot.mesh.position.z - charger.mesh.position.z;
      const distanceXZ = Math.sqrt(dx * dx + dz * dz);

      if (distanceXZ < 0.5) {
        bot.velocity.set(0, 0, 0);
        this.currentState = this.states[4];
        this.chargingTimer = 0;
        return;
      }
    }
  }
  
  // Method to detect collision between the bot and trash entities
  detectCollision(bot, trashEntities) {
    for (let trash of trashEntities) {
      if (!trash.mesh) {
        continue;
      }

      const botPos = bot.mesh.position;
      const trashPos = trash.mesh.position;

      const dx = botPos.x - trashPos.x;
      const dz = botPos.z - trashPos.z;
      const distance = Math.sqrt(dx * dx + dz * dz);

      const collisionDistance = 1.5;

      if (distance < collisionDistance) {
        console.log("Collision detected with "+ trash.type.toString()+ "!");
        // Return the collided item so it can be removed from the scene and entities array
        return { collided: true, item: trash };
      }
    }
    // No collision detected
    return { collided: false, item: null };
  }
}