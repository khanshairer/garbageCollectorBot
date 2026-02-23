import { RoundEntity } from './RoundEntity.js';

// Item class
export class Item extends RoundEntity {

  // Possible item types 
  static Type = Object.freeze({
    Charger: Symbol("charger"),
    TrashBin: Symbol("trash-bin"),
    RecyclingBin: Symbol("recycling-bin"),
    Trash: Symbol("trash"),
    Recyclable: Symbol("recyclable")
  });

  // Item constructor
  constructor({
    type = Type.Trash,
    ...entityConfig
  } = {}) {
    super({
      // Height is just set to 0.1 for the video demo
      height: 0.1,
      ...entityConfig,
    });
    this.type = type;
  }

}