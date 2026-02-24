import { State } from "./State.js";
import { SteeringBehaviours } from '../steering/SteeringBehaviours.js';
import { Item } from '../../entities/Item.js';

export class StateMachine {
    constructor() {
        this.statesNames = ["SearchingForItems", "DeliverTrash", "DeliverRecycling", "LowBattery", "Charging"];
        this.states = [];
        
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

    getState() {
        return this.currentState;
    }

    switchState(bot, trashEntities, garbage, recycle, charger, dt,scene,entities) {
    // Don't process state changes if charging (wait for timer)
    if (this.currentState.getName() === "Charging") {
        this.chargingTimer += dt;
        if (this.chargingTimer >= 3.0) {
            console.log("3 seconds have passed - done charging");
            this.chargingTimer = 0;
            this.currentState = this.states[0]; // Switch back to searching
        }
        return;
    }
    
    // Handle drop-off waiting state
    if (this.isWaiting) {
        this.dropOffTimer += dt;
        if (this.dropOffTimer >= 1) {
            console.log("Drop-off wait complete");
            this.isWaiting = false;
            this.dropOffTimer = 0;
            
            console.log(`Current check value: ${this.check}`);
            
            if (this.check >= 3) {
                console.log("Delivered 3 items - battery low");
                this.check = 0; // Reset check
                this.currentState = this.states[3]; // LowBattery
            } else {
                console.log("Back to searching for more items");
                this.currentState = this.states[0]; // Back to Searching
            }
        }
        return;
    }
    
    if (this.currentState.getName() === "SearchingForItems") {
        var isCollided = this.detectCollision(bot, trashEntities);
        if (isCollided.collided === true) {
            isCollided.item.mesh.visible = false;
            scene.remove(isCollided.item);
            // Store the removed item to return
            let removedItem = isCollided.item;
             let index = entities.indexOf(removedItem);
            entities.splice(index, 1);
            console.log(`Item removed from entities array at index ${index}`);
            console.log(removedItem.type);
        
            if (isCollided.item.type.toString() === "Symbol(trash)") {
                console.log("Found trash - delivering to trash bin");
                this.currentState = this.states[1]; // DeliverTrash
                this.check += 1;
                console.log(`Item count: ${this.check}`);
                return Item.Type.Trash;  
            } else if (isCollided.item.type.toString() === "Symbol(recyclable)") {
                console.log("Found recyclable - delivering to recycling bin");
                this.currentState = this.states[2]; // DeliverRecycling
                this.check += 1;
                console.log(`Item count: ${this.check}`);
                return Item.Type.Recyclable; 
            }
           


        } else {
            var wanderForce = SteeringBehaviours.wander(bot);
            bot.applyForce(wanderForce);
        }
    } 
    else if (this.currentState.getName() === "DeliverTrash") {
        let arriveForce = SteeringBehaviours.arrive(bot, garbage);
        bot.applyForce(arriveForce);
        
        let distance = bot.mesh.position.distanceTo(garbage.mesh.position);
        if (distance < 1.0 && !this.isWaiting) {
            console.log("Arrived at trash bin - waiting 1.5 seconds");
            console.log(`Current check before wait: ${this.check}`);
            bot.velocity.set(0, 0, 0);
            this.isWaiting = true;
            this.dropOffTimer = 0;
        }
    } 
    else if (this.currentState.getName() === "DeliverRecycling") {
        let arriveForce = SteeringBehaviours.arrive(bot, recycle);
        bot.applyForce(arriveForce);
        
        let distance = bot.mesh.position.distanceTo(recycle.mesh.position);
        if (distance < 1.0 && !this.isWaiting) {
            console.log("Arrived at recycling bin - waiting 1.5 seconds");
            console.log(`Current check before wait: ${this.check}`);
            bot.velocity.set(0, 0, 0);
            this.isWaiting = true;
            this.dropOffTimer = 0;
        }
    } 
    else if (this.currentState.getName() === "LowBattery") {
        console.log("Going to charger...");
        let arriveForce = SteeringBehaviours.arrive(bot, charger,0.5,0.5);
        bot.applyForce(arriveForce);
        let distance = bot.mesh.position.distanceTo(charger.mesh.position);

        
        if (distance < .7) {
            console.log("Arrived at charger - charging...");
            this.currentState = this.states[4]; // Charging
                bot.velocity.set(0, 0, 0);

            this.chargingTimer = 0;
            return;
        }
    }

    else if (this.currentState.getName() === "Charging") {
    // Increment timer
    this.chargingTimer += dt;
    console.log(`Charging: ${this.chargingTimer.toFixed(2)}/3.0 seconds`);
    
    // Stop the bot from moving
    bot.velocity.set(0, 0, 0);
    
    // Check if 3 seconds have passed
    if (this.chargingTimer >= 3.0) {
        console.log("3 seconds have passed - done charging, now wandering");
        this.chargingTimer = 0;
        this.currentState = this.states[0]; // Switch back to SearchingForItems (wandering)
    }
    return; // Don't process other states
}
}
    detectCollision(bot, trashEntities) {
        for (let trash of trashEntities) {
            if (!trash.mesh) continue;
            
            let botPos = bot.mesh.position;
            let trashPos = trash.mesh.position;
            
            let dx = botPos.x - trashPos.x;
            let dz = botPos.z - trashPos.z;
            let distance = Math.sqrt(dx * dx + dz * dz);
            
            let collisionDistance = 1.5;
            
            if (distance < collisionDistance) {
                console.log("Collision detected with trash!");
                return { collided: true, item: trash };
            }
        }
        
        return { collided: false, item: null };
    }
}