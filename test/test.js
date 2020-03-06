const { TranslationManager} = require( "../src/TranslationManager" );
const textCodes          = require( "../translationsExample/textCodes" );
const languageCodes      = require( "../translationsExample/languageCodes" );
const translations       = require( "../translationsExample/translations" );

TranslationManager.initData( languageCodes, translations );
TranslationManager.setAppLanguage( "en" );


const addText      = TranslationManager.getText( textCodes.ADD, {}, true );
const categoryText = TranslationManager.getText( textCodes.CATEGORY, {option: TranslationManager.textOptions.uppercase}, true );

console.log(`${addText} ${categoryText}`);

TranslationManager.setAppLanguage( "fr" );

console.log(`${addText} ${categoryText}`);


console.log(addText);
console.log(categoryText);
