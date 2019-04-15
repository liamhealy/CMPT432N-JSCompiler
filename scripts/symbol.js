/*
*   symbol.js
*   Contains a constructor function for generating symbols
*   Also contains all other functions related to symbols
*/
function symbol (symbolType, symbolId, symbolLine, symbolCol, symbolScope, isInit, isUsed) {
    // int, string or boolean
    this.symbolType = symbolType;
    // the symbol's id
    this.symbolId = symbolId;
    
    this.symbolLine = symbolLine;
    this.symbolCol = symbolCol;
    this.symbolScope = symbolScope;
    this.isInit = isInit;
    this.isUsed = isUsed;
}

// We can add our token to the toke sequence
function addSymbol (symbolType, symbolId, symbolLine, symbolCol, symbolScope, isInit, isUsed) {
    // Create a token to enter into the token sequence
    var newSymbol = new symbol(symbolType, symbolId, symbolLine, symbolCol, symbolScope, isInit, isUsed);
    // Add our new token
    symbolSequence.push(newSymbol);
}

// Check if a symbol is being redeclared
function checkIfRedeclared(tempId, tempScope) {
    var i = 0;
    var tempSymbol = symbolSequence[i];
    while (i < symbolSequence.length) {
        tempSymbol = symbolSequence[i];
        if (tempSymbol.symbolId == tempId && tempSymbol.symbolScope == tempScope) {
            return true;
        }
        else {
            i++;
        }
    }
    return false;
}

function checkIfInit(tempId, tempScope) {
    var i = 0;
    var tempSymbol = symbolSequence[i];
    while (i < symbolSequence.length) {
        tempSymbol = symbolSequence[i];
        if (tempSymbol.symbolId == tempId) {
            if (tempSymbol.symbolScope > tempScope) {
                return false;
            }
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