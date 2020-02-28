const fs = require( "fs" );

let translations = {
    languages: [],
    defaultLanguage: "en"
};

const languageDirNames = fs.readdirSync( "src/constants/translations/languages/" );
languageDirNames.forEach( function ( dirName ) {
    const language = {codes: [], dictionary: {} };
    const filesNames = fs.readdirSync( `src/constants/translations/languages/${dirName}/` );
    filesNames.forEach( function ( fileName ) {
        const content = fs.readFileSync( `src/constants/translations/languages/${dirName}/${fileName}`, "utf-8" );
        let json = null;
        try{
            json = JSON.parse( content );
        }catch( err ) {
            console.error( "error at ", `src/constants/translations/languages/${dirName}/${fileName}`, err );
            return;
        }
        if( json ) {
            if( fileName === "codes.json" )
                language.codes = json;
            else
                language.dictionary = { ...language.dictionary, ...json };
        }
    });
    translations.languages.push( language );
});



const languageCodeArray = translations.languages.reduce(
    ( acc, val ) => acc.concat( val.codes ), []
);
const defaultLanguage = translations.languages.find( x => x.codes.includes( translations.defaultLanguage ));
const textCodesArray = defaultLanguage ? Object.keys( defaultLanguage.dictionary ) : [];

const jsonLanguageCodes = JSON.stringify( languageCodeArray.reduce(
    ( acc, val ) => Object.assign( acc, {[val]: val}), {}
));
const jsonTextCodes = JSON.stringify( textCodesArray.reduce(
    ( acc, val ) => Object.assign( acc, {[val]: val}), {}
));
const jsonTranslations = JSON.stringify( translations );


fs.writeFile( "src/constants/translations/translations.json", jsonTranslations, "utf8", () => {
    console.log( "translations created" );
});

fs.writeFile( "src/constants/translations/languageCodes.json", jsonLanguageCodes, "utf8", () => {
    console.log( "languageCodes created" );
});

fs.writeFile( "src/constants/translations/textCodes.json", jsonTextCodes, "utf8", () => {
    console.log( "textCodes created" );
});
