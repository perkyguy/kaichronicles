
/**
 * Combat result for death
 */
const combatTable_DEATH= "D";

/**
 * The combat table
 */
const combatTable = {

    /**
     * Combat table results when the combat ratio is <= 0
     */
    tableBelowOrEqualToEnemy: {
        
        // Random table result = 1
        1: {
            0: [ 3 , 5 ],
            1: [ 2 , 5 ],
            2: [ 1 , 6 ],
            3: [ 0 , 6 ],
            4: [ 0 , 8 ],
            5: [ 0 , combatTable_DEATH],
            6: [ 0 , combatTable_DEATH ]
        },
        
        // Random table result = 2
        2: {
            0: [ 4 , 4 ],
            1: [ 3 , 5 ],
            2: [ 2 , 5 ],
            3: [ 1 , 6 ],
            4: [ 0 , 7 ],
            5: [ 0 , 8 ],
            6: [ 0 , combatTable_DEATH ]
        },
        
        // Random table result = 3
        3: {
            0: [ 5 , 4 ],
            1: [ 4 , 4 ],
            2: [ 3 , 5 ],
            3: [ 2 , 5 ],
            4: [ 1 , 6 ],
            5: [ 0 , 7 ],
            6: [ 0 , 8 ]
        },
        
        // Random table result = 4
        4: {
            0: [6 , 3],
            1: [5 , 4],
            2: [4 , 4],
            3: [3 , 5],
            4: [2 , 6],
            5: [1 , 7],
            6: [0 , 8]
        },
        
        // Random table result = 5
        5: {
            0: [7 , 2],
            1: [6 , 3],
            2: [5 , 4],
            3: [4 , 4],
            4: [3 , 5],
            5: [2 , 6],
            6: [1 , 7]
        }, 
        
        // Random table result = 6
        6: {
            0: [8 , 2],
            1: [7 , 2],
            2: [6 , 3],
            3: [5 , 4],
            4: [4 , 5],
            5: [3 , 6],
            6: [2 , 6]
        },
        
        // Random table result = 7
        7: {
            0: [9 , 1],
            1: [8 , 2],
            2: [7 , 2],
            3: [6 , 3],
            4: [5 , 4],
            5: [4 , 5],
            6: [3 , 5]
        },
        
        // Random table result = 8
        8: {
            0: [10 , 0],
            1: [9  , 1],
            2: [8  , 1],
            3: [7  , 2],
            4: [6  , 3],
            5: [5  , 4],
            6: [4  , 4]
        },
        
        // Random table result = 9
        9: {
            0: [11 , 0],
            1: [10 , 0],
            2: [9  , 0],
            3: [8  , 0],
            4: [7  , 2],
            5: [6  , 3],
            6: [5  , 3]
        },
        
        // Random table result = 0
        0: {
            0: [12 , 0],
            1: [11 , 0],
            2: [10 , 0],
            3: [9  , 0],
            4: [8  , 0],
            5: [7  , 0],
            6: [6  , 0]
        }
    },
    
    /**
     * Combat table results when the combat ratio is > 0
     */
    tableAboveEnemy: {
        
        // Random table result = 1
        1: {
            1: [4 , 5],
            2: [5 , 4],
            3: [6 , 4],
            4: [7 , 4],
            5: [8 , 3],
            6: [9 , 3]
        },
        
        // Random table result = 2
        2: {
            1: [5  , 4],
            2: [6  , 3],
            3: [7  , 3],
            4: [8  , 3],
            5: [9  , 3],
            6: [10 , 2]
        },
        
        // Random table result = 3
        3: {
            1: [6  , 3],
            2: [7  , 3],
            3: [8  , 3],
            4: [9  , 2],
            5: [10 , 2],
            6: [11 , 2]
        },
        
        // Random table result = 4
        4: {
            1: [7 , 3],
            2: [8 , 2],
            3: [9 , 2],
            4: [10 , 2],
            5: [11 , 2],
            6: [12 , 2]
        },
        
        // Random table result = 5
        5: {
            1: [8 , 2],
            2: [9 , 2],
            3: [10 , 2],
            4: [11 , 2],
            5: [12 , 2],
            6: [14 , 1]
        },
        
        // Random table result = 6
        6: {
            1: [9, 2],
            2: [10, 2],
            3: [11, 1],
            4: [12, 1],
            5: [14, 1],
            6: [16, 1]
        },
        
        // Random table result = 7
        7: {
            1: [10, 1],
            2: [11, 1],
            3: [12, 0],
            4: [14, 0],
            5: [16, 0],
            6: [18, 0]
        },
        
        // Random table result = 8
        8: {
            1: [11, 0],
            2: [12, 0],
            3: [14, 0],
            4: [16, 0],
            5: [18, 0],
            6: [combatTable_DEATH, 0]
        },
        
        // Random table result = 9
        9: {
            1: [12, 0],
            2: [14, 0],
            3: [16, 0],
            4: [18, 0],
            5: [combatTable_DEATH, 0],
            6: [combatTable_DEATH, 0]
        },
        
        // Random table result = 0
        0: {
            1: [14, 0],
            2: [16, 0],
            3: [18, 0],
            4: [combatTable_DEATH, 0],
            5: [combatTable_DEATH, 0],
            6: [combatTable_DEATH, 0]
        }
    },

    /**
     * Get a combat table result
     * @param combatRatio The combat ratio
     * @param randomTableValue The random table value
     * @returns Array with endurance points loses, or combatTable_DEATH. Index 0 is the 
     * EP enemy loss. Index 1 is the Lone Wolf loss
     */
    getCombatTableResult: function(combatRatio : number, randomTableValue : number) : Array<any> {
        var ponderatedIndex = combatRatio / 2.0;
        var table;
        if( combatRatio <= 0 ) {
            table = combatTable.tableBelowOrEqualToEnemy;
            ponderatedIndex = - ponderatedIndex;
        }
        else
            table = combatTable.tableAboveEnemy;
        ponderatedIndex = Math.ceil(ponderatedIndex);
        if( ponderatedIndex > 6 )
            ponderatedIndex = 6;
        
        return table[randomTableValue][ponderatedIndex];
    }
};

