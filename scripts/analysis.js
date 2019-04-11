/**
 * analysis.js - where semantic analysis and
 * ast creation will take place.
 * symbol table creation may be here as well,
 * will update when I decide.
 */


// Set up error and warning counters
var semErrors = 0;

var semWarnings = 0;

// Need to build an AST before a symbol table
var ast = new Tree();

ast.addNode("Root", "branch");

// Reset the sequence index and current token indicator
// using the variables from parser.js
sequenceIndex = 0;

thisToken = tokenSequence[sequenceIndex];

// Needed to keep track of the scope
var scopeLevel = 0;

function analysis() {
   putMessage("\nSemantic analysis + symbol table display will occur here...");

   ast.addNode("Program", "branch");
}

// Non-terminals and terminals will be handled down here

