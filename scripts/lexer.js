/*  lexer.js    */

// Keep count of lex errors and programs
var lexErrors = 0;
var programCount = 0;
// Line number
var lineNum = 0;

function lex() {
    // Grab the "raw" source code.
    var sourceCode = document.getElementById("input").value;
    // Trim the leading and trailing spaces.
    sourceCode = trim(sourceCode);
    // TODO: remove all spaces in the middle; remove line breaks too.
    return sourceCode;
}

function checkToken(currentToken) {
    // Validate that we have the expected token kind and get the next token.
    // switch(expectedKind) {
    //     case "i":
    //             if (currentToken=="i") {
    //                 addToken("T_CHAR", "i", tokenIndex);
    //                 putMessage("New token '" + currentToken + "' at line " + tokenIndex + ".");
    //             }
    //             else {
    //                 errorCount++;
    //                 putMessage("Invalid input at line " + tokenIndex + ".");
    //             }
    //             break;
    //     case "=":
    //             if (currentToken=="=") {
    //                 addToken("T_ASSIGNOP", "=", tokenIndex);
    //                 putMessage("New token '" + currentToken + "' at line " + tokenIndex + ".");
    //             }
    //             else {
    //                 errorCount++;
    //                 putMessage("Invalid input at line " + tokenIndex + ".");
    //             }
    //             break;
    //     case "$":
    //             if (currentToken=="$" && getNextToken(currentToken) != "") {
    //                 putMessage("Found '$'.");
    //             }
    //             else {
    //                 errorCount++;
    //                 putMessage("Invalid input at line " + tokenIndex + ".");
    //             }
    //             break;
    //     default:        putMessage("Parse Error: Invalid Input Type at position " + tokenIndex + ".");
    //             lexErrors++;
    //             break;			
    // }
    // Consume another token, having just checked this one, because that 
    // will allow the code to see what's coming next... a sort of "look-ahead".
    
    // Detect new lines
    var newLine = tokens.split("\n");

    for (var lineCol = 0; lineCol < newLine.length; lineCol++) {
            
        // Handle "i"
        if (currentToken == "i") {
            addToken("T_CHAR", "i", newLine, lineCol);
            putMessage("New token '" + currentToken + "' at line " + tokenIndex + ".");
            continue;
        }

        // Handle EOF
        if (currentToken == "$") {
            addToken("T_EOF", "$", newLine, lineCol);
            programCount++;
            continue;
        }

        // Handle new lines
        if (currentToken == "\n") {
            // Ignore them, but increment line number
            lineNum++;
            lineCol = 0;
            continue;
        }
    }
    currentToken = getNextToken();
}

function addToken(tokenId, value, line) {
    // Create a token to enter into the token sequence
    var newToken = new token(tokenId, value, line);
    // Add our new token
    tokenSequence.push(newToken);
}