
const textOptions = {
    capitalize:         "capitalize",
    capitalizeWord:     "capitalizeWord",
    capitalizeSentence: "capitalizeSentence",
    uppercase:          "uppercase",
    lowercase:          "lowercase",
};


function genText ( textValue, { special, option, language, insertValues } = {}, textCode ) {
    if ( !textValue || typeof textValue !== "object" ) {
        throw new Error( `TextCode '${textCode}' not find in language '${language}'` );
    }


    if ( typeof special !== "string" )
        special = "value";

    let text = textValue[special];
    if ( !text ) {
        throw new Error( `'${special}' not find in TextCode '${textCode}' in language '${language}'` );
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
        text = capitalize( text );
        break;
    case textOptions.capitalizeWord:
        text = capitalizeWord( text );
        break;
    case textOptions.capitalizeSentence:
        text = capitalizeSentence( text );
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


function capitalize ( str ) {
    return str.charAt( 0 ).toUpperCase() + str.slice( 1 ).toLowerCase();
}


function capitalizeWord ( str ) {
    return str.toLowerCase().split( " " )
        .map( word => capitalize( word ))
        .join( " " );
}

function capitalizeSentence ( str ) {
    return str.toLowerCase().split( ". " )
        .map( word => capitalize( word ))
        .join( ". " );
}


module.exports = {
    genText,
    textOptions,
    capitalize,
    capitalizeWord,
    capitalizeSentence,
};
