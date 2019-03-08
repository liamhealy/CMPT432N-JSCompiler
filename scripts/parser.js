// parser.js -- where parsing and tree creation will take place

var parseErrors = 0;

var parseWarnings = 0;

var expectedType = "";

var expectedFound = false;

var sequenceIndex = 0;

var thisToken;
thisToken = tokenSequence[sequenceIndex];

var blockLevel = 0;

var printActive = false;

var stringActive = false;

// function getToken() {
//     currentToken = tokenSequence[sequenceIndex];
// }

function nextToken() {
    // Move to the next token
    sequenceIndex = sequenceIndex + 1;
    thisToken = tokenSequence[sequenceIndex];
}

// Begin parsing from here
function parseStart() {
    if (tokenSequence.length == 0) {
        putMessage("-parsing finished");
        return;
    }

    putMessage("PARSER - parseStart()");

    thisToken = tokenSequence[sequenceIndex];

    if (thisToken.tokenId == "T_LBRACE") {
        parseBlock();
    }
    else {
        parseErrors++;
    }
    return;
    // if (tokenSequence.length == 0) {
    //     putMessage("Finished parsing.");
    // }
    // if (sequenceIndex == 0) {
    //     putMessage("-parseStart()");
    //     thisToken = tokenSequence[sequenceIndex];
    // }
    // if (thisToken.tokenId == "T_LBRACE" || thisToken.tokenId == "T_RBRACE") {
    //     parseBlock();
    // }
    // if (thisToken.tokenId == "EOP" && blockLevel == 0) {
    //     parseEOP();
    // }
    // // If the Block(s) are never closed, we have a parse error:
    // if (thisToken.tokenId == "EOP" && blockLevel > 0) {
    //     putMessage("-parse failure, unexpected token found");
    // }
    // // parseStart() only accepts <Block> or '$', anything else = parse error.
    // // else {
    // //     putMessage("-parse failure, unexpected token found");
    // //     parseErrors++;
    // // }
}

// Handle <Block>
function parseBlock() {
    // Handle left and right braces
    putMessage("PARSER - parseBlock()");

    if (thisToken.tokenId == "T_LBRACE") {
        blockLevel++;
        nextToken();
        // Jump to StatementList
        parseStmtList();
    }
    
    if (thisToken.tokenId == "T_RBRACE") {
        blockLevel--;
        nextToken();
        // Don't move downward from here
        // Have to somehow return from here if blockLevel = 0
        if (thisToken.tokenId == "EOP" && blockLevel > 0) {
            parseErrors++;
        }
        else if (thisToken.tokenId == "EOP" && blockLevel == 0) {
            parseEOP();
        }
        else {
            parseStmtList();
        }
        // returning from here is most likely safe
        return;
    }
    else {
        parseErrors++;
    }
    return;
    // putMessage("-parseBlock()");
    // // Handle left brace
    // if (thisToken.tokenId == "T_LBRACE") {
    //     blockLevel++;
    //     // Opening brace can lead to StmtList or another opening brace.
    //     parseStmtList();
    // }

    // // Handle right brace
    // if (thisToken.tokenId == "T_RBRACE") {
    //     blockLevel--;
    //     // Same idea shown above in left brace if-stmt
    //     parseStmtList();
    // }
}

function parseValues() {

}

// Handle <StatementList>
function parseStmtList() {
    putMessage("PARSER - parseStmtList()");

    // Check token obtained from parseBlock()
    if (thisToken.tokenId == "T_RBRACE") {
        parseBlock();
    }

    if (thisToken.tokenId == "T_PRINTSTMT" || thisToken.tokenId == "T_ID" ||
        thisToken.tokenId == "T_TYPE" || thisToken.tokenId == "T_WHILE" || 
        thisToken.tokenId == "T_IF" || thisToken.tokenId == "T_LBRACE") {
        
        parseStatement();
        if (thisToken.tokenId != "EOP") {
            // Must call nextToken() from here so that
            // we aren't jumping from token to token
            // in random spots in different functions
            nextToken();
            parseStmtList();
        }
    }
    else {
        parseErrors++;
    }
    return;
    // nextToken();
    // putMessage("-parseStmtList()")
    // // Handle Statement
    // if (thisToken.tokenId == "T_PRINTSTMT" || thisToken.tokenId == "T_ID" ||
    //     thisToken.tokenId == "T_TYPE" || thisToken.tokenId == "T_WHILE" ||
    //     thisToken.tokenId == "T_IF" || thisToken.tokenId == "T_LBRACE") {
        
    //     parseStatement();
    // }
    // if (thisToken.tokenId == "T_RBRACE") {
    //     parseBlock();
    // }
    // else {
    //     // Do nothing for now...
    // }
}

// Handle <Statement>
function parseStatement() {
    putMessage("PARSER - parseStatement()");
    
    // <PrintStatement>
    if (thisToken.tokenId == "T_PRINTSTMT") {
        parsePrintStmt();
    }
    // <AssignmentStatement>
    if (thisToken.tokenId == "T_ID") {
        parseAssignmentStmt();
    }
    // <VarDecl>
    if (thisToken.tokenId == "T_TYPE") {
        parseVarDecl();
    }
    // <WhileStatement>
    if (thisToken.tokenId == "T_WHILE") {
        parseWhileStmt();
    }
    // <IfStatement>
    if (thisToken.tokenId == "T_IF") {
        parseIfStmt();
    }
    // <Block>
    if (thisToken.tokenId == "T_LBRACE" || thisToken.tokenId == "T_RBRACE") {
        // Move back to parseBlock()
        if (thisToken.tokenId == "T_LBRACE" && blockLevel == 0) {
            parseErrors++;
        }
        else {
            parseBlock();
        }
    }
    return;
}

