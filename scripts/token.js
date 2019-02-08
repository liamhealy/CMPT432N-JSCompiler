// This function allows us to create usable tokens
function token(tokenId, value, line, col) {
    this.tokenId = tokenId;
    this.value = value;
    this.line = line;
    this.col = col;
}