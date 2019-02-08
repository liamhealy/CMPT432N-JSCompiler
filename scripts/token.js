// This function allows us to create usable tokens
function token (tokenId, value, line, col) {
    this.id = tokenId;
    this.val = value;
    this.line = line;
    this.column = col;
}

function tokenToString () {
    for (var i = 0; i < tokens.length; i++) {
        var tempId = token.tokenId;
        var tempVal = token.value;
        var tempLine = token.line;
        var tempCol = token.col;
        listToken = "" + tempId + ", " + tempVal + ", " + tempLine + ", " + tempCol + "";
        return listToken;
    }
}