// Begin handling <PrintStatement>
function parsePrintStmt() {
    putMessage("PARSER - parsePrintStmt()");

    // To let the parser know we are in <PrintStatement>
    printActive = true;

    nextToken();

    // We need a left parentheses or we have an error:
    if (thisToken.tokenId == "T_LPARENTHESES") {
        checkLeftParen();
    }
    else {
        parseErrors++;
    }
    return;
    // // Handle PrintStatement
    // putMessage("-parsePrintStmt()");
    // if (thisToken.tokenId == "T_LPARENTHESES" && printActive == false) {
    //     printActive = true;
    //     // Jump to left paren. function
    //     leftParen();
    // }
    // if (thisToken.tokenId == "T_RPARENTHESES" && printActive == true) {
    //     printActive = false;
    //     // Jump to right paren. function
    //     console.log("heading back out of printstmt");
    //     return;
    // }
    // else {
    //     console.log("error is here");
    //     parseErrors++;
    // }
    // return;

}

function checkLeftParen() {
    // Check if we are printing:
    if (printActive == true) {
        // Look for an expr in parseExpr()
        nextToken();
        parseExpr();
    }
    else {
        parseErrors++;
    }
    checkRightParen();
    return;
    // // Handle left parentheses where necessary
    // if (printActive == true) {
    //     // Jump to the next token and move to parseExpr()
    //     nextToken();
    //     parseExpr();
    // }
    // return;
}

function checkRightParen() {
    // Check for a right parentheses
    nextToken();
    if (thisToken.tokenId == "T_RPARENTHESES") {
        // Leave the print statement
        printActive = false;
    }
    else {
        parseErrors++;
    }
    return;
}

function parseAssignmentStmt() {

}

function parseVarDecl() {

}

function parseWhileStmt() {

}

function parseIfStmt() {

}

function parseExpr() {
    putMessage("PARSER - parseExpr()");

    //For now, I will only set it up for Digits
    if (thisToken.tokenId == "T_DIGIT") {
        parseIntExpr();
    }
    else {
        parseErrors++;
    }
    return;

    // // Must handle '(' -> <expr> from PrintStatement
    // // '(' is a terminal term
    // putMessage("-parseExpr()");
    // if (thisToken.tokenId == "T_DIGIT") {
    //     // Going to need to call a separate intExpr() function here
    //     parseIntExpr();
    // }
    // if (thisToken.tokenId == "T_OPENQUOTE") {
    //     // Going to need to call a separate stringExpr() function here
    //     parseStringExpr();
    // }
    // if (thisToken.tokenId == "T_ID") {
    //     // Going to need to call a separate foundId() function here
    // }
    // if (thisToken.tokenId == "T_BOOLVAL") {
    //     // Going to need to do something else here
    //     // How do we handle booleans?
    // }
    // console.log("heading back out of expr");
    // return;
}

function parseIntExpr() {
    putMessage("PARSER - parseIntExpr()");

    // Not sure what to do here as of right now b/c
    // returning to parseExpr() will crash the parser
    // parseExpr();

    return;
    // nextToken();
    // // Handle <IntExpr>
    // putMessage("-parseIntExpr()");
    // if (thisToken.tokenId == "T_INTOP") {
    //     // Move back to expr - expecting another
    //     parseExpr();
    // }
    // else{
    //     // nextToken();
    //     (console.log("found a digit"));
    //     return;
    // }
    // // We're done here
}

function parseStringExpr() {
    // nextToken();
    // // Handle <StringExpr>
    // putMessage("-parseStringExpr()");
    // if (thisToken.tokenId == "T_CHAR") {
    //     // Jump to CharList
    //     parseCharList();
    // }
}

function parseCharList() {
    // putMessage("-parseCharList()");
    // if (thisToken.tokenId == "T_CHAR") {
    //     // This function must recursively call itself.
    //     nextToken();
    //     parseCharList();
    // }
    // if (thisToken.tokenId == "T_CLOSEQUOTE") {
    //     // Need to make sure we don't give an error for closing the string
    //     return;
    // }
}

function parseId() {

}

function booleanExpr() {

}

function match(expectedType) {
    // if (currentToken != expectedType) {
    //     // Ultimately, parsing failure will occur.
    //     expectedFound = false;
    // }
}

function parseEOP() {
    putMessage("PARSER - parseEOP()");
    if (parseErrors > 0) {
        putMessage("PARSER - Parsing failed with " + parseErrors + " errors and " + parseWarnings + " warnings.");
    }
    else {
        putMessage("PARSER - Parsing completed with " + parseErrors + " errors and " + parseWarnings + " warnings.");
    }
    return;
}

function resetAll() {
    parseErrors = 0;

    parseWarnings = 0;

    expectedType = "";

    expectedFound = false;

    sequenceIndex = 0;

    thisToken;
    thisToken = tokenSequence[sequenceIndex];

    blockLevel = 0;

    printActive = false;

    stringActive = false;
}