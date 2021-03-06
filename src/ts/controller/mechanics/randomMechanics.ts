/// <reference path="../../external.ts" />

/**
 * Random table links mechanics
 */
const randomMechanics = {

    /**
     * The last random number picked, with the increment added
     */
    lastValue: <number> null,

    /** 
     * Assing an action to a random table link.  
     */
    randomTable: function(rule) {

        // Do not enable anything if the player is death:
        if( state.actionChart.currentEndurance <= 0 )
            return;

        // The DOM link:
        var $link;

        // Check if the link is selected by plain text:
        var linkText = $(rule).attr('text-' + state.language);
        if( linkText ) {
            var $textContainer = $(':contains("' + linkText + '")').last();
            var newHtml = $textContainer.html().replace( linkText , 
                '<span class="random">' + linkText + '</span>' );
            $textContainer.html( newHtml );
            $link = $textContainer.find( '.random' );
        }
        else {
            // Get the index of the random table tag to handle
            $link = randomMechanics.getRandomTableRefByRule(rule);
        }

        // Check if the rule was already executed (= link clicked):
        var result = state.sectionStates.ruleHasBeenExecuted(rule);
        if( result ) {
            // Setup the link, but disabled and with the value choosed:
            randomMechanics.setupRandomTableLink($link, true, result.randomValue, 
                result.increment);
            // Fire the inner rules:
            randomMechanics.onRandomTableMechanicsClicked(rule, 
                result.randomValue , result.increment);
        }
        else {
            // Bind the tag click event
            var zeroAsTen = $(rule).attr( 'zeroAsTen' ) == 'true';
            randomMechanics.bindTableRandomLink( $link , function(value, increment) {
                randomMechanics.onRandomTableMechanicsClicked(rule, value, increment);
            }, 
            false, zeroAsTen);
        }
    },

    getRandomTableRefByIndex: function(index : number) : any {
        if( !index )
            index = 0;
        return $('.random:eq( ' + index + ')');
    },

    getRandomTableRefByRule: function(rule : any) {
        return randomMechanics.getRandomTableRefByIndex( $(rule).attr('index') );
    },

    /**
     * This will clear any increment on the random table links
     * It can be needed if a section rules need to be re-executed without re-rendering the section
     * @param {jQuery} $link The random table link to reset. If it's null all section random table link will be reset
     */
    resetRandomTableIncrements : function( $link : any = null ) {
        if( !$link )
            // Reset all random tables
            $link = $('.random[data-increment]');
        $link.attr( 'data-increment' , '0' );
    },

    /** Increment for random table selection */
    randomTableIncrement: function(rule : any) {

        var $link = randomMechanics.getRandomTableRefByRule(rule);
        const txtIncrement : string = $(rule).attr('increment');

        if( txtIncrement == 'reset' ) {
            // Reset the random table increment to zero
            randomMechanics.resetRandomTableIncrements( $link );
            return;
        }

        // Increase the increment
        const newIncrement = ExpressionEvaluator.evalInteger( txtIncrement );

        // Check if already there is an increment:
        var increment = 0;
        var txtCurrentIncrement = $link.attr( 'data-increment' );
        if( txtCurrentIncrement )
            increment = parseInt( txtCurrentIncrement );

        increment += newIncrement;
        $link.attr( 'data-increment' , increment );
    },

    /** 
     * Bind a link event to a random table table
     * @param $element The jquery element with the random table tag
     * @param onLinkPressed Callback to call when the link is pressed
     * @param {boolean} ignoreZero True if the zero random value should be ignored
     * @param {boolean} zeroAsTen true if the zero must to be returned as ten
     */
    bindTableRandomLink: function($element : any, onLinkPressed : (value : number, increment: number) => void, 
        ignoreZero : boolean , zeroAsTen : boolean) {

        // If the element is an span, replace it by a link
        $element = randomMechanics.setupRandomTableLink($element);

        $element.click(function(e) {
            e.preventDefault();

            if( $(this).hasClass('disabled') )
                // Already clicked
                return;

            // Validate money picker, if there is. If its not valid, don't follow with this link
            if( !numberPickerMechanics.isValid() )
                return;

            // If there are pending meals, don't follow with this link
            if( mealMechanics.arePendingMeals() ) {
                alert( translations.text('doMealFirst') );
                return;
            }

            // Get the random value
            var self = this;
            randomTable.getRandomValueAsync(ignoreZero, zeroAsTen)
            .then(function(value) {
                // Get the increment
                var increment = $(self).attr('data-increment');
                if( increment )
                    increment = parseInt( increment );
                else
                    increment = 0;

                // Show the result on the link
                randomMechanics.linkAddChooseValue( $(self) , value , increment);

                // Fire the event:
                onLinkPressed( value , increment );
            });
        });
    },

    /**
     * Setup a tag to link to the random table
     * @param {jQuery} $element The DOM element to setup
     * @param alreadyChoose If it's true, the link will be set disabled
     * @param valueAlreadyChoose Only needed if alreadyChoose is true. It's the 
     * previously random value got
     * @param increment The increment to the choose value, due to game rules
     * @return {jquery} The link tag already processed
     */
    setupRandomTableLink: function($element : any, alreadyChoose : boolean = false, valueAlreadyChoose : number = 0, 
        increment : number = 0) : any {

        if( !$element || $element.length == 0 ) {
            console.log('Random table link not found');
            return;
        }

        // Initially, the random table links are plain text (spans). When they got setup by a random rule, they
        // are converted to links:
        if( $element.prop('tagName').toLowerCase() == 'span' ) {
            var $link = $('<a class="random action" href="#">' + $element.html() + '</a>');
            $element.replaceWith( $link );
            $element = $link;
        }

        if( alreadyChoose )
            randomMechanics.linkAddChooseValue( $element , valueAlreadyChoose , increment);

        return $element;
    },

    /**
     * Change a random table link to clicked
     */
    linkAddChooseValue: function( $link : any , valueChoose : number, increment : number) {

        if( $link.hasClass('picked') )
            // The link text / format has been already assigned
            return;

        var html = valueChoose.toString();
        if( increment > 0 )
            html += ' + ' + increment;
        else if( increment < 0 )
            html += ' - ' + (-increment);
        $link.append(' (' + html + ')');
        // Disable the link:
        $link.addClass('disabled').addClass('picked');
        // Store the value on the UI too
        $link.attr( 'data-picked' , valueChoose + increment );
    },

    /**
     * Event handler of a random table link clicked
     * @param rule The "randomTable" rule
     * @param randomValue The random value result from the table
     */
    onRandomTableMechanicsClicked: function(rule : any, randomValue : number, increment : number) {

        // Set the last choosed value
        randomMechanics.lastValue = randomValue + increment;

        // Process rule childs. It can be a single action, and/or a set of "case" rules
        $(rule).children().each(function(index, childRule) {
            if(childRule.nodeName == 'case') {
                // Evaluate the case rule
                if( randomMechanics.evaluateCaseRule(childRule, randomValue + increment) )
                    mechanicsEngine.runChildRules( $(childRule) );
            }
            else
                // Run unconditional rule
                mechanicsEngine.runRule(childRule);
        });

        // Ugly hack: If we are on the 'equipment' section, check if all link has been clicked
        if( state.sectionStates.currentSection == 'equipmnt' )
            EquipmentSectionMechanics.checkExitEquipmentSection();

        // Mark the rule as executed
        var r = randomValue, i = increment;
        state.sectionStates.markRuleAsExecuted( rule, { randomValue: r , increment: i } );
    },

    getCaseRuleBounds: function( $rule : any) : Array<number> {

        // Test single value
        const txtValue : string = $rule.attr('value');
        if( txtValue ) {
            var value = parseInt(txtValue);
            return [value, value];
        }

        // Test from / to value
        var txtFromValue  : string = $rule.attr('from');
        if( txtFromValue ) {
            var fromValue = parseInt( txtFromValue );
            var toValue = parseInt( $rule.attr('to') );
            return [fromValue, toValue];
        }

        return null;
    },

    /**
     * Evaluates a "case" rule.
     * @param rule The rule to evaluate
     * @return True if the case conditions are satisfied 
     */
    evaluateCaseRule: function(rule : any, randomValue : number) : boolean {

        const bounds = randomMechanics.getCaseRuleBounds( $(rule) );
        if( !bounds )
            return false;
        return randomValue >= bounds[0] && randomValue <= bounds[1];

    },

    /**
     * Get the choosen value of a given random table on the section
     * @param {number} index The index of the random table on the section
     * @returns {number} The choosen value, with increments. -1 if it was not picked
     */
    getRandomValueChoosed: function(index : number) : number {
        var $link = randomMechanics.getRandomTableRefByIndex(index);
        if( $link.length === 0 )
            return -1;

        var txtPicked = $link.attr('data-picked');
        if( txtPicked === null || txtPicked === undefined )
            return -1;
        
        return parseInt( txtPicked );
    }

};
