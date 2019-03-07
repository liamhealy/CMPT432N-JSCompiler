// parser.js -- where parsing and tree creation will take place

var parseErrors = 0;

var parseWarnings = 0;

var expectedType = "";

var expectedFound = false;

var sequenceIndex = 0;

var thisToken;
thisToken = tokenSequence[sequenceIndex];

var blockLevel = 0;

// function getToken() {
//     currentToken = tokenSequence[sequenceIndex];
// }

function nextToken() {
    // Move to the next token
    sequenceIndex = sequenceIndex + 1;
    thisToken = tokenSequence[sequenceIndex];
}

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
    // Left brace
    if (thisToken.tokenId == "T_LBRACE") {
        putMessage("-parseBlock()");
        blockLevel++;
        nextToken();
        // Opening brace can lead to StmtList or another opening brace.
        parseStmtList();
    }

    // Right brace
    if (thisToken.tokenId == "T_RBRACE") {
        putMessage("-parseBlock()");
        blockLevel--;
        nextToken();
        // Same idea shown above in left brace if-stmt
        parseStmtList();
    }

}

function parseExpr() {

}

function parseValues() {

}

function parseStmtList() {
    putMessage("-parseStmtList()")
    if (thisToken.tokenId == "T_LBRACE" || thisToken.tokenId == "T_RBRACE") {
        // Let parseBlock() handle the braces
        parseBlock();
    }
    if (thisToken.tokenId == "EOP") {
        parseEOP();
    }
    else {
        // Do nothing for now...
    }
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