/**
 * Test and parse GameObject.getTemplateMetadata() namespace.
 * Objects use a 'type:source/name' namespace, e.g.:
 * 
 * 'card.objective.secret:base/cut_supply_lines'
 * 
 * As convention call these "nsid" to distinguish from "guid",
 * "template id", etc to know this is the kind of string in hand.
 */
class ObjectNamespace {
    /**
     * Static-only class, do not instantiate it.
     */
    constructor() {
        throw new Error('Static only')
    }

    /**
     * Is the object of this generic type?
     * 
     * @param {GameObject} obj 
     * @param {string} type 
     * @returns {boolean}
     */
    static isGenericType(obj, type) {
        const id = obj.getTemplateMetadata()
        return id.startsWith(type)
    }
    
    /**
     * Parse a 'type:source/name' string into components.
     * 
     * @param {GameObject} obj 
     * @returns {{ type : string, source : string, name : string}}
     */
    static parseGeneric(obj) {
        const id = obj.getTemplateMetadata()
        const m = id.match(/^([^:]+):([^/]+)\/(.+)$/)
        return m && { type : m[1], source : m[2], name : m[3] }
    }

    /**
     * Get the generic object namespace "type" string.
     * 
     * Filtering cards is probably examining a lot of objects.  Caller should
     * get the card type once, then `isGenericType` for faster checking.
     * 
     * @param {string} deck - deck name
     * @returns {string} ObjectNamespace type
     */
     static getCardType(deck) {
        return 'card.' + deck
    }

    static isCard(obj) {
        const id = obj.getTemplateMetadata()
        return id.startsWith('card')    
    }

    static parseCard(obj) {
        const result = ObjectNamespace.parseGeneric(obj)
        if (result) {
            result.deck = result.type.substring('card.'.length)
        }
        return result
    }

    static isCommandToken(obj) {
        const id = obj.getTemplateMetadata()
        return id.startsWith('token.command')    
    }

    static parseCommandToken(obj) {
        const result = ObjectNamespace.parseGeneric(obj)
        if (result) {
            result.faction = result.name
        }
        return result
    }

    static isControlToken(obj) {
        const id = obj.getTemplateMetadata()
        return id.startsWith('token.control')    
    }

    static parseControlToken(obj) {
        const result = ObjectNamespace.parseGeneric(obj)
        if (result) {
            result.faction = result.name
        }
        return result
    }

    static isStrategyCard(obj) {
        const id = obj.getTemplateMetadata()
        return id.startsWith('tile.strategy')
    }

    static parseStrategyCard(obj) {
        const result = ObjectNamespace.parseGeneric(obj)
        if (result) {
            result.card = result.name.split('.')[0] // .omega
        }
        return result
    }

    static isSystemTile(obj) {
        const id = obj.getTemplateMetadata()
        return id.startsWith('tile.system')
    }

    static parseSystemTile(obj) {
        const result = ObjectNamespace.parseGeneric(obj)
        if (result) {
            result.tile = Number.parseInt(result.name)
        }
        return result
    }

    static isToken(obj) {
        const id = obj.getTemplateMetadata()
        return id.startsWith('token')
    }

    static parseToken(obj) {
        const result = ObjectNamespace.parseGeneric(obj)
        if (result) {
            result.token = result.name.split('.')[0] // tear tokens
        }
        return result
    }

    static isUnit(obj) {
        const id = obj.getTemplateMetadata()
        return id.startsWith('unit')
    }

    static parseUnit(obj) {
        const result = ObjectNamespace.parseGeneric(obj)
        if (result) {
            result.unit = result.name // reserve should something change
        }
        return result
    }

    static isUnitBag(obj) {
        const id = obj.getTemplateMetadata()
        return id.startsWith('bag.unit')
    }

    static parseUnitBag(obj) {
        const result = ObjectNamespace.parseGeneric(obj)
        if (result) {
            result.unit = result.name // reserve should something change
        }
        return result
    }
}

module.exports = {
    ObjectNamespace,
}