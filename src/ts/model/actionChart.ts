
/// <reference path="../external.ts" />

/**
 * The action chart / player state 
 * TODO: This will be hard, but the inventory should be on a different class, for 
 * TODO: getInventoryState() and joinInventoryStates() elegance
 */
class ActionChart {

    /** The original combat skill */ 
    public combatSkill = 0;

    /** The original endurance */
    public endurance = 0;

    /** The current endurance */
    public currentEndurance = 0;

    /** The player weapons (up to 2) */
    public weapons : Array<string> = [];

    /** The currently selected weapon  */ 
    public selectedWeapon = '';

    /** Money amount */
    public beltPouch = 0;

    /** Number of meals (they count as backpack items) */
    public meals = 0;

    /** Backpack items ids (up to 8) */
    public backpackItems : Array<string> = [];

    /** Special items ids */
    public specialItems = [];

    /** The player has a backpack? */
    public hasBackpack = true;

    /** Disciplines ids */
    public disciplines : Array<string> = [];
    
    /** 
     * The weapon codes for the "wepnskll" / "wpnmstry" disciplines.
     * On kai series, it's a single weapon. On magnakai, they are 3
     */
    public weaponSkill : Array<string> = [];

    /** Player annotations */
    public annotations = '';

    /** Use manual random table? */
    public manualRandomTable = false;

    /** The latests scroll position on the game section */
    public yScrollPosition = 0;

    constructor() {
        // Debug fast setup:
        if( window.getUrlParameter('debug') ) {
            if( state.book.bookNumber <= 5 ) {
                // debug data for kai series
                //this.endurance = this.currentEndurance = 25;
                //this.combatSkill = 15;
                //this.disciplines = [ 'camflage' , 'hunting' , 'sixthsns' , 'healing' , 'wepnskll' ];
                //this.weaponSkill = [ 'axe' ];
            }
        }
    }

    /**
     * Pick an object
     * @param {Item} o Object to pick
     * @return {boolean} True if the object was really picked
     */
    public pick(o) {

        if( !o )
            return;

        // Check incompatibilities
        if( o.incompatibleWith && this.hasObject(o.incompatibleWith) ) {
            var incombatibleObject = state.mechanics.getObject(o.incompatibleWith);
            throw translations.text( 'msgIncompatible' , [incombatibleObject.name] );
        }

        switch( o.type ) {
            case 'weapon':
                if( this.weapons.length >= 2 )
                    throw translations.text('msgNoMoreWeapons');
                //console.log('Picked weapon ' + o.id);
                this.weapons.push(o.id);
                this.checkCurrentWeapon();
                return true;

            case 'special':
                this.specialItems.push(o.id);
                if(o.isWeapon())
                    this.checkCurrentWeapon();
                //console.log('Picked special ' + o.id);
                return true;

            case 'object':

                if( o.id == 'backpack' ) {
                    // Special case
                    if( this.hasBackpack )
                        throw translations.text( 'msgAlreadyBackpack' );

                    this.hasBackpack = true;
                    return true;
                }

                if( !this.hasBackpack )
                    throw translations.text( 'backpackLost' );
                if( ( this.getNBackpackItems() + o.itemCount ) > 8 )
                    throw translations.text( 'msgNoMoreBackpackItems' );
                if( o.id == 'meal')
                    // Special case
                    this.increaseMeals(1);
                else
                    this.backpackItems.push(o.id);
                if(o.isWeapon())
                    this.checkCurrentWeapon();
                console.log('Picked object ' + o.id);
                return true;
                
            default:
                throw 'Unknown object type: ' + o.type;
        }

    }

    /**
     * Returns the total number of backpack items 
     */
    public getNBackpackItems() : number {
        var count = this.meals;
        for( var i=0; i<this.backpackItems.length; i++) {
            var o = state.mechanics.getObject(this.backpackItems[i]);
            if( o )
                count += o.itemCount;
        }
        return count;
    }

    /**
     * Increase / decrease the meals number
     * @param count Number to increase. Negative to decrease
     * @return The number of really picked meals 
     */
    public increaseMeals(count : number) : number {
        if( count > 0 ) {

            if( !this.hasBackpack )
                throw translations.text( 'backpackLost' );

            var maxToPick = 8 - this.getNBackpackItems();
            if( maxToPick < 0 )
                count = 0;
            else if( count > maxToPick )
                count = maxToPick; 
        }
        this.meals += count;
        //console.log('Picked ' + count + ' meals');
        return count;
    }

