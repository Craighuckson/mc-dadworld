import { world, EntitySpawnAfterEvent, Entity, EquipmentSlot, EntityComponentTypes} from "@minecraft/server";
import { ModalFormData } from "@minecraft/server-ui";
// Define variables
var restrictedAreas = [];
var allowedPlayer = null;
var storageKey = "restrictedAreaData";

Entity


//UTILITY FUNCTIONS

// Function to check if a position is within the restricted area. Returns false if player is not limited from building or breaking here
function isWithinRestrictedArea(x, y, z, playerName) {
    for (let area of restrictedAreas) {
        if (x >= area.x1 && x <= area.x2 &&
            y >= area.y1 && y <= area.y2 &&
            z >= area.z1 && z <= area.z2) {
            if (playerName === area.allowedPlayer) {
                return false;
            }
            return true;
        }
    }
    return false;
}

function loadData() {
    try {
        const data = world.getDynamicProperty(storageKey)
        restrictedAreas = JSON.parse(data);
    } catch (e) {

    };
}

function saveData() {
    const data = JSON.stringify(restrictedAreas);
    world.setDynamicProperty(storageKey, data);
}

function getAllRestrictedAreas() {

}



function hasTag(player, tag) {
    return player.getTags().includes(tag);
}


//HANDLERS
// Event handler for block break
world.beforeEvents.playerBreakBlock.subscribe((event) => {
    const player = event.player;
    const playerName = player.name;
    const blockPosition = event.block.location;
    try {
        if (isWithinRestrictedArea(blockPosition.x, blockPosition.y, blockPosition.z, playerName) && !hasTag(player, 'admin')) {
            event.cancel = true;
            player.sendMessage("You are not allowed to break blocks in this area.");
        }
    }
    catch (e) {
    };

});

// Event handler for block place
world.beforeEvents.playerPlaceBlock.subscribe((event) => {
    const player = event.player;
    const playerName = player.name;
    const blockPosition = event.block.location;
    try {
        if (isWithinRestrictedArea(blockPosition.x, blockPosition.y, blockPosition.z, playerName) && !hasTag(player, 'admin')) {
            event.cancel = true;
            player.sendMessage("You are not allowed to place blocks in this area.");
        }
    }
    catch (e) {
    };
});

//PARSED CHAT COMMANDS
// Command to set the restricted area and allowed player

world.beforeEvents.chatSend.subscribe((event) => {
    const message = event.message;
    const sender = event.sender;

    if (message.startsWith("$setrestrictedarea")) {
        if (!hasTag(sender, 'admin')) {
            sender.sendMessage('Only the owner of the world can do this');
            return;
        }
        const args = message.split(" ");
        if (args.length === 8) {
            const x1 = parseInt(args[1]);
            const y1 = parseInt(args[2]);
            const z1 = parseInt(args[3]);
            const x2 = parseInt(args[4]);
            const y2 = parseInt(args[5]);
            const z2 = parseInt(args[6]);
            const player = args[7];

            let restrictedArea = {
                x1: Math.min(x1, x2),
                y1: Math.min(y1, y2),
                z1: Math.min(z1, z2),
                x2: Math.max(x1, x2),
                y2: Math.max(y1, y2),
                z2: Math.max(z1, z2),
                allowedPlayer: player
            };
            restrictedAreas.push(restrictedArea);

            sender.sendMessage(`Restricted area set for ${player}`);
            saveData();
        } else {
            sender.sendMessage("Usage: $setrestrictedarea <x1> <y1> <z1> <x2> <y2> <z2> <player_name>");
        }
        event.cancel = true;
    }

});

loadData();


