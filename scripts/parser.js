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
        putMessage("Finished parsing.");
    }
    if (sequenceIndex == 0) {
        putMessage("-parseStart()");
        thisToken = tokenSequence[sequenceIndex];
    }
    if (thisToken.tokenId == "T_LBRACE" || thisToken.tokenId == "T_RBRACE") {
        parseBlock();
    }
    if (thisToken.tokenId == "EOP" && blockLevel == 0) {
        parseEOP();
    }
    // If the Block(s) are never closed, we have a parse error:
    if (thisToken.tokenId == "EOP" && blockLevel > 0) {
        putMessage("-parse failure, unexpected token found");
    }
    // parseStart() only accepts <Block> or '$', anything else = parse error.
    else {
        putMessage("-parse failure, unexpected token found");
        parseError++;
    }
}

function parseBlock() {
    // Handle left brace
    if (thisToken.tokenId == "T_LBRACE") {
        putMessage("-parseBlock()");
        blockLevel++;
        nextToken();
        // Opening brace can lead to StmtList or another opening brace.
        parseStmtList();
    }

    // Handle right brace
    if (thisToken.tokenId == "T_RBRACE") {
        putMessage("-parseBlock()");
        blockLevel--;
        nextToken();
        // Same idea shown above in left brace if-stmt
        parseStmtList();
    }

}

function parseExpr() {
    // Must handle '(' -> <expr> from PrintStatement
    // '(' is a terminal term
    putMessage("-parseExpr()");
    if (thisToken.tokenId == "T_DIGIT") {
        // Going to need to call a separate intExpr() function here
        nextToken();
        parseIntExpr();
    }
    if (thisToken.tokenId == "T_OPENQUOTE") {
        // Going to need to call a separate stringExpr() function here
        nextToken();
        parseStringExpr();
    }
    if (thisToken.tokenId == "T_ID") {
        // Going to need to call a separate foundId() function here
    }
    if (thisToken.tokenId == "T_BOOLVAL") {
        // Going to need to do something else here
    }
    // How do we handle booleans?
}

function parseIntExpr() {
    // Handle <IntExpr>
    putMessage("-parseIntExpr()");
    if (thisToken.tokenId == "T_INTOP") {
        // Move back to expr - expecting another
        parseExpr();
    }
    // We're done here
}

function parseStringExpr() {
    // Handle <StringExpr>
    putMessage("-parseStringExpr()");
    if (thisToken.tokenId == "T_CHAR") {
        // Jump to CharList
        parseCharList();
    }
}

function parseCharList() {
    putMessage("-parseCharList()");
    if (thisToken.tokenId == "T_CHAR") {
        // This function must recursively call itself.
    }
}

function parseId() {

}

function booleanExpr() {

}

function parseValues() {

}

function parseStmtList() {
    putMessage("-parseStmtList()")
    // Handle Statement
    if (thisToken.tokenId == "T_PRINTSTMT" || thisToken.tokenId == "T_ID" ||
        thisToken.tokenId == "T_TYPE" || thisToken.tokenId == "T_WHILE" ||
        thisToken.tokenId == "T_IF" || thisToken.tokenId == "T_LBRACE" ||
        thisToken.tokenId == "T_RBRACE") {
        
        parseStatement();
    }
    if (thisToken.tokenId == "EOP") {
        parseEOP();
    }
    else {
        // Do nothing for now...
    }
}

function parseStatement() {
    putMessage("-parseStatement()");
    
    // <PrintStatement>
    if (thisToken.tokenId == "T_PRINTSTMT") {
        nextToken();
        parsePrintStmt();
    }
    // <AssignmentStatement>
    if (thisToken.tokenId == "T_ID") {
        nextToken();
        parseAssignmentStmt();
    }
    // <VarDecl>
    if (thisToken.tokenId == "T_TYPE") {
        nextToken();
        parseVarDecl();
    }
    // <WhileStatement>
    if (thisToken.tokenId == "T_WHILE") {
        nextToken();
        parseWhileStmt();
    }
    // <IfStatement>
    if (thisToken.tokenId == "T_IF") {
        nextToken();
        parseIfStmt();
    }
    // <Block>
    if (thisToken.tokenId == "T_LBRACE" || thisToken.tokenId == "T_RBRACE") {
        // Bring the parser back to parseBlock()
        parseBlock();
    }
}

function parsePrintStmt() {
    // Handle PrintStatement
    putMessage("-parsePrintStmt()");
    if (thisToken.tokenId == "T_LPARENTHESES" && printActive == false) {
        printActive = true;
        // Jump to left paren. function
        leftParen();
    }

}

function leftParen() {
    // Handle left parentheses where necessary
    if (printActive == true) {
        // Jump to the next token and move to parseExpr()
        nextToken();
        parseExpr();
    }
}

function parseAssignmentStmt() {

}

function parseVarDecl() {

}

function parseWhileStmt() {

}

function parseIfStmt() {

}

function match(expectedType) {
    if (currentToken != expectedType) {
        // Ultimately, parsing failure will occur.
        expectedFound = false;
    }
}

function parseEOP() {
    putMessage("-parseEOP()");
    if (parseErrors > 0) {
        putMessage("Parsing failed with " + parseErrors + " errors and " + parseWarnings + " warnings.");
        sequenceIndex = 0;
    }
    else {
        putMessage("Parsing completed with " + parseErrors + " errors and " + parseWarnings + " warnings.");
        sequenceIndex = 0;
    }
}