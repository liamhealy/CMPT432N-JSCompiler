/*
*   symbol.js
*   Contains a constructor function for generating symbols
*   Also contains all other functions related to symbols
*/
function symbol (symbolType, symbolId, symbolValue, symbolLine, symbolCol, symbolScope) {
    this.symbolType = symbolType;
    this.symbolId = symbolId;
    this.symbolValue = symbolValue;
    this.symbolLine = symbolLine;
    this.symbolCol = symbolCol;
    this.symbolScope = symbolScope;
}

// We can add our token to the toke sequence
function addSymbol (symbolType, symbolId, symbolValue, symbolLine, symbolCol, symbolScope) {
    // Create a token to enter into the token sequence
    var newSymbol = new token(symbolType, symbolId, symbolValue, symbolLine, symbolCol, symbolScope);
    // Add our new token
    tokenSequence.push(newSymbol);
}