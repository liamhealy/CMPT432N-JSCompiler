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

// Boolean value for determining where comments
// begin and where they end.
var isComment = false;
var isString = false;

function lex() {
    // Grab the "raw" source code.
    var sourceCode = document.getElementById("input").value;
    // Trim the leading and trailing spaces.
    sourceCode = trim(sourceCode);
    // TODO: remove all spaces in the middle; remove line breaks too.
    return sourceCode;
}

// var listIndex = 0;
// var tokenList = tokens.split("$");

function checkToken(currentToken) {
    // myString = tokens.split(tokens.indexOf("$") + 1);
    // console.log(myString);
    // if (myString[1].substr(-1) != "$") {
    //     console.log(myString[1] + " did not find $");
    // }

    // Initiate line number and column/index number
    // Resets to one after an EOP is reached
    lineNum = 1;
    lineCol = 1;

    // Check for '$' (EOP), if it does not exist return a warning.
    // if (tokens.substr(-1) != EOP) {
    //     lexGrammarWarning = true;
    //     lexWarningCount++;
    //     tokens += "$";
    //     putMessage("Warning: Expecting '$' following the end of program " + programCount + ". The lexer has gone ahead and added it.");
    // }

    for (tokenIndex; tokenIndex < tokens.length; tokenIndex++) {

        if (lineCol >= 1) {
            currentToken = getNextToken(currentToken);
        }

        // If '$' does not sit at the end of the last program, issue a warning
        // and add it to the input
        if (currentToken != EOP && tokenIndex == tokens.length - 1) {
            lexGrammarWarning = true;
            lexWarningCount++;
            tokens += "$";
            putMessage("ALERT Lexer - Warning: Expecting '$' following the end of program " + programCount + ". The lexer has added it.");
        }

        // Handle Comments
        if (currentToken == "/") {
            if (tokens.charAt(tokenIndex + 1) == "*") {
                console.log("Found where a comment started.");
                isComment = true;
                lineCol++;
                continue;
            }
        }

        // Handle characters within comments
        if (currentToken == "*") {
            if (tokens.charAt(tokenIndex + 1) == "/" && isComment == true) {
                lineCol = lineCol + 1;
                tokenIndex = tokenIndex++;
                continue;
            }

            if (tokens.charAt(tokenIndex + 1) == "*" && isComment == true) {
                console.log("We found another star, but this may mean the end of the comment... " + tokens.charAt(tokenIndex + 1));
                lineCol++;
                continue;
            }
            
            if (tokens.charAt(tokenIndex - 1) == "/" && isComment == true) {
                console.log("Found the * that begins the comment. " + tokens.charAt(tokenIndex - 1));
                lineCol++;
                continue;
            }
        }

        // Handle the "/" that ends a comment
        if (currentToken == "/") {
            if (tokens.charAt(tokenIndex - 1) == "*" && isComment == true) {
                console.log("Found where a comment ended. " + lineNum + "," + lineCol);
                lineCol++;
                isComment = false;
                continue;
            }
        }

        // Handle any other characters within a comment
        if (currentToken != "/" && currentToken != "*" && isComment == true) {
            // Handle line breaks
            if (currentToken == " ") {
                lineCol++;
                continue;
            }
            if (currentToken == matchBreak(currentToken)) {
                // Ignore it, but increment line number
                lineCol = 1;
                lineNum++;
                continue;
            }
            else {
                lineCol++;
                continue;
            }
        }

        // Handle strings
        if (currentToken == "\"") {
            if (isString == false) {
                console.log("found a String.");
                isString = true;
                lineCol++;
                continue;
            }
            else {
                console.log("String was either ended here or was not found.");
                isString = false;
                lineCol++;
                continue;
            }
        }

        // Handle any other characters within a string
        if (currentToken != "\"" && isString == true) {
            // Handle line breaks
            if (currentToken == " ") {
                lineCol++;
                continue;
            }
            if (currentToken == matchBreak(currentToken)) {
                // Ignore it, but increment line number
                lineCol = 1;
                lineNum++;
                continue;
            }
            else {
                lineCol++;
                continue;
            }
        }

        // Handle "int", "if", and the "i" identifier
        if (currentToken == "i") {
            if (tokens.charAt(tokenIndex + 1) == "n" && tokens.charAt(tokenIndex + 2) == "t") {
                addToken("T_TYPE", "int", lineNum, lineCol + 2, programCount);
                putMessage("DEBUG Lexer - T_TYPE [ int ] found at (" + lineNum + "," + lineCol + ")");
                lineCol = lineCol + 3;
                tokenIndex = tokenIndex + 2;
                continue;
            }
            else if (tokens.charAt(tokenIndex + 1) == "f") {
                addToken("T_IF", "if", lineNum, lineCol + 2, programCount);
                putMessage("DEBUG Lexer - T_IF [ if ] found at (" + lineNum + "," + lineCol + ")");
                lineCol = lineCol + 2;
                tokenIndex = tokenIndex + 1;
                continue;
            }
            else {
                addToken("T_ID", "i", lineNum, lineCol, programCount);
                putMessage("DEBUG Lexer - T_ID [ " + currentToken + " ] found at (" + lineNum + "," + lineCol + ")");
                lineCol++;
                continue;
            }
        }
        
        // Handle 'while' and the 'w' identifier
        if (currentToken == "w") {
            if (tokens.charAt(tokenIndex + 1) == "h" && tokens.charAt(tokenIndex + 2) == "i" && tokens.charAt(tokenIndex + 3) == "l" && tokens.charAt(tokenIndex + 4) == "e") {
                addToken("T_WHILE", "w", lineNum, lineCol + 5, programCount);
                putMessage("DEBUG Lexer - T_WHILE [ while ] found at (" + lineNum + "," + lineCol + ")");
                lineCol = lineCol + 5;
                tokenIndex = tokenIndex + 4;
                continue;
            }
            else {
                addToken("T_ID", "w", lineNum, lineCol, programCount);
                putMessage("DEBUG Lexer - T_ID [ w ] found at (" + lineNum + "," + lineCol + ")");
                lineCol++;
                continue;
            }
        }

        // Handle spaces
        if (currentToken == " ") {
            addToken("T_SPACE", "[Space]", lineNum, lineCol, programCount);
            putMessage("New token '[Space]' at line " + lineNum + ", index " + lineCol + ".");
            lineCol++;
            continue;
        }

        // Handle EOP
        if (currentToken == EOP) {
            addToken("EOP", "$", lineNum, lineCol, programCount);
            putMessage("DEBUG Lexer - EOP [ " + currentToken + " ] found at (" + lineNum + "," + lineCol + ")");
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
            putMessage("ERROR Lexer - Error:(" + lineNum + "," + lineCol + ") Unrecognized token: " + currentToken);
            lineCol++;
        }
    }
    // return currentToken;
}

// Return some output when the lexer is finished with a program
function endOfProgram() {
    // putMessage("EOP reached.");
    // Count lex errors and add them to total count.
    errorCount += lexErrorCount;
    warningCount += lexWarningCount;
    // Reset line # and column/index #
    lineNum = 1;
    lineCol = 1;
    // Report the results.
    if (errorCount > 0) {
        putMessage("INFO Lexer - Lex failed with " + lexErrorCount + " error(s) and " + lexWarningCount + " warning(s).");
    }
    else {
        putMessage("INFO Lexer - Lex completed with " + lexErrorCount + " error(s) and " + lexWarningCount + " warning(s).");
    }
    lexErrorCount = 0;
    lexWarningCount = 0;
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
        putMessage("\nINFO  Lexer - Lexing program " + programCount + "...");
    }
}