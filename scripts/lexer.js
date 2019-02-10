/*  lexer.js    */

// Keep count of lex warnings, errors and programs
var lexGrammarWarning = false;
var lexWarningCount = 0;
var lexErrorCount = 0;
var programCount = 0;

// Line number
var lineNum = 0;

// newLine boolean alerts the lexer of a line break
// so that the lexer knows to ignore it.
// var newLine = false;

// lineCol represents the index for a character
// on an individual line, while tokenIndex
// represents the index of each character in the
// order they appear in the source code
var lineCol = 0;

function lex() {
    // Grab the "raw" source code.
    var sourceCode = document.getElementById("input").value;
    // Trim the leading and trailing spaces.
    sourceCode = trim(sourceCode);
    // TODO: remove all spaces in the middle; remove line breaks too.
    return sourceCode;
}

function checkToken(currentToken) {
    // Initiate line number and column/index number
    // Resets to one after an EOP is reached
    lineNum = 1;
    lineCol = 0;

    // Check for '$' (EOP), if it does not exist return a warning.
    if (tokens.substr(-1) != EOP) {
        lexGrammarWarning = true;
        lexWarningCount++;
        tokens += "$";
        putMessage("Warning: Expecting '$' following the end of program " + programCount + ". The lexer has gone ahead and added it.");
    }

    for (tokenIndex; tokenIndex < tokens.length; tokenIndex++) {

        if (lineCol >= 0) {
            currentToken = getNextToken(currentToken);
        }

        if (currentToken == match(currentToken)) {
            // newLine = true;
            lineCol = 0;
            lineNum++;
        }
        // else {
        //     if(newLine != true) {
        //         putMessage("Current token: '" + currentToken + "'");
        //     }
        //     else {
        //         newLine == false;
        //     } 
        // }
        
        // if(newLine != true) {
        //     putMessage("Current token: '" + currentToken + "'");
        // }
        // else {
        //     newLine == false;
        // }

        // Handle "i"
        if (currentToken == "i") {
            addToken("T_CHAR", "i", lineNum, lineCol);
            putMessage("New token '" + currentToken + "' at line " + lineNum + ", index " + lineCol + ".");
            lineCol++;
            // Just for debugging:
            // var iterationNum = tokenIndex;
            // console.log("iteration number: " + iterationNum + ", tokens: " + tokens.toString());
            continue;
        }

        if (currentToken == "w") {
            addToken("T_CHAR", "w", lineNum, lineCol);
            putMessage("New token '" + currentToken + "' at line " + lineNum + ", index " + lineCol + ".");
            lineCol++;
            // Just for debugging:
            // var iterationNum = tokenIndex;
            // console.log("iteration number: " + iterationNum + ", tokens: " + tokens.toString());
            continue;
        }

        // Handle EOP
        if (currentToken == EOP) {
            addToken("T_EOP", "$", lineNum, lineCol);
            putMessage("New token '" + currentToken + "' at line " + lineNum + ", index " + lineCol + ".");
            endOfProgram();
            continue;
        }

        if (currentToken == match(currentToken)) {
            // Do nothing
        }

        else {
            lexErrorCount++;
            putMessage("ERROR: The input '" + currentToken + "' at line " + lineNum + ", index " + lineCol + " is not valid.");
            lineCol++;
        }
    }
    // return currentToken;
}

// Return some output when the lexer is finished with a program
function endOfProgram() {
    putMessage("EOP reached.");
    // Count lex errors and add them to total count.
    errorCount += lexErrorCount;
    warningCount += lexWarningCount;
    // Reset line # and column/index #
    lineNum = 1;
    lineCol = 0;
    // Report the results.
    putMessage("Lexer completed with " + errorCount + " error(s) and " + warningCount + " warning(s).");
    printSequence();
    // Prepare for the next program.
    programCount++;
}