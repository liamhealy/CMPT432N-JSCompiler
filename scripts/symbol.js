/*
*   symbol.js
*   Contains a constructor function for generating symbols
*   Also contains all other functions related to symbols
*/
function symbol (symbolType, symbolId, symbolValue, symbolLine, symbolCol, symbolScope, isInit, isUsed) {
    this.symbolType = symbolType;
    this.symbolId = symbolId;
    this.symbolValue = symbolValue;
    this.symbolLine = symbolLine;
    this.symbolCol = symbolCol;
    this.symbolScope = symbolScope;
    this.isInit = isInit;
    this.isUsed = isUsed;
}

// We can add our token to the toke sequence
function addSymbol (symbolType, symbolId, symbolValue, symbolLine, symbolCol, symbolScope, isInit, isUsed) {
    // Create a token to enter into the token sequence
    var newSymbol = new token(symbolType, symbolId, symbolValue, symbolLine, symbolCol, symbolScope, isInit, isUsed);
    // Add our new token
    symbolSequence.push(newSymbol);
}

// Check if a symbol is initialized
function checkInit(tempId) {
    var i = 0;
    var tempSymbol = symbolSequence[i];
    while (i < symbolSequence.length) {
        tempSymbol = symbolSequence[i];
        if (tempSymbol.symbolId == tempId) {
            return true;
        }
        else {
            i++;
        }
    }
    return false;
}

function checkUsed() {
    return this.isUsed;
}