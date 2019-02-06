// This function allows us to create usable tokens
function createToken(token, line, col) {
    this.token = token;
    this.line = line;
    this.col = col;
}