    /**
     * Increase / decrease the money number
     * @param count Number to increase. Negative to decrease 
     */
    public increaseMoney(count : number) {
        this.beltPouch += count;
        if( this.beltPouch > 50 )
            this.beltPouch = 50;
        else if( this.beltPouch < 0 )
            this.beltPouch = 0;
        //console.log('Picked ' + count + ' crowns');
    }

    /**
     * Returns true if the player has the object
     * @param {string} objectId The object id to test. "backpack" to check if the player
     * has a backpack
     */
    public hasObject = function(objectId : string) : boolean {
        if( objectId == 'backpack' )
            return this.hasBackpack;
            
        return this.backpackItems.contains( objectId ) ||
            this.specialItems.contains( objectId ) ||
            this.weapons.contains( objectId );
    }

    /**
     * Drop an object
     * @param objectId Object id to drop, or 'meal' to drop one meal, or 'backpack' to drop the 
     * backpack.
     * @return True if player had the object 
     */
    public drop(objectId : string) : boolean {

        if( objectId == 'meal' ) {
            // Special
            this.increaseMeals(-1);
            return true;
        }

        if( objectId == 'backpack' ) {
            // Special
            if( !this.hasBackpack )
                return false;

            this.hasBackpack = false;
            this.meals = 0;
            this.backpackItems = [];
            this.checkCurrentWeapon();
            return true;
        }

        if( this.backpackItems.removeValue(objectId) || this.specialItems.removeValue(objectId)) {
            this.checkMaxEndurance();
            this.checkCurrentWeapon();
            return true;
        }
        
        if( this.weapons.removeValue(objectId) ) {
            // Check changes on selected weapon
            this.checkCurrentWeapon();
            return true;
        }
        return false;
    }

    /**
     * Check if the player still has its selected weapon
     */
    private checkCurrentWeapon() {

        if( this.selectedWeapon && this.hasObject(this.selectedWeapon) )
            // All is ok
            return;

        // Try to set the current weapon
        var weaponObjects = this.getWeaponObjects();
        if( weaponObjects.length === 0 ) {
            // No weapons
            this.selectedWeapon = '';
            return;
        }
        else if( weaponObjects.length >= 1 ) {
            // Get one
            this.selectedWeapon = weaponObjects[0].id;
            return;
        }
    }

    /**
     * Checks if the current endurance if bigger than the maximum.
     * This can happens if an object that has effects (increase endurance) has ben dropped
     */
    private checkMaxEndurance() {
        var max = this.getMaxEndurance();
        if( this.currentEndurance > max )
            this.currentEndurance = max;
    }

    /**
     * Increase / decrease the current endurance
     * @param count Number to increase. Negative to decrease 
     */
    public increaseEndurance = function(count : number) {
        this.currentEndurance += count;
        this.checkMaxEndurance();
        if( this.currentEndurance < 0 )
            this.currentEndurance = 0;
    }

    /**
     * Get the current combat skill.
     * @param noMindblast If true, the Mindblast discipline bonus is not added 
     * @param noWeapon If true, the combat skill for combat without weapons.
     * If false, the combat skill for the current selected weapon
     * @param mindblastBonus If > 0, the mindblast CS bonus to apply. If 0 or null,
     * the default bonus will be used (+2CS)
     * @return The current combat skill. It includes bonuses for weapons and mindblast
     * discipline
     */
    public getCurrentCombatSkill(noMindblast : boolean, noWeapon : boolean, mindblastBonus : number) : number {
        
        var cs = this.combatSkill;
        var bonuses = this.getCurrentCombatSkillBonuses(noMindblast, noWeapon, mindblastBonus);
        for(var i=0; i<bonuses.length; i++)
            cs += bonuses[i].increment;

        return cs;
    }

    /**
     * Return true if the Weaponskill is active with the selected weapon
     * @return True if Weaponskill is active
     */
    public isWeaponskillActive() : boolean {

        if( !this.disciplines.contains( 'wepnskll' ) )
            // Player has no Weaponskill
            return false;

        const currentWeapon = this.getselectedWeaponItem();
        for(let i=0; i< this.weaponSkill.length; i++ ) {
            if( currentWeapon.isWeaponType( this.weaponSkill[i] ) )
                return true;
        }
    }

    /**
     * Get the selected weapon info
     * @return {Item} The current weapon info. null if the is player has no weapon
     */
    public getselectedWeaponItem() {
        return this.selectedWeapon ? state.mechanics.getObject(this.selectedWeapon) : null;
    }

