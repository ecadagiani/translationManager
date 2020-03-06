const _                         = require( "lodash" );
const { textOptions, genText } = require( "./tools" );


class TranslationText extends String {
    constructor ( textCode, options ) {
        super( textCode );
        this.textCode = textCode;
        this.options = {};
        this.text = "";
        this.setOptions( options );
    }


    _onAppLanguageUpdate ( language ) {
        this.updateText( language );
    }

    /**
     * change the internal options of the text
     * @param options {Object}
     * @param [options.special="value"] {string} - the special value from the textCode to use
     * @param [options.option] {string} - an constant string (TranslationManager.textOptions=[capitalize,capitalizeWord,capitalizeSentence,uppercase,lowercase])
     * @param [options.language=appLanguage] {string} - to force language
     * @param [options.insertValues] {Object} - an object of insert value {key: value}, in the translation text, you have to add ${<key>}
     */
    setOptions ( options ) {
        this.options = options || {};
        if ( !options.language ) {
            this.unregisterOnLanguageUpdate = TranslationManager.onAppLanguageUpdate( this._onAppLanguageUpdate.bind( this ));
        } else if ( this.unregisterOnLanguageUpdate ) {
            this.unregisterOnLanguageUpdate();
        }
        this.updateText();
    }

    /**
     * to destroy the current text, and unsubscribe current text to the app language change event. And avoid memory leaks
     */
    destroy () {
        if ( this.unregisterOnLanguageUpdate ) {
            this.unregisterOnLanguageUpdate();
        }
    }

    /**
     * to force update the internal text
     * @param [language] {string}
     */
    updateText ( language ) {
        const textCode                                                  = this.textCode;
        let { special, option, language: optionLanguage, insertValues } = this.options;
        const _language                                                 = TranslationManager._getBestLanguageCode( optionLanguage || language );
        const textValue                                                 = TranslationManager._getTextValue( this.textCode, language );

        let text = textCode;
        try {
            text = genText( textValue, { special, option, language: _language, insertValues }, textCode );
        } catch ( e ) {
            console.error( e );
        }

        this.text = text;
    }


    [Symbol.toPrimitive] () {
        return this.text;
    }


    toString () {
        return this.text;
    }


    valueOf () {
        return this.text;
    }
}



let appLanguage = "en";

/**
 * Class TranslationManager
 * @module TranslationManager
 * @category Tools
 */
class TranslationManager {
    /**
     * To init TranslationManage
     * @param languageCodes {Object} - the builded json
     * @param translations {Object} - the builded json
     */
    static initData ( languageCodes, translations ) {
        TranslationManager._languageCodes = languageCodes;
        TranslationManager._translations = translations;
    }


    static get translations () {
        return TranslationManager._translations;
    }


    static get languageCodes () {
        return TranslationManager._languageCodes;
    }


    static getUserLanguage () {
        if ( navigator )
            return navigator.language || navigator.userLanguage;
        else
            return appLanguage;
    }


    static getAppLanguage () {
        return appLanguage;
    }


    static setAppLanguage ( language ) {
        appLanguage = language;
        ( TranslationManager._appLanguageUpdateObservers || []).forEach(( handler ) => {
            handler( language );
        });
    }


    static onAppLanguageUpdate ( handler ) {
        if ( !Array.isArray( TranslationManager._appLanguageUpdateObservers ))
            TranslationManager._appLanguageUpdateObservers = [];
        TranslationManager._appLanguageUpdateObservers.push( handler );
        return () => {
            TranslationManager.removeAppLanguageUpdate( handler );
        };
    }


    static removeAppLanguageUpdate ( handler ) {
        if ( !Array.isArray( TranslationManager._appLanguageUpdateObservers ))
            return;
        const index = TranslationManager._appLanguageUpdateObservers.findIndex( x => x === handler );
        if ( index >= 0 )
            TranslationManager._appLanguageUpdateObservers.splice( index, 1 );
    }


    static _getDictionary ( languageCode = null ) {
        if ( languageCode && TranslationManager.translations ) {
            const language = TranslationManager.translations.languages.find( x => x.codes.includes( languageCode ));
            if ( language )
                return language.dictionary;
        }
        return null;
    }


    static _getAppDictionary () {
        return TranslationManager._getDictionary( appLanguage );
    }


