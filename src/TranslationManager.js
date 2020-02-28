const _ =  require("lodash");
const translations = require("constants/translations/translations.json");
const languageCodes = require("constants/translations/languageCodes.json");

/**
 * Class TranslationManager
 * @module TranslationManager
 * @category Tools
 */
class TranslationManager {
// static members
    static appLanguage = "en";

    static getUserLanguage () {
        return navigator.language || navigator.userLanguage;
    }

    static setAppLanguage ( language ) {
        TranslationManager.appLanguage = language;
    }

    static getDictionary ( languageCode = null ) {
        if( languageCode ) {
            const language = translations.languages.find( x => x.codes.includes( languageCode ));
            if( language )
                return language.dictionary;
        }
        return null;
    }

    static getAppDictionary () {
        return TranslationManager.getDictionary( TranslationManager.appLanguage );
    }

    static getDefaultDictionary () {
        return TranslationManager.getDictionary( translations.defaultLanguage );
    }

    static getBestText ( textCode = null, languageCode = null ) {
        let dictionary = TranslationManager.getDictionary( languageCode );
        if( dictionary && dictionary[textCode])
            return dictionary[textCode];

        dictionary = TranslationManager.getAppDictionary();
        if( dictionary && dictionary[textCode])
            return dictionary[textCode];

        dictionary = TranslationManager.getDefaultDictionary();
        if( dictionary && dictionary[textCode])
            return dictionary[textCode];

        return null;
    }

    static getBestLanguageCode ( languageCode = null ) {
        if( languageCodes[languageCode])
            return languageCode;
        if( languageCodes[this.appLanguage])
            return this.appLanguage;
        return translations.defaultLanguage;
    }


    static getText ( textCode, {special, option, language, insertValues} = {}) {
        language = TranslationManager.getBestLanguageCode( language );
        if( typeof special !== "string" )
            special = "value";

        let textKey = TranslationManager.getBestText( textCode, language );
        if( !textKey ) {
            console.error( `TextCode '${textCode}' not find in language '${language}'` );
            return textCode;
        }

        let text = textKey[special];
        if( !text ) {
            console.error( `'${special}' not find in TextCode '${textCode}' in language '${language}'` );
            return textCode;
        }

        if( insertValues ) {
            try{
                const compiled = _.template( text );
                text = compiled( insertValues );
            }catch( e ) {
                console.error( `error on template ${textCode} '${text}' with ${JSON.stringify( insertValues )}` );
            }
        }

        switch ( option ) {
        case TranslationManager.textOptions.capitalize:
            text = TranslationManager.capitalize( text );
            break;
        case TranslationManager.textOptions.capitalizeWord:
            text = TranslationManager.capitalizeWord( text );
            break;
        case TranslationManager.textOptions.capitalizeSentence:
            text = TranslationManager.capitalizeSentence( text );
            break;
        case TranslationManager.textOptions.uppercase:
            text = text.toLocaleUpperCase( language );
            break;
        case TranslationManager.textOptions.lowercase:
            text = text.toLocaleLowerCase( language );
            break;
        default:
            break;
        }
        return text;
    }

    static capitalize ( str ) {
        return str.charAt( 0 ).toUpperCase() + str.slice( 1 ).toLowerCase();
    }

    static capitalizeWord ( str ) {
        return str.toLowerCase().split( " " )
            .map( word => TranslationManager.capitalize( word ))
            .join( " " );
    }
    static capitalizeSentence ( str ) {
        return str.toLowerCase().split( ". " )
            .map( word => TranslationManager.capitalize( word ))
            .join( ". " );
    }

    static verifyJson ({redundantCheck = true}) {
        if( translations.languages.findIndex( language => language.codes.includes( translations.defaultLanguage )) === -1 )
            console.error(
                `translation error: defaultLanguage '${translations.defaultLanguage}', not exist in language array`
            );

        translations.languages.forEach(( language, index, languages ) => {
            const otherLanguages = Array.from( languages );
            otherLanguages.splice( index, 1 );
            otherLanguages.forEach( otherLanguage => {
                // if dictionary key is present in language and not in otherLanguage
                const otherDictionaryKeys = Object.keys( otherLanguage.dictionary );
                Object.keys( language.dictionary ).forEach( dictionaryKey => {
                    if( !otherDictionaryKeys.includes( dictionaryKey ))
                        console.error(
                            `translation error: key '${dictionaryKey}' is present in '${_.first( language.codes )}' language and not in '${_.first( otherLanguage.codes )}' language`
                        );
                });
            });
        });

        if( redundantCheck ) {
            translations.languages.forEach(( language ) => {
                Object.keys( language.dictionary ).forEach(( textCode, index, textCodes ) => {
                    const otherTextCodes = Array.from( textCodes );
                    otherTextCodes.splice( index, 1 );
                    otherTextCodes.forEach( otherTextCode => {
                        if( _.isEqual( language.dictionary[textCode], language.dictionary[otherTextCode]))
                            console.warn( `translation warning: textCode '${textCode}' is redundant with textCode '${otherTextCode}' in language '${language.codes[0]}' ` );
                    });
                });
            });
        }
    }

    static textOptions = {
        capitalize: "capitalize",
        capitalizeWord: "capitalizeWord",
        capitalizeSentence: "capitalizeSentence",
        uppercase: "uppercase",
        lowercase: "lowercase",
    };
}


module.exports = TranslationManager;
