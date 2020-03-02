const TranslationManager = require( "../src/TranslationManager" );
const textCodes          = require( "../translationsExample/textCodes" );
const languageCodes      = require( "../translationsExample/languageCodes" );
const translations       = require( "../translationsExample/translations" );

TranslationManager.initData( languageCodes, translations );
TranslationManager.setAppLanguage( "en" );
if ( process.env.REACT_APP_ENV !== "prod" )
    TranslationManager.verifyJson({ redundantCheck: false });

const testMessage = TranslationManager.getText( textCodes.VALUE );
console.log( testMessage );
