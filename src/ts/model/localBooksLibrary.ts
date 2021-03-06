/// <reference path="../external.ts" />

/**
 * Only for Cordova app.
 * Stores the download state of all available books
 */
class LocalBooksLibrary {

    /**
     * Info about the books states
     */
    public booksLibrary : Array<BookDownloadState> = [];

    /**
     * Absolute path where to books are stored. It's filled at resolveBooksDirectoryAsync()
     */
    public BOOKS_PATH : string = null;

    /** 
     * Constructor
     */
    public constructor() {
    
        var onWebEnvironment = !cordovaApp.isRunningApp();
        for( var i=1; i<=projectAon.supportedBooks.length; i++) {
            var book = new BookDownloadState(i);
            if( onWebEnvironment )
                book.downloaded = true;
            this.booksLibrary.push( book );
        }
    }
    
    /**
     * Get the currently downloaded books
     * @return Downloaded books
     */
    public getDownloadedBooks() : Array<BookDownloadState> {
        var result = [];
        for(var i=0; i<this.booksLibrary.length; i++) {
            if( this.booksLibrary[i].downloaded )
                result.push( this.booksLibrary[i] );
        }
        return result;
    }

    /**
     * Check if a book is downloaded
     * @param bookNumber The book number to check (1-based index)
     * @return True if the book is downloaded
     */
    public isBookDownloaded( bookNumber : number ) : boolean {
        var idx = bookNumber - 1;
        if( idx >= this.booksLibrary.length )
            return false;
        return this.booksLibrary[ idx ].downloaded;
    }

    /**
     * Get the directory where books are stored on the device
     * @returns {Promise<DirectoryEntry>} Promise with the Cordova directory entry where the books are stored
     */
    public static getBooksDirectoryAsync() : Promise<any> {
        return cordovaFS.requestFileSystemAsync()
        .then(function(fs) {
            return cordovaFS.getDirectoryAsync(fs.root, 'books', { create: true });
        });
    }


    /**
     * Resolve the directory where the books are stored. The directory URL will be stored on 
     * this.BOOKS_PATH
     * @return The resolution promise
     */
    public resolveBooksDirectoryAsync() : Promise<void> {

        if( !cordovaApp.isRunningApp() )
            // This is just for the app
            return jQuery.Deferred().resolve().promise();

        var self = this;
        console.log('Resolving books directory');
        return LocalBooksLibrary.getBooksDirectoryAsync()
            .then(function(booksDirEntry) {
                self.BOOKS_PATH = booksDirEntry.toURL();
                console.log('Books are at ' + self.BOOKS_PATH );
            });
    }

    /**
     * Check if books are downloaded or not
     * @return The resolution promise
     */
    public updateBooksDownloadStateAsync() : Promise<void> {

        if( !cordovaApp.isRunningApp() )
            // This is just for the app
            return jQuery.Deferred().resolve().promise();

        // Cordova app: Check downloaded books
        var self = this;
        return LocalBooksLibrary.getBooksDirectoryAsync()
        .then( function(booksDir) {
            var promises = [];
            // Start each book check
            self.booksLibrary.forEach( function(book) {
                promises.push( book.checkDownloadStateAsync(booksDir) );
            });

            // Wait for all checks
            return $.when.apply($, promises);
        });

    }

    /**
     * Setup the books states
     * @return The resolution promise
     */
    public setupAsync() : Promise<void> {
        var self = this;
        return this.resolveBooksDirectoryAsync()
        .then(function() { 
            return self.updateBooksDownloadStateAsync(); 
        });
    };

}

