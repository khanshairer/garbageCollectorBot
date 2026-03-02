// State class to represent each state in the state machine
export class State {
  constructor(name, actionable = true) {
    this.name = name;
    this.actionable = actionable;
    this.isDone = false;
  }
  // Getter and setter methods for state properties
  getName() {
    return this.name;
  }

  setName(name) {
    this.name = name;
  }
  
  // Getter and setter for actionable property
  isActionable() {
    return this.actionable;
  }

  setActionable(actionable) {
    this.actionable = actionable;
  }
  
  // Getter and setter for isDone property
  getIsDone() {
    return this.isDone;
  }

  setIsDone(isDone) {
    this.isDone = isDone;
  }
}