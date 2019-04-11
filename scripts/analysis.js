/**
 * analysis.js - where semantic analysis and
 * ast creation will take place.
 * symbol table creation may be here as well,
 * will update when I decide.
 */

// Some functions/variables will just reused from parser.js
// because they would be the same here anyway...

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

// Need to keep track of the scope
var scopeLevel = 0;

function analysis() {
   thisToken = tokenSequence[0];

   putMessage("\nSEMANTIC ANALYSIS - Analyzing program " + programCount + " " + thisToken.tokenId);
   ast.addNode("Program", "branch");

   // We wouldn't be here if parse failed so lets
   // just jump right to the first block
   analyzeBlock();

   if (thisToken.tokenId == "EOP") {
      // Output feedback
      if (semErrors == 0) {
         putMessage("SEMANTIC ANALYSIS - Analysis finished with " + semErrors + " errors and " + semWarnings + " warnings.");
      }
      else {
         putMessage("SEMANTIC ANALYSIS - Analysis finished with " + semErrors + " error(s) and " + semWarnings + " warnings");
      }
   }
}

// Non-terminals and terminals will be handled down here

function analyzeBlock() {

   if (thisToken.tokenId == "T_LBRACE") {
      // Don't display in the AST, just move on.   
      scopeLevel++;

      ast.addNode("Block", "branch");
   }

   // We'll have to move to StatementList from here

   if (thisToken.tokenId == "T_RBRACE") {
      // Don't display in the AST, just move on.
      scopeLevel--;
   }

   ast.endChildren();
}
