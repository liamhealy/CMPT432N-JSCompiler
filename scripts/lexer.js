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
    // Initiate line number and column/index number
    // Resets to one after an EOP is reached
    lineNum = 1;
    lineCol = 1;

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
        if (isString == false){
            if (currentToken == "/") {
                if (tokens.charAt(tokenIndex + 1) == "*") {
                    console.log("Found where a comment started.");
                    isComment = true;
                    lineCol++;
                    continue;
                }
            }    
        }

        // Handle characters within comments
        if (currentToken == "*") {
            if (tokens.charAt(tokenIndex + 1) == "/" && isComment == true) {
                lineCol = lineCol + 2;
                tokenIndex = tokenIndex + 1;
                isComment = false;
                continue;
            }

            if (tokens.charAt(tokenIndex + 1) == "*" && isComment == true) {
                lineCol++;
                continue;
            }
            
            if (tokens.charAt(tokenIndex - 1) == "/" && isComment == true) {
                lineCol++;
                continue;
            }
        }

        // Handle the "/" that ends a comment
        // if (currentToken == "/") {
        //     if (tokens.charAt(tokenIndex - 1) == "*" && isComment == true) {
        //         console.log("Found where a comment ended. " + lineNum + "," + lineCol);
        //         lineCol++;
        //         isComment = false;
        //         continue;
        //     }
        // }

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
                addToken("T_OPENQUOTE", currentToken, lineNum, lineCol, programCount);
                putMessage("DEBUG Lexer - T_OPENQUOTE [ " + currentToken + " ] found at (" + lineNum + "," + lineCol + ")");
                lineCol++;
                continue;
            }
            else if (isString == true) {
                console.log("String was either ended here or was not found.");
                isString = false;
                addToken("T_CLOSEQUOTE", currentToken, lineNum, lineCol, programCount);
                putMessage("DEBUG Lexer - T_CLOSEQUOTE [ " + currentToken + " ] found at (" + lineNum + "," + lineCol + ")");
                lineCol++;
                continue;
            }
        }

        // Handle any other characters within a string
        if (currentToken != "\"" && isString == true) {
            // Handle line breaks
            if (currentToken == " ") {
                addToken("T_CHAR", " ", lineNum, lineCol, programCount);
                putMessage("DEBUG Lexer - T_CHAR [ " + currentToken + " ] found at (" + lineNum + "," + lineCol + ")");
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
                addToken("T_CHAR", currentToken, lineNum, lineCol, programCount);
                putMessage("DEBUG Lexer - T_CHAR [ " + currentToken + " ] found at (" + lineNum + "," + lineCol + ")");
                lineCol++;
                continue;
            }
        }

        // Handle left and right braces
        if (currentToken == "{") {
            addToken("T_LBRACE", "{", lineNum, lineCol, programCount);
            putMessage("DEBUG Lexer - T_LBRACE [ " + currentToken + " ] found at (" + lineNum + "," + lineCol + ")");
            lineCol++;
            continue;
        }

        if (currentToken == "}") {
            addToken("T_RBRACE", "}", lineNum, lineCol, programCount);
            putMessage("DEBUG Lexer - T_RBRACE [ " + currentToken + " ] found at (" + lineNum + "," + lineCol + ")");
            lineCol++;
            continue;
        }

        // Handle "print" and the "p" identifier
        if (currentToken == "p") {
            if (tokens.charAt(tokenIndex + 1) == "r" && tokens.charAt(tokenIndex + 2) == "i" && tokens.charAt(tokenIndex + 3) == "n" && tokens.charAt(tokenIndex + 4) == "t") {
                addToken("T_PRINTSTMT", "print", lineNum, lineCol, programCount);
                putMessage("DEBUG Lexer - T_PRINTSTMT [ print ] found at (" + lineNum + "," + lineCol + ")");
                lineCol = lineCol + 5;
                tokenIndex = tokenIndex + 4;
                continue;
            }
            else {
                addToken("T_ID", "p", lineNum, lineCol, programCount);
                putMessage("DEBUG Lexer - T_ID [ " + currentToken + " ] found at (" + lineNum + "," + lineCol + ")");
                lineCol++;
                continue;
            }
        }

        // Handle left and right parentheses
        if (currentToken == "(") {
            addToken("T_LPARENTHESES", "(", lineNum, lineCol, programCount);
            putMessage("DEBUG Lexer - T_LPARENTHESES [ " + currentToken + " ] found at (" + lineNum + "," + lineCol + ")");
            lineCol++;
            continue;
        }

        if (currentToken == ")") {
            addToken("T_RPARENTHESES", "(", lineNum, lineCol, programCount);
            putMessage("DEBUG Lexer - T_RPARENTHESES [ " + currentToken + " ] found at (" + lineNum + "," + lineCol + ")");
            lineCol++;
            continue;
        }

        // Handle "boolean" and the "b" identifier
        if (currentToken == "b") {
            if (tokens.charAt(tokenIndex + 1) == "o" && tokens.charAt(tokenIndex + 2) == "o" && tokens.charAt(tokenIndex + 3) == "l" && tokens.charAt(tokenIndex + 4) == "e" && tokens.charAt(tokenIndex + 5) == "a" && tokens.charAt(tokenIndex + 6) == "n") {
                addToken("T_TYPE", "boolean", lineNum, lineCol, programCount);
                putMessage("DEBUG Lexer - T_TYPE [ boolean ] found at (" + lineNum + "," + lineCol + ")");
                lineCol = lineCol + 7;
                tokenIndex = tokenIndex + 6;
                continue;
            }
            else {
                addToken("T_ID", "b", lineNum, lineCol, programCount);
                putMessage("DEBUG Lexer - T_ID [ " + currentToken + " ] found at (" + lineNum + "," + lineCol + ")");
                lineCol++;
                continue;
            }
        }

        // Handle "string" and the "s" identifier
        if (currentToken == "s") {
            if (tokens.charAt(tokenIndex + 1) == "t" && tokens.charAt(tokenIndex + 2) == "r" && tokens.charAt(tokenIndex + 3) == "i" && tokens.charAt(tokenIndex + 4) == "n" && tokens.charAt(tokenIndex + 5) == "g") {
                addToken("T_TYPE", "string", lineNum, lineCol, programCount);
                putMessage("DEBUG Lexer - T_TYPE [ string ] found at (" + lineNum + "," + lineCol + ")");
                lineCol = lineCol + 6;
                tokenIndex = tokenIndex + 5;
                continue;
            }
            else {
                addToken("T_ID", "s", lineNum, lineCol, programCount);
                putMessage("DEBUG Lexer - T_ID [ " + currentToken + " ] found at (" + lineNum + "," + lineCol + ")");
                lineCol++;
                continue;
            }
        }

        // Handle "int", "if", and the "i" identifier
        if (currentToken == "i") {
            if (tokens.charAt(tokenIndex + 1) == "n" && tokens.charAt(tokenIndex + 2) == "t") {
                addToken("T_TYPE", "int", lineNum, lineCol, programCount);
                putMessage("DEBUG Lexer - T_TYPE [ int ] found at (" + lineNum + "," + lineCol + ")");
                lineCol = lineCol + 3;
                tokenIndex = tokenIndex + 2;
                continue;
            }
            else if (tokens.charAt(tokenIndex + 1) == "f") {
                addToken("T_IF", "if", lineNum, lineCol, programCount);
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
                addToken("T_WHILE", "while", lineNum, lineCol + 5, programCount);
                putMessage("DEBUG Lexer - T_WHILE [ while ] found at (" + lineNum + "," + lineCol + ")");
                lineCol = lineCol + 5;
                tokenIndex = tokenIndex + 4;
                continue;
            }
            else {
                addToken("T_ID", "w", lineNum, lineCol, programCount);
                putMessage("DEBUG Lexer - T_ID [ " + currentToken + " ] found at (" + lineNum + "," + lineCol + ")");
                lineCol++;
                continue;
            }
        }

        // Handle boolean values (true | false)
        if (currentToken == "t") {
            if (tokens.charAt(tokenIndex + 1) == "r" && tokens.charAt(tokenIndex + 2) == "u" && tokens.charAt(tokenIndex + 3) == "e") {
                addToken("T_BOOLVAL", "true", lineNum, lineCol + 5, programCount);
                putMessage("DEBUG Lexer - T_BOOLVAL [ true ] found at (" + lineNum + "," + lineCol + ")");
                lineCol = lineCol + 4;
                tokenIndex = tokenIndex + 3;
                continue;
            }
            else {
                addToken("T_ID", "t", lineNum, lineCol, programCount);
                putMessage("DEBUG Lexer - T_ID [ t ] found at (" + lineNum + "," + lineCol + ")");
                lineCol++;
                continue;
            }
        }

        if (currentToken == "f") {
            if (tokens.charAt(tokenIndex + 1) == "a" && tokens.charAt(tokenIndex + 2) == "l" && tokens.charAt(tokenIndex + 3) == "s" && tokens.charAt(tokenIndex + 4) == "e") {
                addToken("T_BOOLVAL", "false", lineNum, lineCol + 5, programCount);
                putMessage("DEBUG Lexer - T_BOOLVAL [ false ] found at (" + lineNum + "," + lineCol + ")");
                lineCol = lineCol + 5;
                tokenIndex = tokenIndex + 4;
                continue;
            }
            else {
                addToken("T_ID", "f", lineNum, lineCol, programCount);
                putMessage("DEBUG Lexer - T_ID [ " + currentToken + " ] found at (" + lineNum + "," + lineCol + ")");
                lineCol++;
                continue;
            }
        }

        // Handle all other acceptable CHAR's
        if ('acdeghijklmnoqruvxyz'.includes(currentToken)) {
            addToken("T_ID", currentToken, lineNum, lineCol, programCount);
            putMessage("DEBUG Lexer - T_ID [ " + currentToken + " ] found at (" + lineNum + "," + lineCol + ")");
            lineCol++;
            continue;
        }

        // Handle all acceptable numbers (DIGITs)
        if ('0123456789'.includes(currentToken)) {
            addToken("T_DIGIT", currentToken, lineNum, lineCol, programCount);
            putMessage("DEBUG Lexer - T_DIGIT [ " + currentToken + " ] found at (" + lineNum + "," + lineCol + ")");
            lineCol++;
            continue;
        }

        // Handle assignment operator '='
        if (currentToken == '=') {
            if(tokens.charAt(tokenIndex + 1) != '=') {
                addToken("T_ASSIGNOP", currentToken, lineNum, lineCol, programCount);
                putMessage("DEBUG Lexer - T_ASSIGNOP [ " + currentToken + " ] found at (" + lineNum + "," + lineCol + ")");
                lineCol++;
                continue;
            }
        }

        // Handle boolean operators '==' and '!='
        if (currentToken == '=') {
            if(tokens.charAt(tokenIndex + 1) == '=') {
                addToken("T_BOOLOP", "==", lineNum, lineCol, programCount);
                putMessage("DEBUG Lexer - T_BOOLOP [ == ] found at (" + lineNum + "," + lineCol + ")");
                tokenIndex = tokenIndex + 1;
                lineCol = lineCol + 2;
                continue;
            }
        }

        if (currentToken == '!') {
            if(tokens.charAt(tokenIndex + 1) == '=') {
                addToken("T_BOOLOP", "!=", lineNum, lineCol, programCount);
                putMessage("DEBUG Lexer - T_BOOLOP [ != ] found at (" + lineNum + "," + lineCol + ")");
                tokenIndex = tokenIndex + 1;
                lineCol = lineCol + 2;
                continue;
            }
        }

        // Handle int operator '+'
        if (currentToken == '+') {
            addToken("T_INTOP", currentToken, lineNum, lineCol, programCount);
            putMessage("DEBUG Lexer - T_INTOP [ " + currentToken + " ] found at (" + lineNum + "," + lineCol + ")");
            lineCol++;
            continue;
        }

        // Handle spaces
        if (currentToken == " ") {
            lineCol++;
            continue;
        }

        // Handle tabs (whitespace)
        if (currentToken == "\f") {
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