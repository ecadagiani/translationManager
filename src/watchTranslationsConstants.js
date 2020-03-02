#!/usr/bin/env node

const shell = require( "shelljs" );

const [, , ...args] = process.argv;

const [dirPath] = args;

if ( !dirPath )
    throw new Error( "Error, no dirPath" );

console.log(`start watch-translation with dirPath:${dirPath}`);

shell.exec( `build-translations ${dirPath} && onchange -d 1000 '${dirPath}/languages/*/*.json'  -- build-translations ${dirPath}` );
