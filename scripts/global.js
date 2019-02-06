/*
 *  This template can be found at 
 *  https://github.com/AlanClasses/JS-Compiler
 *  Modified by: Liam Healy - liam.healy1@marist.edu
 */

// These are the global variables
var tokens = "";
var tokenIndex = 0;
var currentToken = "";
var errorCount = 0;
var EOF = "$";

function init() {
    // Clear the output box when loading in
    document.getElementById("output").value = "";
    // Set the values for our global variables
    tokens = "";            // Our source code
    tokenIndex = 0;         // The line for the token being examined
    currentToken = ' ';     // The token being examined
    errorCount = 0;         // Count of lex errors - pattern does not exist in our alphabet
}

function btnCompile_click() {
    // User clicks compile button between
    // the text areas.
    init();
    if (trim(document.getElementById("input").value) == '') {
        putMessage("Nothing to compile...")
    }
    else {
        putMessage("Compilation Started");
        // Take the tokens from the lexer
        tokens = lex();
        putMessage("Lex returned [" + tokens + "]");
        // now parse.
        parse();
    }
}

function putMessage(msg) {
    document.getElementById("output").value += msg + "\n";
}

function parse() {
    putMessage("Parsing [" + tokens + "]");
    // Grab the next token.
    currentToken = getNextToken();
    // A valid parse derives the G(oal) production, so begin there.
    parseG();
    // Report the results.
    putMessage("Parsing found " + errorCount + " error(s).");        
}

function parseG() {
    // A G(oal) production can only be an E(xpression), so parse the E production.
    parseE();
}

function parseE() {
    // All E productions begin with a digit, so make sure that we have one.
    checkToken("digit");
    // Look ahead 1 char (which is now in currentToken because checkToken 
    // consumes another one) and see which E production to follow.
    if (currentToken != EOF) {
        // We're not done, we expect to have an op.
        checkToken("op");
        parseE();
    } 
    else {
        // There is nothing else in the token stream, 
        // and that's cool since E --> digit is valid.
        putMessage("EOF reached");
    }
}

// function checkToken(expectedKind) {
//     // Validate that we have the expected token kind and get the next token.
//     switch(expectedKind) {
//         case "digit":   putMessage("Expecting a digit");
//                 if (currentToken=="0" || currentToken=="1" || currentToken=="2" || 
//                     currentToken=="3" || currentToken=="4" || currentToken=="5" || 
//                     currentToken=="6" || currentToken=="7" || currentToken=="8" || 
//                     currentToken=="9") {
//                     putMessage("Got a digit!");
//                 }
//                 else {
//                     errorCount++;
//                     putMessage("NOT a digit.  Error at position " + tokenIndex + ".");
//                 }
//                 break;
//         case "op":      putMessage("Expecting an operator");
//                 if (currentToken=="+" || currentToken=="-") {
//                 putMessage("Got an operator!");
//                 }
//                 else {
//                     errorCount++;
//                     putMessage("NOT an operator.  Error at position " + tokenIndex + ".");
//                 }
//                 break;
//         case "keyword":      putMessage("Expecting a keyword");
//                 if (currentToken=="int" || currentToken=="String" || currentToken=="bool") {
//                     putMessage("Got a keyword!");
//                 }
//                 else {
//                     errorCount++;
//                     putMessage("Not a keyword. Error at position " + tokenIndex + ".");
//                 }
//                 break;
//         default:        putMessage("Parse Error: Invalid Token Type at position " + tokenIndex + ".");
//                 break;			
//     }
//     // Consume another token, having just checked this one, because that 
//     // will allow the code to see what's coming next... a sort of "look-ahead".
//     currentToken = getNextToken();
// }

function getNextToken() {
    var thisToken = EOF;    // Let's assume that we're at the EOF.
    if (tokenIndex < tokens.length) {
        // If we're not at EOF, then return the next token in the stream and advance the index.
        thisToken = tokens[tokenIndex];
        putMessage("Current token:" + thisToken);
        tokenIndex++;
    }
    return thisToken;
}