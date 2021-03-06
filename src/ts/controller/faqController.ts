/// <reference path="../external.ts" />

/** 
 * FAQ controller
 */
class faqController {

    public static index() {
        template.setNavTitle( translations.text('kaiChronicles'), '#mainMenu', true);
        views.loadView('faq_' + state.language + '.html');
    }

    /** Return page */
    public static getBackController() { return 'mainMenu'; }
    
}
