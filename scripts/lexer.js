/*  lexer.js    */

// Keep count of lex errors
var lexErrors = 0;
var programCount = 0;

function lex() {
    // Grab the "raw" source code.
    var sourceCode = document.getElementById("input").value;
    // Trim the leading and trailing spaces.
    sourceCode = trim(sourceCode);
    // TODO: remove all spaces in the middle; remove line breaks too.
    return sourceCode;
}

function checkToken(expectedKind) {
    // Validate that we have the expected token kind and get the next token.
    switch(expectedKind) {
        case "digit":   putMessage("Expecting a digit");
                if (currentToken=="0" || currentToken=="1" || currentToken=="2" || 
                    currentToken=="3" || currentToken=="4" || currentToken=="5" || 
                    currentToken=="6" || currentToken=="7" || currentToken=="8" || 
                    currentToken=="9") {
                    putMessage("Got a digit!");
                }
                else {
                    errorCount++;
                    putMessage("NOT a digit.  Error at position " + tokenIndex + ".");
                }
                break;
        case "op":      putMessage("Expecting an operator");
                if (currentToken=="+" || currentToken=="-") {
                    putMessage("Got an operator!");
                }
                else {
                    errorCount++;
                    putMessage("NOT an operator.  Error at position " + tokenIndex + ".");
                }
                break;
        case "i":      putMessage("Examining token...");
                if (currentToken=="i") {
                    addToken("T_CHAR", "i", tokenIndex);
                    putMessage("New token '" + currentToken + "' at line " + tokenIndex + ".");
                }
                else {
                    errorCount++;
                    putMessage("Invalid input at line " + tokenIndex + ".");
                }
                break;
        case "=":
                if (currentToken=="=") {
                    addToken("T_ASSIGNOP", "=", tokenIndex);
                    putMessage("New token '" + currentToken + "' at line " + tokenIndex + ".");
                }
                else {
                    errorCount++;
                    putMessage("Invalid input at line " + tokenIndex + ".");
                }
                break;
        default:        putMessage("Parse Error: Invalid Token Type at position " + tokenIndex + ".");
                break;			
    }
    // Consume another token, having just checked this one, because that 
    // will allow the code to see what's coming next... a sort of "look-ahead".
    currentToken = getNextToken();
}

function addToken(tokenId, value, line) {
    // Create a token to enter into the token sequence
    var newToken = new token(tokenId, value, line);
    // Add our new token
    tokenSequence.push(newToken);
}

// function checkToken(token) {
//     if (token == "i") {
//         document.getElementById("output").putMessage("We found an i");
//         token.tokenId = "T_I";
//         token.value = "i";
//         token.line = tokenIndex;
//         tokenSequence.push(token)
//     }
//     else {
//         document.getElementById("output").putMessage("Not sure what to do with this token yet...");
//     }
// }