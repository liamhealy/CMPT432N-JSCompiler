// parser.js -- where parsing and tree creation will take place

var expectedType = "";

function getToken() {
    currentToken = tokenSequence[0];
}

function parseStart() {

}

function parseValue() {

}

function parseExpr() {

}

function parseValues() {

}

function match(expectedType) {
    if (currentToken != expectedType) {
        // Ultimately, parsing failure wil occur.
    }
}