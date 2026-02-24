
export class State {
    constructor(name) {
        this.name = name;
        //this.actionable = actionable;
        this.isDone = false;
        
    }

    getName(){
        return this.name;
    }

    getAction(){
        if(this.actionable === false){
            return null;
        }
        if(this.name == "SearchingForItems"){
            return "wander";
        }


    }



}