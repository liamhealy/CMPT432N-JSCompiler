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
var semSequenceIndex = 0;

function nextSemToken() {
   // Move to the next token
   semSequenceIndex = semSequenceIndex + 1;

   thisToken = tokenSequence[semSequenceIndex];
}

// Need to keep track of the scope
var scopeLevel = 0;

function analysis() {
   thisToken = tokenSequence[semSequenceIndex];

   putMessage("\nSEMANTIC ANALYSIS - Analyzing program " + programCount + " " + thisToken.tokenId + " " + semSequenceIndex);
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

   if (verbose == true) {
      putMessage("SEMANTIC ANALYSIS - Analyzing <Block>");
   }
   
   if (thisToken.tokenId == "T_LBRACE") {
      // Don't display in the AST, just move on.   
      scopeLevel++;

      ast.addNode("Block", "branch");
      
      nextSemToken();
   }

   // We'll have to move to StatementList from here
   analyzeStmtList();

   if (thisToken.tokenId == "T_RBRACE") {
      // Don't display in the AST, just move on.
      scopeLevel--;

      nextSemToken();
   }

   ast.endChildren();
}

function analyzeStmtList() {
   // Here is where we will continue from analyzeBlock()
   // Might look familiar as it is somewhat similar to parseStmtList()

   if (verbose == true) {
      putMessage("SEMANTIC ANALYSIS - Analyzing <StatementList>");
   }
   
   if (thisToken.tokenId == "T_RBRACE") {
      // We would end up returning to analyzeBlock() here
      // Not sure whether any expression is necessary
  }

  if (thisToken.tokenId == "T_PRINTSTMT" || thisToken.tokenId == "T_ID" ||
      thisToken.tokenId == "T_TYPE" || thisToken.tokenId == "T_WHILE" ||
      thisToken.tokenId == "T_IF" || thisToken.tokenId == "T_LBRACE") {
      
      // Move to analyzeStmt
      analyzeStmt();
  }
}

function analyzeStmt() {
   
   if (verbose == true) {
      putMessage("SEMANTIC ANALYSIS - Analyzing <Statement>");
   }
    
   // <PrintStatement>
   if (thisToken.tokenId == "T_PRINTSTMT") {
      analyzePrint();
   }
   // <AssignmentStatement>
   if (thisToken.tokenId == "T_ID") {
      analyzeId();
   }
   // <VarDecl>
   if (thisToken.tokenId == "T_TYPE") {
      analyzeType();
   }
   // <WhileStatement>
   if (thisToken.tokenId == "T_WHILE") {
      analyzeWhile();
   }
   // <IfStatement>
   if (thisToken.tokenId == "T_IF") {
      analyzeIf();
   }
   // <Block>
   if (thisToken.tokenId == "T_LBRACE") {
      // Move back to analyzeBlock();
      analyzeBlock();
   }
}

function analyzePrint() {

   if (verbose == true) {
      putMessage("SEMANTIC ANALYSIS - Analyzing <PrintStatement>");
   }

   // Add this as a branch to the AST
   ast.addNode("PrintStatement", "branch");

   // Move to the left parenthesis
   nextSemToken();
   if (thisToken.tokenId == "T_LPARENTHESES") {
      // Move to the expression or right parenthesis
      nextSemToken();

      // Expression analysis will be here.
   }

   ast.endChildren();
}

function analyzeId() {

}

function analyzeType() {

}

function analyzeWhile() {

}

function analyzeIf() {

}

function analyzeExpr() {
   
}

