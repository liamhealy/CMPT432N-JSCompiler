/*  lexer.js    */

// Keep count of lex warnings, errors and programs
var grammarWarning = false;
var lexWarningCount = 0;
var lexErrorCount = 0;
var programCount = 0;

// Line number
var lineNum = 0;

// Detect new lines
// var newLine = tokens.split(" ");

function lex() {
    // Grab the "raw" source code.
    var sourceCode = document.getElementById("input").value;
    // Trim the leading and trailing spaces.
    sourceCode = trim(sourceCode);
    // TODO: remove all spaces in the middle; remove line breaks too.
    return sourceCode;
}

function checkToken(currentToken) {
    // Initiate line number
    lineNum = 1;

    // Check for '$' (EOP), if it does not exist return a warning.
    if (tokens.substr(-1) != EOP) {
        grammarWarning = true;
        lexWarningCount++;
        putMessage("Warning: Expecting '$' following the end of program " + programCount + ".");
    }

    for (tokenIndex; tokenIndex < tokens.length; tokenIndex++) {

        if (tokenIndex > 0) {
            currentToken = getNextToken(currentToken);
        }

        putMessage("Current token:" + currentToken);

        // Handle "i"
        if (currentToken == "i") {
            addToken("T_CHAR", "i", lineNum, tokenIndex);
            putMessage("New token '" + currentToken + "' at line " + lineNum + ", index " + tokenIndex + ".");
            var iterationNum = tokenIndex;
            // Just for debugging:
            console.log("iteration number: " + iterationNum + ", tokens: " + tokens.toString());
            continue;
        }

        if (currentToken == "w") {
            addToken("T_CHAR", "w", lineNum, tokenIndex);
            putMessage("New token '" + currentToken + "' at line " + lineNum + ", index " + tokenIndex + ".");
            var iterationNum = tokenIndex;
            // Just for debugging:
            console.log("iteration number: " + iterationNum + ", tokens: " + tokens.toString());
            continue;
        }

        // Handle EOP
        if (currentToken == EOP) {
            addToken("T_EOP", "$", lineNum, tokenIndex);
            putMessage("New token '" + currentToken + "' at line " + lineNum + ", index " + tokenIndex + ".");
            putMessage("EOP reached.");
            var tempSequence = tokens.toString();
            tempSequence = tempSequence.split();
            // putMessage("Token sequence: " + tempSequence);
            printSequence();
            programCount++;
            continue;
        }

        // Handle new lines
        // Doesn't work just yet
        if (currentToken == '\\n') {
            // Ignore them, but increment line number
            lineCol = 0;
            // lineNum++;
            console.log(tokens);
            continue;
        }
    }
}