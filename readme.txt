Assignment 3 – RecycloBot

Author:

Name : Sharier Khan
Email : sharierk@mun.ca 
Version : 1.0.0

Changes Made:

1. Implemented class-based StateMachine in:
   - ai/decisions/StateMachine.js
   - ai/decisions/State.js

2. Added five states:
   - SearchingForItems
   - DeliverTrash
   - DeliverRecycling
   - LowBattery
   - Charging

3. Modified World.js:
   - Added StateMachine instance
   - Added switchState() call inside update()
   - Added MakeMessyAround() for creating trashes at the begining and respawning items  
   - Added trash bin, recycling bin, and charger stations in init

4. Added GLTF robot model and attached to DynamicEntity mesh.

5. Added textured floor(in showHelpers method) and additional lighting(in createLight method) in setup.js.

6. Algorithm Used : As specified by Professor.

How to Run:

- Open index.html using Live Server.(write "npx vite" in command line)
- Ensure woodenTexture.jpg and robot model folder exist.