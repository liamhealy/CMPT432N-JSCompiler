/*
    utils.js

    Utility functions.
*/

const selectedFile = document.getElementById("upload").addEventListener('change', getFile);
var fileReader = new FileReader();

function trim(str)      // Use a regular expression to remove leading and trailing spaces.
{
	return str.replace(/^\s+ | \s+$/g, "");
	/* 
	Huh?  Take a breath.  Here we go:
	- The "|" separates this into two expressions, as in A or B.
	- "^\s+" matches a sequence of one or more whitespace characters at the beginning of a string.
    - "\s+$" is the same thing, but at the end of the string.
    - "g" makes is global, so we get all the whitespace.
    - "" is nothing, which is what we replace the whitespace with.
	*/
	
}

function rot13(str)     // An easy-to understand implementation of the famous and common Rot13 obfuscator.
{                       // You can do this in three lines with a complex regular experssion, but I'd have
    var retVal = "";    // trouble explaining it in the future.  There's a lot to be said for obvious code.
    for (var i in str)
    {
        var ch = str[i];
        var code = 0;
        if ("abcedfghijklmABCDEFGHIJKLM".indexOf(ch) >= 0)
        {            
            code = str.charCodeAt(i) + 13;  // It's okay to use 13.  It's not a magic number, it's called rot13.
            retVal = retVal + String.fromCharCode(code);
        }
        else if ("nopqrstuvwxyzNOPQRSTUVWXYZ".indexOf(ch) >= 0)
        {
            code = str.charCodeAt(i) - 13;  // It's okay to use 13.  See above.
            retVal = retVal + String.fromCharCode(code);
        }
        else
        {
            retVal = retVal + ch;
        }
    }
    return retVal;
}

function matchBreak(str) {
    if (str == /[^\n]*\n[^\n]*/gi) {
        return true;
    }
    else {
        return false;
    }
}

// function matchChar(str) {
//     var alphabet = /[a-z]/i;
//     if (str.match(alphabet)) {
//         return true;
//     }
//     else {
//         return false;
//     }
// }

//  The File Reader API https://developer.mozilla.org/en-US/docs/Web/API/FileReader
function getFile(event) {
    // fileReader.onload = 
    const uploadedFile = event.target;
    if ('files' in uploadedFile && uploadedFile.files.length > 0) {
        insertContent(document.getElementById("input"), uploadedFile.files[0])
    }
}

function insertContent(target, file) {
    readContent(file).then(content => { target.value = content}).catch(error => console.log,log(error))
}

function readContent(file) {
    const reader = new FileReader()
    return new Promise((resolve, reject) => {
        reader.onload = event => resolve(event.target.result)
        reader.onerror = error => reject(error)
        reader.readAsText(file)
    })
}