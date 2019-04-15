//
// symbol.js
//
// This file holds the constructor function
// needed for the generation and storage of
// symbols in the scope tree

function symbol (symbolId, symbolType, symbolValue, symbolLine, symbolCol, programNum, symbolScope, isInit, isUsed) {
    this.symbolId = symbolId;
    this.symbolType = symbolType;
    this.symbolValue = symbolValue;
    this.symbolLine = symbolLine;
    this.symbolCol = symbolCol;
    this.programNum = programNum;
    this.symbolScope = symbolScope;
    this.isInit = isInit;
    this.isUsed = isUsed;
}

// We can add our symbol to the map from analyzer.js
// function addSymbol (symbolType, symbolId, symbolLine, symbolCol, symbolScope, isInit, isUsed) {
//     // Create a token to enter into the token sequence
//     var newSymbol = new symbol(symbolType, symbolId, symbolLine, symbolCol, symbolScope, isInit, isUsed);
//     // Add our new token
//     .push(newSymbol);
// }

// Check if a symbol is being redeclared
function checkIfRedeclared(tempTree, tempId, tempScope) {
    var i = 0;
    var tempSymbol = tempTree.cur.symbolMap[i];
    while (i < tempTree.cur.symbolMap.length) {
        tempSymbol = tempTree.cur.symbolMap[i];
        if (tempSymbol.symbolId == tempId && tempSymbol.symbolScope == tempScope) {
            return true;
        }
        else {
            i++;
        }
    }
    return false;
}

// function checkIfInit(tempId, tempScope) {
//     var i = 0;
//     var tempSymbol = symbolSequence[i];
//     while (i < symbolSequence.length) {
//         tempSymbol = symbolSequence[i];
//         if (tempSymbol.symbolId == tempId) {
//             if (tempSymbol.symbolScope > tempScope) {
//                 return false;
//             }
//         }
//         else {
//             i++;
//         }
//     }
//     return false;
// }

// function checkUsed() {
//     return this.isUsed;
// }