    /**
     * Get the current bonuses for combat skill
     * @param {boolean} noMindblast If true, the Mindblast discipline bonus is not added 
     * @param {boolean} noWeapon If true, the combat skill for combat without weapons.
     * If false, the combat skill for the current selected weapon
     * @param {number} mindblastBonus If > 0, the mindblast CS bonus to apply. If 0 or null,
     * the default bonus will be used (+2CS)
     * @return {Array} Array of objects with the bonuses concepts
     */
    public getCurrentCombatSkillBonuses(noMindblast, noWeapon, mindblastBonus ) {
        var bonuses = [];

        var currentWeapon = this.getselectedWeaponItem();

        // Weapons
        if( noWeapon || !currentWeapon ) {
            // No weapon:
            bonuses.push( {
                concept: translations.text('noWeapon'),
                increment: -4
            });
        }
        else if( this.isWeaponskillActive() ) {       
            // Weapon skill bonus
            bonuses.push( {
                concept: translations.text( 'weaponskill' ),
                increment: +2
            });
        }

        // Check cuurent weapon bonuses
        if( !noWeapon && currentWeapon && currentWeapon.effect && currentWeapon.effect.cls == 'combatSkill' ) {
            bonuses.push( {
                concept: currentWeapon.name,
                increment: currentWeapon.effect.increment
            });
        }

        // Mindblast
        if( !noMindblast && this.disciplines.contains( 'mndblst' ) ) {
            bonuses.push( {
                concept: translations.text( 'mindblast' ),
                increment: mindblastBonus ? mindblastBonus : +2
            });
        }

        // Objects (not weapons. Ex. shield)
        this.enumerateObjects( function(o) {
            if( !o.isWeapon() && o.effect && o.effect.cls == 'combatSkill' ) {
                bonuses.push( {
                    concept: o.name,
                    increment: o.effect.increment 
                });
            }
        });

        return bonuses;
    }

    /**
     * Function to enumerate backpack objects and special items
     * @param {function} callback Function to be called for each object
     */
    private enumerateObjects( callback ) {

        var enumerateFunction = function(index, objectId) {
            var o = state.mechanics.getObject(objectId);
            if( !o )
                return;
            callback(o);
        };

        // Check objects:
        $.each( this.backpackItems , enumerateFunction );
        $.each( this.specialItems , enumerateFunction );
    }

    /**
     * Returns the maximum endurance of the player
     */
    public getMaxEndurance() : number {
        var e = this.endurance;
        var bonuses = this.getEnduranceBonuses();
        for(var i=0; i<bonuses.length; i++)
            e += bonuses[i].increment;
        return e;
    }

    /**
     * Get the current bonuses for endurance
     * @return {Array} Array of objects with the bonuses concepts
     */
    public getEnduranceBonuses() {

        var bonuses = [];
        this.enumerateObjects( function(o) {
            if( o.effect && o.effect.cls == 'endurance' ) {
                bonuses.push( {
                    concept: o.name,
                    increment: o.effect.increment 
                });
            }
        });
        return bonuses;
    }

    /**
     * Returns the backpack objects and special items that are meals too
     * @return {Array<string>} Meal-like objects on backpack
     */
    public getMealObjects() {

        var result = [];
        this.enumerateObjects( function(o) {
            if( o.isMeal && !result.contains(o.id) )
                result.push(o.id);
        });
        return result;
    }

    /**
     * Returns all weapons and backpack / special item objects that can be
     * used as weapons
     * @return {Array<Item>} All weapon objects
     */
    public getWeaponObjects() {

        // Weapons
        var result = [];
        for( var i=0; i<this.weapons.length; i++) {
            var o = state.mechanics.getObject(this.weapons[i]);
            if( o )
                result.push(o);
        }

        // Weapon-like objects
        this.enumerateObjects( function(o) {
            if( o.isWeapon() )
                result.push(o);
        });
        return result;
    }

    /**
     * Return an object with the current inventory state
     */
    public getInventoryState() {
        return {
            weapons: this.weapons.clone(),
            hasBackpack: this.hasBackpack,
            backpackItems: this.backpackItems.clone(),
            specialItems: this.specialItems.clone(),
            beltPouch: this.beltPouch,
            meals: this.meals
        };
    }

    /**
     * Joins two inventory states
     */
    public joinInventoryStates = function(s1, s2) {
        return {
            weapons: s1.weapons.concat( s2.weapons ),
            hasBackpack: s1.hasBackpack || s2.hasBackpack ,
            backpackItems: s1.backpackItems.concat( s2.backpackItems ),
            specialItems: s1.specialItems.concat ( s2.specialItems ),
            beltPouch: s1.beltPouch + s2.beltPouch,
            meals: s1.meals + s2.meals
        };
    }

}
