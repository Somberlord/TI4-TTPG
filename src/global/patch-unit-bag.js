/**
 * Only the correct unit may enter a unit bag.
 * 
 * If an anonymous unit enters and bag has a player slot, add it to the unit.
 * Patch bags to apply setting unit slots when adding units by script.
 */

const {
    globalEvents,
    world
} = require('../wrapper/api')
const { ObjectNamespace } = require('../lib/object-namespace')

const REJECT_REASON = {
    BAG_NOT_UNIT : 1,
    BAG_PARSE : 2,
    BAG_NO_OWNER : 3,
    UNIT_NOT_UNIT : 4,
    UNIT_PARSE : 5,
    MISMATCH_UNIT : 6,
    MISMATCH_OWNER : 7,
}

/**
 * Why can't unit go into this unit bag?  Return false if it can.
 * 
 * @param {GameObject} bagObj 
 * @param {GameObject} unitObj 
 * @returns {REJECT_REASON} why rejected, or false if accepted
 */
function getRejectReason(bagObj, unitObj) {
    // Reject if not a unit bag.
    if (!ObjectNamespace.isUnitBag(bagObj)) {
        return REJECT_REASON.BAG_NOT_UNIT
    }
    const bagParsed = ObjectNamespace.parseUnitBag(bagObj)
    const bagUnit = bagParsed && bagParsed.unit
    if (!bagParsed) {
        return REJECT_REASON.BAG_PARSE
    }
    const bagPlayerSlot = bagObj.getOwningPlayerSlot()
    if (bagPlayerSlot < 0) {
        return REJECT_REASON.BAG_NO_OWNER
    }

    // Reject if not a unit.
    if (!ObjectNamespace.isUnit(unitObj)) {
        return REJECT_REASON.UNIT_NOT_UNIT
    }
    const unitParsed = ObjectNamespace.parseUnit(unitObj)
    const unitUnit = unitParsed && unitParsed.unit
    if (!unitUnit) {
        return REJECT_REASON.UNIT_PARSE
    }
    let unitPlayerSlot = unitObj.getOwningPlayerSlot()

    // Reject if unit type mismatch.
    if (bagUnit !== unitUnit) {
        return REJECT_REASON.MISMATCH_UNIT
    }

    // At this point unit and bag are valid, and type match.
    // If unit has no owning player, set it to bag owner.
    if (unitPlayerSlot < 0) {
        unitObj.setOwningPlayerSlot(bagPlayerSlot)
        unitObj.setPrimaryColor(bagObj.getPrimaryColor())    
        unitPlayerSlot = bagPlayerSlot
    }

    // Reject if unit has an owning player other than the bag owning player.
    if (bagPlayerSlot !== unitPlayerSlot) {
        return REJECT_REASON.MISMATCH_OWNER
    }

    // All clear!
    return false
}

/**
 * Container.addObjects lookalike patched onto infinite container objects.
 * 
 * Puts into empty container or of same object there succeed.
 * Container is pruned down to one item afterward.
 * Puts of a different object throw an error.
 * 
 * @param {GameObject[]} insertObjs - Objects to insert
 * @param {number} index - The index at which the new objects will be inserted. By default, they will be inserted at start (index 0)
 * @param {boolean} showAnimation - If false, don't show insert animation and don't play sound. Default: false
 */
function addObjectsUnitBag(insertObjs, index, showAnimation) {
    for (const insertObj of insertObjs) {
        const rejectReason = getRejectReason(this, insertObj)
        if (rejectReason) {
            // This was called by a script, the script should be fixed to only add legal units.
            throw new Error(`addObjects rejected: ${rejectReason}`)
        }
    }
    this.__addObjectsRaw(insertObjs, index, showAnimation)
}

// Container.onInserted event handler.
function onInsertedUnitBag(container, insertObjs, player) {
    for (const insertObj of insertObjs) {
        const rejectReason = getRejectReason(container, insertObj)
        if (rejectReason) {
            // Player dropped a non-matching item into a unit bag.
            const pos = container.getPosition().add([10, 0, 10])
            container.take(insertObj, pos, true)
        }
    }
}

// ----------------------------------------------------------------------------

// Patch infinite containers at load / onObjectCreated time.
function patchUnitBag(obj) {
    // Monitor inserts.
    obj.onInserted.add(onInsertedUnitBag)

    // Interpose on addObjects, preserves Container.addObjects behavior.
    obj.__addObjectsRaw = obj.addObjects
    obj.addObjects = addObjectsUnitBag
}

// Add our listener to future objects.
globalEvents.onObjectCreated.add((obj) => {
    if (ObjectNamespace.isUnitBag(obj)) {
        patchUnitBag(obj)
    }
})

// Script reload doesn't onObjectCreated existing objects, load manually.
if (world.getExecutionReason() === 'ScriptReload') {
    for (const obj of world.getAllObjects()) {
        if (ObjectNamespace.isUnitBag(obj)) {
            patchUnitBag(obj)
        }
    }
}

// Export for unit test.
module.exports = {
    REJECT_REASON,
    getRejectReason
}