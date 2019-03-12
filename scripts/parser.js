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

var booleanActive = false;

var programEnded = false;  

var cst = new Tree();

cst.addNode("Root", "branch");

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
    // Do we need this if we aren't calling this to finish?
    if (tokenSequence.length == 0) {
        if (verbose == true) {
            putMessage("PARSER - parsing finished");
        }
        return;
    }

    if (verbose == true) {
        putMessage("PARSER - parseStart()");
    }

    thisToken = tokenSequence[sequenceIndex];

    if (thisToken.tokenId == "T_LBRACE") {
        // Initiate the CST and move to <Block>
        cst.addNode("Program", "branch");
        parseBlock();
    }
    else {
        if (thisToken.tokenId == "EOP") {
            if (verbose == true) {
                putMessage("PARSER - ERROR - unexpected token [ " + thisToken.value + " ] at (" + thisToken.line + ", " + thisToken.col + ")");
            }
            parseErrors++;
            parseEOP();
        }
        else {
            if (verbose == true) {
                putMessage("PARSER - ERROR - unexpected token [ " + thisToken.value + " ] at (" + thisToken.line + ", " + thisToken.col + ")");
            }
            parseErrors++;
        }
        // if (verbose == true) {
        //     putMessage("PARSER - ERROR - unexpected token [ " + thisToken.value + " ]");
        // }
        // parseErrors++;
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
    if (verbose == true) {
        putMessage("PARSER - parseBlock()");
    }

    if (thisToken.tokenId == "T_LBRACE") {
        // create new branch
        cst.addNode("Block", "branch");
        
        blockLevel++;
        
        // display that we found a '{'
        cst.addNode(thisToken.value, "leaf");
        
        nextToken();
        
        // Jump to StatementList
        parseStmtList();
    }
    
    if (thisToken.tokenId == "T_RBRACE") {
        // Display this on the CST and move backwards
        cst.addNode(thisToken.value, "leaf");
        cst.endChildren();
        
        blockLevel--;
        
        nextToken();
        // cst.addNode(thisToken.value, "leaf");
        
        // cst.endChildren();
        
        // blockLevel--;
        
        
        // nextToken();
        // Don't move downward from here
        // Have to somehow return from here if blockLevel = 0
        if (thisToken.tokenId == "EOP" && blockLevel > 0) {
            parseStmtList();
            // console.log("error line 107");
            // if (verbose == true) {
            //     putMessage("PARSER - ERROR - unexpected token [ " + thisToken.value + " ]");
            // }
            // parseErrors++;
        }
        else if (thisToken.tokenId == "EOP" && blockLevel == 0) {
            parseEOP();
        }
        else {
            // Move back one branch and jump to <StatementList>
            cst.endChildren();
            cst.endChildren();
            parseStmtList();
        }
        
        // returning from here is most likely safe
        return;
    }
    // else if (blockLevel == 0) {
    //     if (verbose == true) {
    //         putMessage("PARSER - ERROR - unexpected token [ " + thisToken.value + " ], expecting [ $ ]");
    //     }
    //     parseErrors++;
    //     return;
    // }
    else {
        if (programEnded == false) {
            // Handle this error in StatementList to prevent it from repeating in output
            parseStmtList();
        }
        // if (verbose == true && programEnded == false) {
        //     console.log("Error line 130");
        //     putMessage("PARSER - ERROR - unexpected token [ " + thisToken.value + " ]");
        // }
        // parseErrors++;
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
    if (verbose == true) {
        putMessage("PARSER - parseStmtList()");
    }

    cst.addNode("StatementList", "branch");

    // Check token obtained from parseBlock()
    if (thisToken.tokenId == "T_RBRACE") {
        cst.endChildren();
        parseBlock();
    }

    if (thisToken.tokenId == "T_PRINTSTMT" || thisToken.tokenId == "T_ID" ||
        thisToken.tokenId == "T_TYPE" || thisToken.tokenId == "T_WHILE" || 
        thisToken.tokenId == "T_IF" || thisToken.tokenId == "T_LBRACE") {
        
        parseStatement();
        while (thisToken.tokenId != "EOP") {
            // Must call nextToken() from here so that
            // we aren't jumping from token to token
            // in random spots in different functions
            nextToken();
            parseStmtList();
        }
    }
    else if(programEnded == true) {
        return;
    }
    else {
        if (verbose == true && programEnded == false) {
            console.log("Error at 184");
            putMessage("PARSER - ERROR - unexpected token [ " + thisToken.value + " ] at (" + thisToken.line + ", " + thisToken.col + "), expecting [ { ], [ } ] or some Statement");
        }
        parseErrors++;
        if (thisToken.tokenId == "EOP") {
            parseEOP();
        }
        return;
    }
    cst.endChildren();
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
    cst.addNode("Statement", "branch");
    if (verbose == true) {
        putMessage("PARSER - parseStatement()");
    }
    
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
    if (thisToken.tokenId == "T_LBRACE") {
        // Move back to parseBlock()
        if (blockLevel == 0) {
            if (verbose == true) {
                putMessage("PARSER - ERROR - unexpected token [ " + thisToken.value + " ] at (" + thisToken.line + ", " + thisToken.col + "), expecting [ $ ]");
            }
            parseErrors++;
        }
        else {
            parseBlock();
        }
    }
    if (thisToken.tokenId == "T_RBRACE") {
        // Move back to parseBlock()
        if (blockLevel == 0) {
            if (verbose == true) {
                putMessage("PARSER - ERROR - unexpected token [ " + thisToken.value + " ] at (" + thisToken.line + ", " + thisToken.col + "), expecting [ $ ]");
            }
            parseErrors++;
        }
        else {
            cst.endChildren();
            parseBlock();
        }
    }
    cst.endChildren();
    cst.endChildren();
    return;
}

// Begin handling <PrintStatement>
function parsePrintStmt() {
    // 1
    cst.addNode("PrintStatement", "branch");
    if (verbose == true) {
        putMessage("PARSER - parsePrintStmt()");
    }
    // cst.addNode(thisToken.value, "leaf");

    // To let the parser know we are in <PrintStatement>
    printActive = true;

    nextToken();

    // We need a left parentheses or we have an error:
    if (thisToken.tokenId == "T_LPARENTHESES") {
        checkLeftParen();
    }
    else {
        if (verbose == true) {
            putMessage("PARSER - ERROR - unexpected token [ " + thisToken.value + " ] at (" + thisToken.line + ", " + thisToken.col + "), expecting [ ( ]");
        }
        parseErrors++;
    }
    // 1
    cst.endChildren();
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
    // Display that we found a '('
    cst.addNode(thisToken.value, "leaf");
    // Check if we are printing:
    if (printActive == true) {
        // Look for an expr in parseExpr()
        // Something must be between '(' and ')'
        nextToken();
        parseExpr();
        // Move on
        // nextToken();
        // checkRightParen();
    }
    else if (booleanActive == true) {
        // Check for an expr
        nextToken();
        parseExpr();

        // If we get an expr, move on to look for boolop
        nextToken();
        if (thisToken.tokenId == "T_BOOLOP") {
            // If we get a boolop, add it and move on to look for a trailing expr
            cst.addNode(thisToken.value, "leaf");
            nextToken();
            parseExpr();
        }
    }
    else {
        if (verbose == true) {
            putMessage("PARSER - ERROR - unexpected token [ " + thisToken.value + " ] at (" + thisToken.line + ", " + thisToken.col + "), expecting <PrintStatement> or <BooleanExpr>");
        }
        parseErrors++;
    }
    nextToken();
    checkRightParen();
    // 1
    // cst.endChildren();
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
    if (thisToken.tokenId == "T_RPARENTHESES") {
        // 2
        cst.addNode(thisToken.value, "leaf");
        // Leave the print statement
        printActive = false;
        // Display that we found a ')'
        return;
    }
    else {
        console.log("error 371");
        if (verbose == true) {
            putMessage("PARSER - ERROR - unexpected token [ " + thisToken.value + " ] at (" + thisToken.line + ", " + thisToken.col + "), expecting [ ) ]");
        }
        parseErrors++;
    }
    // 1
    return;
}

function parseAssignmentStmt() {
    // Alert that we are in an <AssignmentStatement> and add to CST
    cst.addNode("AssignmentStatement", "branch");
    if (verbose == true) {
        putMessage("PARSER - parseAssignmentStmt()");
    }
    cst.addNode(thisToken.value, "leaf");

    nextToken();

    // We need an assignment operator or we have an error:
    if (thisToken.tokenId == "T_ASSIGNOP") {
        cst.addNode(thisToken.value, "leaf");
        nextToken();
        parseExpr();
    }
    else {
        if (verbose == true) {
            putMessage("PARSER - ERROR - unexpected token [ " + thisToken.value + " ] at (" + thisToken.line + ", " + thisToken.col + "), expecting [ = ]");
        }
        parseErrors++;
    }
    // 1
    cst.endChildren();
    return;
}

function parseVarDecl() {
    // Alert that we are in a VarDecl and add to CST
    cst.addNode("VarDecl", "branch");
    if (verbose == true) {
        putMessage("PARSER - parseVarDecl()");
    }
    cst.addNode(thisToken.value, "leaf");

    nextToken();

    // We need an Id or we have an error:
    if (thisToken.tokenId == "T_ID") {
        parseExpr();
    }
    else {
        if (verbose == true) {
            putMessage("PARSER - ERROR - unexpected token [ " + thisToken.value + " ] at (" + thisToken.line + ", " + thisToken.col + "), expecting an ID");
        }
        parseErrors++;
    }
    // 1
    cst.endChildren();
    return;
}

function parseWhileStmt() {
    // Alert that we are in <WhileStatement> and add to CST
    cst.addNode("WhileStatement", "branch");
    if (verbose == true) {
        putMessage("PARSER - parseWhileStmt()");
    }
    cst.addNode(thisToken.value, "leaf");

    nextToken();

    // We need a BooleanExpr or we have an error:
    if (thisToken.tokenId == "T_LPARENTHESES" || thisToken.tokenId == "T_BOOLVAL") {
        parseExpr();
    }
    else {
        if (verbose == true) {
            putMessage("PARSER - ERROR - unexpected token [ " + thisToken.value + " ] at (" + thisToken.line + ", " + thisToken.col + "), expecting [ ( ] or a boolean value");
        }
        parseErrors++;
    }
    // 1
    cst.endChildren();
    return;
}

function parseIfStmt() {
    // Alert that we are in an <IfStatement> and add to CST
    cst.addNode("IfStatement", "branch");
    if (verbose == true) {
        putMessage("PARSER - parseIfStmt()");
    }
    cst.addNode(thisToken.value, "leaf");

    nextToken();

    // We need a BooleanExpr or we have an error:
    if (thisToken.tokenId == "T_LPARENTHESES" || thisToken.tokenId == "T_BOOLVAL") {
        parseExpr();
    }
    else {
        if (verbose == true) {
            putMessage("PARSER - ERROR - unexpected token [ " + thisToken.value + " ] at (" + thisToken.line + ", " + thisToken.col + "), expecting [ ( ] or a boolean value");
        }
        parseErrors++;
    }
    // 1
    cst.endChildren();
    return;
}

function parseExpr() {
    // 2
    cst.addNode("Expr", "branch");
    
    if (verbose == true) {
        putMessage("PARSER - parseExpr()");
    }

    if (thisToken.tokenId == "T_DIGIT") {
        parseIntExpr();
    }
    else if (thisToken.tokenId == "T_OPENQUOTE") {
        parseStringExpr();
    }
    else if (thisToken.tokenId == "T_LPARENTHESES") {
        parseBooleanExpr();
    }
    else if (thisToken.tokenId == "T_BOOLVAL") {
        parseBooleanExpr();
    }
    else if (thisToken.tokenId == "T_ID") {
        parseId();
    }
    else {
        //return;
        if (verbose == true) {
            putMessage("PARSER - ERROR - unexpected token [ " + thisToken.value + " ] at (" + thisToken.line + ", " + thisToken.col + "), expecting a valid expression");
        }
        parseErrors++;
    }
    // // if (thisToken.value == "\"") {
    //     // Do nothing
    //     parsePrintStmt();
    // }
    // if (thisToken.value == " ") {
    //     // Do nothing
    //     parsePrintStmt();
    // }
    // 2
    cst.endChildren();
    console.log("returning");
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
    // 3
    cst.addNode("IntExpr", "branch");
    // 4
    cst.addNode(thisToken.value, "leaf");
    
    if (verbose == true) {
        putMessage("PARSER - parseIntExpr()");
    }

    // Not sure what to do here as of right now
    if (tokenSequence[sequenceIndex + 1].tokenId == "T_INTOP") {
        // Move to the int operator and store it in CST
        nextToken();

        cst.addNode(thisToken.value, "leaf");
        
        // Move on
        nextToken();
        // <Expr> expected, move back out
        parseExpr();
        // Not positive wether or not we back out from here...
        cst.endChildren();
        return;
    }
    else {
        // 3
        cst.endChildren();
        return;
    }
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
    cst.addNode("StringExpr", "branch");
    // 4

    if (verbose == true) {
        putMessage("PARSER - parseStringExpr()");
    }

    // Check if we have T_OPENQUOTE vs. T_CLOSEQUOTE
    if (thisToken.tokenId == "T_OPENQUOTE") {
        // Display the current token on the CST
        cst.addNode(thisToken.value, "leaf");
        
        // Move to <CharList>
        cst.addNode("CharList", "branch");

        parseCharList();
    }
    if (thisToken.tokenId == "T_CLOSEQUOTE") {
        // display on CST
        cst.addNode(thisToken.value, "leaf");
        
        // Move back on the CST
        cst.endChildren();
    }
    // nextToken();
    // // Handle <StringExpr>
    // putMessage("-parseStringExpr()");
    // if (thisToken.tokenId == "T_CHAR") {
    //     // Jump to CharList
    //     parseCharList();
    // }

    // Move back on the CST
    cst.endChildren();

    return;
}

function parseCharList() {
    // Pretty sure if we leave this here its gonna mess the CST up
    // will test this shortly
    // cst.addNode("CharList", "branch");

    // Look at the next token
    nextToken();

    if (thisToken.tokenId == "T_CHAR") {
        // display the current token on the CST
        cst.addNode(thisToken.value, "leaf");

        // recursively call this function until we find the next quote
        parseCharList();
    }
    if (thisToken.tokenId == "T_CLOSEQUOTE") {
        // display the current token on the CST
        // this is also throwing off the CST
        // cst.addNode(thisToken.value, "leaf");
        
        // Move back out of CharList on the CST
        // Leaving too many endChildren() calls around, getting bad CST's...
        // cst.endChildren();
        // leave <CharList>
        return;
    }
    else {
        // Anything besides a T_CHAR and T_CLOSEQUOTE is an error
        if (verbose == true) {
            putMessage("PARSER - ERROR - unexpected token [ " + thisToken.value + " ] at (" + thisToken.line + ", " + thisToken.col + "), expecting a 'char' or [ \" ]");
        }
        parseErrors++;

    }
    return;
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
    // Id is fairly simple, we just add the nodes to the CST
    // and return immediately after
    cst.addNode("Id", "branch");
    cst.addNode(thisToken.value, "leaf");
    cst.endChildren();
    return;
}

function parseBooleanExpr() {
    cst.addNode("BooleanExpr", "branch");
    
    if (verbose == true) {
        putMessage("PARSER - parseBooleanExpr()");
    }

    if (thisToken.tokenId == "T_LPARENTHESES") {
        booleanActive = true;
        checkLeftParen();
    }
    if (thisToken.tokenId == "T_BOOLVAL") {
        cst.addNode(thisToken.value, "leaf");
    }
    else {
        if (verbose == true) {
            putMessage("PARSER - ERROR - unexpected token [ " + thisToken.value + " ] at (" + thisToken.line + ", " + thisToken.col + "), expecting [ ( ] or boolean value");
        }
        parseErrors++;
    }
    // if (tokenSequence[sequenceIndex + 1].tokenId == "T_BOOLOP") {
    //     nextToken();
    //     cst.addNode(thisToken.value);
    //     nextToken();
    //     parseExpr();
    // }
    cst.endChildren();
    return;
}

function match(expectedType) {
    // if (thisToken.tokenId != expectedType) {
    //     // Ultimately, parsing failure will occur.
    //     expectedFound = false;
    // }
}

function parseEOP() {
    cst.addNode(thisToken.value, "leaf");

    if (verbose == true) {
        putMessage("PARSER - parseEOP()");
    }
    programEnded = true;

    if (parseErrors > 0) {
        if (parseErrors > 1) {
            putMessage("PARSER - Parse failed with " + parseErrors + " errors");
            putMessage("\nNo CST displayed due to Parse errors");
        }
        else {
            putMessage("PARSER - Parse failed with " + parseErrors + " error");
            putMessage("\nNo CST displayed due to Parse error");
        }
    }
    else {
        putMessage("PARSER - Parsing completed successfully");
        putMessage("\nCST for program " + programCount + "\n" + cst.toString());
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

    booleanActive = false;

    programEnded = false;

    cst = new Tree();

    cst.addNode("Root", "branch");
}