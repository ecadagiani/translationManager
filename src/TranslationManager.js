const _ = require( "lodash" );


const textOptions = {
    capitalize:         "capitalize",
    capitalizeWord:     "capitalizeWord",
    capitalizeSentence: "capitalizeSentence",
    uppercase:          "uppercase",
    lowercase:          "lowercase",
};

class TranslationText extends String {
    constructor ( textCode, options ) {
        super( textCode );
        this.textCode = textCode;
        this.options = options || {};

        this.text = this.genText();

        TranslationManager.onAppLanguageUpdate( this.onAppLanguageUpdate.bind(this) );
    }

    onAppLanguageUpdate ( language ) {
        this.text = this.genText( language );
    }

    genText ( language ) {
        const textCode = this.textCode;
        let { special, option, language: optionLanguage, insertValues } = this.options;
        const textValue = TranslationManager.getTextValue(
            this.textCode,
            optionLanguage || language || TranslationManager.getBestLanguageCode( language )
        );

        if ( !textValue ) {
            console.error( `TextCode '${textCode}' not find in language '${language}'` );
            return textCode;
        }


        if ( typeof special !== "string" )
            special = "value";

        let text = textValue[special];
        if ( !text ) {
            console.error( `'${special}' not find in TextCode '${textCode}' in language '${language}'` );
            return textCode;
        }

        if ( insertValues ) {
            try {
                const compiled = _.template( text );
                text = compiled( insertValues );
            } catch ( e ) {
                console.error( `error on template ${textCode} '${text}' with ${JSON.stringify( insertValues )}` );
            }
        }

        switch ( option ) {
        case textOptions.capitalize:
            text = TranslationManager.capitalize( text );
            break;
        case textOptions.capitalizeWord:
            text = TranslationManager.capitalizeWord( text );
            break;
        case textOptions.capitalizeSentence:
            text = TranslationManager.capitalizeSentence( text );
            break;
        case textOptions.uppercase:
            text = text.toLocaleUpperCase( language );
            break;
        case textOptions.lowercase:
            text = text.toLocaleLowerCase( language );
            break;
        default:
            break;
        }

        return text;
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


    static capitalize ( str ) {
        return str.charAt( 0 ).toUpperCase() + str.slice( 1 ).toLowerCase();
    }

    static capitalizeWord ( str ) {
        return str.toLowerCase().split( " " )
            .map( word => TranslationText.capitalize( word ))
            .join( " " );
    }

    static capitalizeSentence ( str ) {
        return str.toLowerCase().split( ". " )
            .map( word => TranslationText.capitalize( word ))
            .join( ". " );
    }

}







let appLanguage = "en";

/**
 * Class TranslationManager
 * @module TranslationManager
 * @category Tools
 */
class TranslationManager {
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

    /* Languages */
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
            TranslationManager.splice( index, 1 );
    }


    /* Dictionnary */
    static getDictionary ( languageCode = null ) {
        if ( languageCode && TranslationManager.translations ) {
            const language = TranslationManager.translations.languages.find( x => x.codes.includes( languageCode ));
            if ( language )
                return language.dictionary;
        }
        return null;
    }

    static getAppDictionary () {
        return TranslationManager.getDictionary( appLanguage );
    }

    static getDefaultDictionary () {
        if ( !TranslationManager.translations ) return null;
        return TranslationManager.getDictionary( TranslationManager.translations.defaultLanguage );
    }


    /* Text */
    static getBestLanguageCode ( languageCode = null ) {
        if ( TranslationManager.languageCodes && TranslationManager.languageCodes[languageCode])
            return languageCode;
        if ( TranslationManager.languageCodes && TranslationManager.languageCodes[appLanguage])
            return appLanguage;
        if ( TranslationManager.translations && TranslationManager.translations.defaultLanguage )
            return TranslationManager.translations.defaultLanguage;
        return null;
    }


    static getTextValue ( textCode = null, languageCode = null ) {
        let dictionary = TranslationManager.getDictionary( languageCode );
        if ( dictionary && dictionary[textCode])
            return dictionary[textCode];

        dictionary = TranslationManager.getAppDictionary();
        if ( dictionary && dictionary[textCode])
            return dictionary[textCode];

        dictionary = TranslationManager.getDefaultDictionary();
        if ( dictionary && dictionary[textCode])
            return dictionary[textCode];

        return null;
    }


    static getText ( textCode, options ) {
        if ( !TranslationManager.translations || !TranslationManager.languageCodes ) {
            console.error( "The translations hasn't been defined: may be you've not exec initData" );
            return textCode;
        }
        return new TranslationText( textCode, options );
    }

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

module.exports = TranslationManager;
