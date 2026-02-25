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

    switchState(bot, trashEntities, garbage, recycle, charger, dt, scene, entities) {

    if (this.currentState.getName() === "Charging") {
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

    if (this.currentState.getName() === "SearchingForItems") {

        var isCollided = this.detectCollision(bot, trashEntities);

        if (isCollided.collided === true) {

            isCollided.item.mesh.visible = false;
            scene.remove(isCollided.item.mesh);

            let removedItem = isCollided.item;
            let index = entities.indexOf(removedItem);
            entities.splice(index, 1);

            if (isCollided.item.type === Item.Type.Trash) {
                this.currentState = this.states[1];
                this.check += 1;
                return Item.Type.Trash;
            } 
            else if (isCollided.item.type === Item.Type.Recyclable) {
                this.currentState = this.states[2];
                this.check += 1;
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

        const dx = bot.mesh.position.x - garbage.mesh.position.x;
        const dz = bot.mesh.position.z - garbage.mesh.position.z;
        const distanceXZ = Math.sqrt(dx * dx + dz * dz);

        if (distanceXZ < 1.0 && !this.isWaiting) {
            bot.velocity.set(0, 0, 0);
            this.isWaiting = true;
            this.dropOffTimer = 0;
        }
    } 

    else if (this.currentState.getName() === "DeliverRecycling") {

        let arriveForce = SteeringBehaviours.arrive(bot, recycle);
        bot.applyForce(arriveForce);

        const dx = bot.mesh.position.x - recycle.mesh.position.x;
        const dz = bot.mesh.position.z - recycle.mesh.position.z;
        const distanceXZ = Math.sqrt(dx * dx + dz * dz);

        if (distanceXZ < 1.0 && !this.isWaiting) {
            bot.velocity.set(0, 0, 0);
            this.isWaiting = true;
            this.dropOffTimer = 0;
        }
    } 

    else if (this.currentState.getName() === "LowBattery") {

        let arriveForce = SteeringBehaviours.arrive(bot, charger, 1.5, 1.5);
        bot.applyForce(arriveForce);

        const dx = bot.mesh.position.x - charger.mesh.position.x;
        const dz = bot.mesh.position.z - charger.mesh.position.z;
        const distanceXZ = Math.sqrt(dx * dx + dz * dz);

        if (distanceXZ < 0.7) {
            bot.velocity.set(0, 0, 0);
            this.currentState = this.states[4];
            this.chargingTimer = 0;
            return;
        }
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