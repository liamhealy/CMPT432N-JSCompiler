/*
 *  This template project can be found at 
 *  https://github.com/AlanClasses/JS-Compiler
 *  Modified by: Liam Healy - liam.healy1@marist.edu
 */

// These are the global variables
var tokens = "";            // Our source code
var tokenIndex = 0;         // The line # of the token being examined
var currentToken = "";      // The token being examined
var errorCount = 0;         // Total count of errors
var warningCount = 0;       // Total count of warnings
var EOP = "$";              // Denotes the end of a program/file
var tokenSequence = [];     // Hold all valid tokens
var ongoing = false;        // False = lexer is done, True = more prorgrams to lex

function init () {
    // Clear the output box when loading in
    document.getElementById("output").value = "";

    // Set the values for our global variables
    tokens = "";
    tokenIndex = 0;
    currentToken = ' ';
    errorCount = 0;
    warningCount = 0;
    tokenSequence = [];
    lexErrors = 0;
    programCount = 0;
}

function btnCompile_click () {
    // User clicks compile button between
    // the text areas.
    init();
    if (trim(document.getElementById("input").value) == "") {
        putMessage("Nothing to lex...");
    }
    else {
        programCount++;
        putMessage("Lexing program " + programCount + "...");
        // Take the tokens from the lexer
        tokens = lex();
        putMessage("Lex returned [" + tokens + "]");
        // now parse.
        parse();
    }
}

function putMessage (msg) {
    document.getElementById("output").value += msg + "\n";
}

function parse () {
    putMessage("Parsing [" + tokens + "]");
    // Grab the next token.
    currentToken = getNextToken();
    // A valid parse derives the G(oal) production, so begin there.
    parseG();
    // Count lex errors and add them to total count.
    errorCount += lexErrorCount;
    warningCount += lexWarningCount;
    // Report the results.
    putMessage("Lexer completed with " + errorCount + " error(s) and " + warningCount + " warning(s).");
}

function parseG () {
    // A G(oal) production can only be an E(xpression), so parse the E production.
    parseE();
}

function parseE () {
    // checkToken(currentToken);
    // Look ahead 1 char (which is now in currentToken because checkToken.
    // consumes another one) and see which E production to follow.
    if (currentToken != EOP && tokenIndex < tokens.length) {
        // We're not done, we might have another program to lex.
        // checkToken(currentToken);
        checkToken(currentToken);
        // parseE();
    }
    else {
        // Alert at the end of programs where '$' is not found.
        if (currentToken == EOP) {
            // There is nothing else in the token stream,
            // and that's cool since E --> digit is valid.
            putMessage("EOP reached.");
            putMessage("Token sequence: ");
        }
        else if (tokens.substr(currenToken) == null) {
            putMessage("EOP reached.");
            putMessage("Token sequence: ");
        }
    }
}

function getNextToken () {
    var thisToken = EOP;    // Let's assume that we're at the EOF.
    if (tokenIndex < tokens.length) {
        // If we're not at EOF, then return the next token in the stream and advance the index.
        thisToken = tokens[tokenIndex];
        // putMessage("Current token:" + thisToken);
        // tokenIndex++;
    }
    return thisToken;
}