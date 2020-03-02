#!/usr/bin/env node

const shell = require( "shelljs" );

const [, , ...args] = process.argv;

const [dirPath] = args;

if ( !dirPath )
    return new Error( "Error, no dirPath" );


shell.exec( `./buildTranslationsConstants ${dirPath} && onchange -d 1000 '${dirPath}/languages/*/*.json'  -- ./buildTranslationsConstants ${dirPath}` );
