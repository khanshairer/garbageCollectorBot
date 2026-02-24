import {State} from "./State.js";
export class StateMachine{
 init(){
    this.statesNames = ["SearchingForItems","DeliverTrash","LowBattery","DeliverRecycling","Charging"];
    this.states = []
    
    for(var name of this.StateNames){
        var newState = new State(name);
        this.states.push(newState);
    }
    
    this.currentState = this.states[0];
    this.events = ["Found recyclable","Found Trash","3s elasped","less than 3 itmesHandled","3 items handled","Arrived at charger"]
    }

   getState(){
    return this.currentState;
   }

   switchState(eventHappen){
          if(this.currentState.name){
            
          }
       }



}