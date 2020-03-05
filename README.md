# translationManager
A light, and very simple Javascript library for managing multilingual, both back and front side.

[node Demo](https://repl.it/@ecadagiani/DemoTranslationManager)

[web Demo](https://codesandbox.io/s/demotranslationmanager-um6j9)

_I create an React wrapper of translationManager [here](https://github.com/ecadagiani/translationManager-react)_

## Setup:
0. `npm i translation-manager`

1. Create a folder `/translations` in your project (or copy [translationsExample](./translationsExample) from this repo)

2. Under this `/translations` folder create this tree:
    - `/translations`
        - `/languages`
            - `/english`
                - `codes.json`
                - ...any other json file
            - `/french`
                - `codes.json`
                - ...any other json file
            - ...any other language

    2.1 The files `codes.json` contains all the language codes used to target this language,
    example for english `["en","EN","en-us","en-US"]`

    2.2 Next to the `codes.json` file you can create any other json file (with the name you want),
    these files will contain the translations:
    example:
     ```json
    {
        "ADD": {
            "value": "add"
        },
        "CATEGORY": {
            "value": "category",
            "plural": "categories"
        },
        "<textCode>": {
            "value": "text",
            "<special>": "textSpecial"
        }
    }
    ```
    - you have an json-schema [here](./translationsExample/languageSchema.json)

    - \<special\>: is any variant of your original text (plural, interrogative, ...)

3. execute this command `build-translations <path to your translations folder>`,
to create `languageCodes.json`, `textCodes.json`, `translations.json`. These three
files are the compilation of the previous files.

4. In your project, create a file `initTranslations.js`:
    ```javascript
    const {TranslationManager} = require("translation-manager");
    const languageCodes        = require("translations/languageCodes");
    const translations         = require("translations/translations");

    TranslationManager.initData( languageCodes, translations );
    TranslationManager.setAppLanguage( "en" );
    // check Error
    if ( process.env.ENVIRONMENT !== "prod" )
        TranslationManager.verifyJson({ redundantCheck: false });
    ```
    **IMPORTANT**: for webpack front app:
    Import `initTranslations.js` in first, in the entrance file of your app.
    So that `TranslationManager.initData` always takes place before calling `TranslationManager.getText`

5. Finish, you can use TranslationManager:
    ```javascript
    const {TranslationManager} = require("translation-manager");
    const textCodes = require("translations/textCodes");

    TranslationManager.setAppLanguage( "en" );

    const addText      = TranslationManager.getText( textCodes.ADD );
    const categoryText = TranslationManager.getText( textCodes.CATEGORY, {special: "plural"} );

    console.log(`${addText} ${categoryText}`); // -> "add categories"
    TranslationManager.setAppLanguage( "fr" );
    console.log(addText + categoryText); // -> "ajouter catégories"
    ```

6. Add shortcuts to the commands in your `package.json` scripts
    ```json
    {
        "scripts": {
            "build-translations": "build-translations ./translations",
            "watch-translation": "watch-translations ./translations",
            "clean-translation": "clean-translations ./translations english true true"
        }
    }
    ```



## Commands
### build-translations
To build the translations files: `languageCodes.json`, `textCodes.json`, `translations.json`
```bash
$ build-translations <path_to_your_translations_folder>
```

### clean-translations
To clean your translations files (rearrange textCodes, sort them alphabetically and can transform their case)
```bash
$ build-translations <path_to_your_translations_folder> <base_folder_name> <organizeOtherLanguageLikeBase> <minimizeValueCase>
```
- path_to_your_translations_folder: path to the translation folder
- base_folder_name: the name of the language folder on which all cleaning will be based.
textCodes of other languages will be stored in the same way as the selected language. Default is "english"
- organizeOtherLanguageLikeBase: if you want to store textCode in the same way as the base language.
- minimizeValueCase: if you want to transform all value in lowerCase
```bash
example:
$ build-translations ./translations english true true
```

### watch-translations
To watch the change in folder translations, with this command effective,
any changement in translations files, trigger build-translations
```bash
$ watch-translations <path_to_your_translations_folder>
```

## API
### TranslationManager
#### [static] initData
To initialise the builded data
###### params:
- languageCodes: {Object} the builded json
- translations: {Object} the builded json
###### code:
```javascript
TranslationManager.initData(languageCodes: Object, translations: Object)
```


#### [static] getText
To get an text
###### params:
- the textCode, can be import by textCode.json (the builded file)
- options {Object}
    - options.special: ["value"] {string} the special value from the textCode to use
    - options.option: {string} an constant string (TranslationManager.textOptions=[capitalize,capitalizeWord,capitalizeSentence,uppercase,lowercase])
    - options.language: [appLanguage] {string} to force language
    - options.insertValues: {Object} an object of insert value {key: value}, in the translation text, you have to add ${<key>}
- forceString: [false] {boolean} if you don't wan't an TranslationText, but just a string.
The text is not subscribed to language changes, it will not change if you change the language,
but it is the lightest solution, and there is no need to execute destroy method.
###### return
return an instance TranslationText or a string (if forceString = true)
###### code:
```javascript
TranslationManager.getText( textCode: String, {}, forceString: boolean = false)
```


#### [static] translations
getter: get the translations initialised with initData


#### [static] languageCodes
getter: get the languageCodes initialised with initData


#### [static] getUserLanguage
only for web project, get the user locale
`navigator.language || navigator.userLanguage;`


#### [static] getAppLanguage
get the current language selected in TranslationManager


#### [static] setAppLanguage
set the current language selected in TranslationManager
###### code:
```javascript
TranslationManager.setAppLanguage( "fr" );
```


#### [static] onAppLanguageUpdate
to subscribe to the app language changement
###### params:
- handler: {function} an function which takes the new language as first argument,
and which will be executed each time app language is changed
###### return
return an function to unsubscribe the handler
###### code:
```javascript
TranslationManager.onAppLanguageUpdate( handler: function)
```

#### [static] removeAppLanguageUpdate
to unsubscribe to the app language changement
###### params:
- handler: {function} the previous added handler
###### code:
```javascript
TranslationManager.removeAppLanguageUpdate( handler: function)
```


#### [static] verifyJson
To check if the translation are correct:
- if a textcode in one language is present in all the others
- if one textcode is not redundant with another
###### params:
- redundantCheck: [true] {boolean} if you wan't a check on redondant textCode (two textCode with the same value, on same language)
###### code:
```javascript
    TranslationManager.verifyJson(redundantCheck:boolean = true)
```



### TranslationText
#### constructor
###### params:
- textCode {string}: the textCode
- options {Object}
    - options.special: ["value"] {string} the special value from the textCode to use
    - options.option: {string} an constant string (TranslationManager.textOptions=[capitalize,capitalizeWord,capitalizeSentence,uppercase,lowercase])
    - options.language: [appLanguage] {string} to force language
    - options.insertValues: {Object} an object of insert value {key: value}, in the translation text, you have to add ${<key>}###### code:
###### code:
```javascript
    const textCodes = require("translations/textCodes");
    myText = new TranslationText(textCodes.ADD, {special: "plural"} );
```

#### setOptions
change the internal options of the text
###### params:
- options {Object}
    - options.special: ["value"] {string} the special value from the textCode to use
    - options.option: {string} an constant string (TranslationManager.textOptions=[capitalize,capitalizeWord,capitalizeSentence,uppercase,lowercase])
    - options.language: [appLanguage] {string} to force language
    - options.insertValues: {Object} an object of insert value {key: value}, in the translation text, you have to add ${<key>}###### code:
###### code:
```javascript
    myText.setOptions(options:Object = {} )
```


#### destroy
to destroy the current text, and unsubscribe current text to the app language change event.
And avoid memory leaks


#### updateText
to force update the internal text
###### params:
- language: [null] {string} to force language (warning: the language in options, if specified always takes priority)
###### code:
```javascript
    myText.updateText(language:string = null )
```



## Notes
### TranslationManager.getText
`TranslationManager.getText` does not actually return a string,
it returns an instance of the TranslationText class. TranslationText is an extends of String.
But you can use it like a string, all the methods of the string class are available,
you can Jsonify, concat, split, trim...

However:
- `typeof` return "object"
- if you print it, in the console, it display all the object
- to avoid memory link, if you no longer need a text, think to do `monTexte.destroy()`

### insertValues
You can insert values in your text, translationManager use [lodash template](https://lodash.com/docs/4.17.15#template).
In your text in json file, add `${<keyName>}`.
When you make `getText`, specify insertValue option, example:
```json
{
    "AN_ERROR_OCCURRED": {
        "value": "an error occurred: ${errorMessage}"
    }
}
```

```javascript
const err = new Error("foobar");
TranslationManager.getText(textCode.AN_ERROR_OCCURRED, {insertValues: {errorMessage: err.message}});
```



## Authors
- **Eden Cadagiani** for [HelloMyBot](https://hellomybot.io/fr/bienvenue/)



## License
This project is licensed under the MIT - see the [LICENSE](LICENSE) file for details