    static _getDefaultDictionary () {
        if ( !TranslationManager.translations ) return null;
        return TranslationManager._getDictionary( TranslationManager.translations.defaultLanguage );
    }


    static _getBestLanguageCode ( languageCode = null ) {
        if ( languageCode && TranslationManager.languageCodes && TranslationManager.languageCodes[languageCode])
            return languageCode;
        if ( TranslationManager.languageCodes && TranslationManager.languageCodes[appLanguage])
            return appLanguage;
        if ( TranslationManager.translations && TranslationManager.translations.defaultLanguage )
            return TranslationManager.translations.defaultLanguage;
        return null;
    }


    static _getTextValue ( textCode = null, languageCode = null ) {
        let dictionary = TranslationManager._getDictionary( languageCode );
        if ( dictionary && dictionary[textCode])
            return dictionary[textCode];

        dictionary = TranslationManager._getAppDictionary();
        if ( dictionary && dictionary[textCode])
            return dictionary[textCode];

        dictionary = TranslationManager._getDefaultDictionary();
        if ( dictionary && dictionary[textCode])
            return dictionary[textCode];

        return null;
    }

    /**
     * To get an text
     * @param textCode {string} - the textCode, can be import by textCode.json (the builded file)
     * @param options {Object}
     * @param [options.special="value"] {string} - the special value from the textCode to use
     * @param [options.option] {string} - an constant string (TranslationManager.textOptions=[capitalize,capitalizeWord,capitalizeSentence,uppercase,lowercase])
     * @param [options.language=appLanguage] {string} - to force language
     * @param [options.insertValues] {Object} - an object of insert value {key: value}, in the translation text, you have to add ${<key>}
     * @param [useDynamicText = false] {boolean} - if you want an TranslationText, not but just a string
     * @return {TranslationText|string}
     */
    static getText ( textCode, options = {}, useDynamicText = false ) {
        if ( !TranslationManager.translations || !TranslationManager.languageCodes ) {
            console.error( "The translations hasn't been defined: may be you've not exec initData" );
            return textCode;
        }
        if ( useDynamicText ) {
            return new TranslationText( textCode, options );
        }
        const language = TranslationManager._getBestLanguageCode( options.language );
        const textValue = TranslationManager._getTextValue( textCode, language);
        return genText( textValue, {...options, language}, textCode );
    }

    /**
     * To check if the translation are correct
     * if a textcode in one language is present in all the others
     * if one textcode is not redundant with another
     * @param [redundantCheck=true] {boolean} - if you wan't a check on redondant textCode (two textCode with the same value, on same language)
     * @return {boolean}
     */
    static verifyJson ({ redundantCheck = true }) {
        if ( !TranslationManager.translations ) {
            return false;
        }

        if ( TranslationManager.translations.languages.findIndex( language => language.codes.includes( TranslationManager.translations.defaultLanguage )) === -1 )
            console.error(
                `translation error: defaultLanguage '${TranslationManager.translations.defaultLanguage}', not exist in language array`,
            );

        TranslationManager.translations.languages.forEach(( language, index, languages ) => {
            const otherLanguages = Array.from( languages );
            otherLanguages.splice( index, 1 );
            otherLanguages.forEach( otherLanguage => {
                // if dictionary key is present in language and not in otherLanguage
                const otherDictionaryKeys = Object.keys( otherLanguage.dictionary );
                Object.keys( language.dictionary ).forEach( dictionaryKey => {
                    if ( !otherDictionaryKeys.includes( dictionaryKey ))
                        console.error(
                            `translation error: key '${dictionaryKey}' is present in '${_.first( language.codes )}' language and not in '${_.first( otherLanguage.codes )}' language`,
                        );
                });
            });
        });

        if ( redundantCheck ) {
            TranslationManager.translations.languages.forEach(( language ) => {
                Object.keys( language.dictionary ).forEach(( textCode, index, textCodes ) => {
                    const otherTextCodes = Array.from( textCodes );
                    otherTextCodes.splice( index, 1 );
                    otherTextCodes.forEach( otherTextCode => {
                        if ( _.isEqual( language.dictionary[textCode], language.dictionary[otherTextCode]))
                            console.warn( `translation warning: textCode '${textCode}' is redundant with textCode '${otherTextCode}' in language '${language.codes[0]}' ` );
                    });
                });
            });
        }
    }

}

TranslationManager.textOptions = textOptions;

module.exports = {TranslationManager, TranslationText};
