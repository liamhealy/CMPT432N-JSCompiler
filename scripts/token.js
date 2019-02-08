// This function allows us to create usable tokens
function token (tokenId, value, line, col) {
    this.tokenId = tokenId;
    this.value = value;
    this.line = line;
    this.col = col;
}

// We can add our token to the toke sequence
function addToken (tokenId, value, line, col) {
    // Create a token to enter into the token sequence
    var newToken = new token(tokenId, value, line, col);
    // Add our new token
    tokenSequence.push(newToken);
}

// We can print our token sequence
function printSequence () {
    for (var i = 0; i < tokenSequence.length; i++) {
        // return this.tokenId + ", " + this.value + ", " + this.line + ", " + this.col;
        if (i == tokenSequence.length - 1) {
            putMessage("[" + tokenToString(tokenSequence[i]) + "]\n");
        }
        else {
            putMessage("[" + tokenToString(tokenSequence[i]) + "],\n");
        }
    }
}

// Doesn't seem like this function should really exist.
// Won't comment out yet in case we wanna style how 
// the token sequence appears.
function tokenToString (tempToken) {
    var tempId = tempToken.tokenId;
    var tempVal = tempToken.value;
    var tempLine = tempToken.line;
    var tempCol = tempToken.col;
    var listToken = tempId + ", " + tempVal + ", " + tempLine + ", " + tempCol;
    return listToken;
}