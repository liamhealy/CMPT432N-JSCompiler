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
    console.log(breakUp(tokens));
    // Initiate line number and column/index number
    // Resets to one after an EOP is reached
    lineNum = 1;
    lineCol = 1;

    // Check for '$' (EOP), if it does not exist return a warning.
    if (tokens.substr(-1) != EOP) {
        lexGrammarWarning = true;
        lexWarningCount++;
        tokens += "$";
        putMessage("Warning: Expecting '$' following the end of program " + programCount + ". The lexer has gone ahead and added it.");
    }

    for (tokenIndex; tokenIndex < tokens.length; tokenIndex++) {

        if (lineCol >= 1) {
            currentToken = getNextToken(currentToken);
        }

        // Handle "i"
        if (currentToken == "i") {
            addToken("T_CHAR", "i", lineNum, lineCol, programCount);
            putMessage("New token '" + currentToken + "' at line " + lineNum + ", index " + lineCol + ".");
            lineCol++;
            // Just for debugging:
            // var iterationNum = tokenIndex;
            // console.log("iteration number: " + iterationNum + ", tokens: " + tokens.toString());
            continue;
        }

        if (currentToken == "w") {
            addToken("T_CHAR", "w", lineNum, lineCol, programCount);
            putMessage("New token '" + currentToken + "' at line " + lineNum + ", index " + lineCol + ".");
            lineCol++;
            // Just for debugging:
            // var iterationNum = tokenIndex;
            // console.log("iteration number: " + iterationNum + ", tokens: " + tokens.toString());
            continue;
        }

        // Handle spaces
        if (currentToken == " ") {
            addToken("T_SPACE", "[Space]", lineNum, lineCol, programCount);
            putMessage("New token '[Space]' at line " + lineNum + ", index " + lineCol + ".");
            lineCol++;
            // Just for debugging:
            // var iterationNum = tokenIndex;
            // console.log("iteration number: " + iterationNum + ", tokens: " + tokens.toString());
            continue;
        }

        // Handle EOP
        if (currentToken == EOP) {
            addToken("T_EOP", "$", lineNum, lineCol, programCount);
            putMessage("New token '" + currentToken + "' at line " + lineNum + ", index " + lineCol + ".");
            if (tokenIndex < tokens.length - 1) {
                endOfProgram();
                continue;
            }
            else {
                endOfProgram();
                break;
            }
        }

        // Handle line breaks
        if (currentToken == matchBreak(currentToken)) {
            // Ignore it, but increment line number
            lineCol = 1;
            lineNum++;
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
    lineCol = 1;
    // Report the results.
    if (errorCount > 0) {
        putMessage("Lexer failed with " + lexErrorCount + " error(s) and " + lexWarningCount + " warning(s).");
    }
    else {
        putMessage("Lexer completed with " + lexErrorCount + " error(s) and " + lexWarningCount + " warning(s).");
    }
    // We can print the token sequence here, but there is no need.
    // printSequence();

    // Move on to the next program if we are not done.
    if (tokenIndex < tokens.length - 1) {
        // Prepare for the next program.
        programCount++;
        //reset errors and warnings for next program.
        lexErrorCount = 0;
        lexWarningCount = 0;
        // Reset the token sequence
        tokenSequence = [];
        putMessage("\nLexing program " + programCount + "...");
    }
}