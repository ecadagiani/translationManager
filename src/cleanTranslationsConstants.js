const fs = require( "fs" );
const {find, keys} = require( "lodash" );

const baseFolderName = "english";
const organizeOtherLanguageLikeBase = true;
const minimizeValueCase = false;


function updateValuesInDeep ( object, updater = null ) {
    if( typeof object !== "object" ) return object;

    let obj = {};
    Object.keys( object ).forEach( key => {
        if( Array.isArray( object[key])) {
            obj[key] = [];
            object[key].forEach(( item, index ) => {
                obj[key].push( updateValuesInDeep( item, updater ));
            });
        }else if( typeof object[key] === "object" )
            obj[key] = updateValuesInDeep( object[key], updater );
        else if( typeof updater === "function" )
            obj[key] = updater( object[key]);
        else
            obj[key] = object[key];
    });
    return obj;
}

function sortObjectByKey ( obj ) {
    const ordered = {};
    Object.keys( obj )
        .map( x => x.toUpperCase())
        .sort()
        .forEach( key => {
            ordered[key] = obj[key];
        });
    return ordered;
}

function getFileJson ( folderName, fileName ) {
    let json = null;
    try{
        const content = fs.readFileSync( `src/constants/translations/languages/${folderName}/${fileName}`, "utf-8" );
        json = JSON.parse( content );
    }catch( err ) {
        console.error( err );
        return null;
    }
    return json;
}

function getLanguageFilesName ( languageFolderName ) {
    return fs.readdirSync( `src/constants/translations/languages/${languageFolderName}/` );
}

// get allLanguages
const languageDirNames = fs.readdirSync( "src/constants/translations/languages/" );
const allLanguages = {}; // {french: [ {fileName: "general.json", value: {...}] }

// GET AND SORT all Language
languageDirNames.forEach( dirName => {
    allLanguages[dirName] = [];
    const filesNames = getLanguageFilesName( dirName );

    filesNames.forEach( fileName => {
        if( fileName === "codes.json" ) return;
        const json = getFileJson( dirName, fileName );
        if( json )
            allLanguages[dirName].push({ fileName, value: sortObjectByKey( json ) });
    });
});

// if we do re-organize other language like the base language:
if( organizeOtherLanguageLikeBase ) {
    const baseLanguage = allLanguages[baseFolderName];

    // iterate on all other language
    keys( allLanguages ).forEach( languageFolderName => {
        if( languageFolderName === baseFolderName ) return;

        // get all values of this other language
        const allValue = allLanguages[languageFolderName].reduce(( allValue, {value = {}}) => {
            return {...allValue, ...value};
        }, {});

        // remove the actual organization of this other language
        allLanguages[languageFolderName] = [];

        // set the new organization for this other language
        baseLanguage.forEach(({fileName: baseFileName, value: baseValue}) => {
            const value = {};
            keys( baseValue ).forEach( baseTextCode => {
                if( allValue[baseTextCode])
                    value[baseTextCode] = allValue[baseTextCode];
            });
            allLanguages[languageFolderName].push({
                fileName: baseFileName,
                value
            });
        });
    });
}

// minimize case for all value
if( minimizeValueCase ) {
    keys( allLanguages ).forEach( folderName => {
        allLanguages[folderName].forEach(({fileName, value = {}}, i ) => {
            allLanguages[folderName][i].value = updateValuesInDeep( value, x => {
                if( typeof x === "string" )
                    return x.toLowerCase();
                return x;
            });
        });
    });
}

// SAVE LANGUAGES
keys( allLanguages ).forEach( folderName => {
    allLanguages[folderName].forEach(({fileName, value = {}}) => {
        fs.writeFile( `src/constants/translations/languages/${folderName}/${fileName}`, JSON.stringify( value, null, 4 ), "utf8", () => {
            console.log( "save fileName: ", folderName , fileName );
        });
    });
    // if we do re-organize other language like the base language:
    if( organizeOtherLanguageLikeBase ) {
        // we remove the extra files
        const filesNames = getLanguageFilesName( folderName );
        filesNames.forEach( fileName => {
            if( find( allLanguages[folderName], {fileName}) || fileName === "codes.json" )
                return;

            fs.unlinkSync( `src/constants/translations/languages/${folderName}/${fileName}` );
        });
    }
});
