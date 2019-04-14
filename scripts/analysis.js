/**
 * analysis.js - where semantic analysis and
 * ast creation will take place.
 * symbol table creation may be here as well,
 * will update when I decide.
 */

// Some functions/variables may just be reused from parser.js
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
   // Reset global variables used here
   resetVals();

   thisToken = tokenSequence[semSequenceIndex];

   putMessage("\nSEMANTIC ANALYSIS - Analyzing program " + programCount);
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

   ast.endChildren();
}

// Non-terminals and terminals will be handled down here

function analyzeBlock() {
   console.log(thisToken.tokenId);
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
   // as long as we dont see a right brace (})
   if (thisToken.tokenId != "T_RBRACE") {
      analyzeStmtList();
   }
   
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

      // Not sure if we call analyzeStmtList() again from here
      // or if it must be done somehow from analyzeStmt() without
      // exceeding maximum stack size...
      analyzeStmtList();
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
      analyzeAssignStmt();
   }
   // <VarDecl>
   if (thisToken.tokenId == "T_TYPE") {
      analyzeVarDecl();
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
      analyzeExpr();
   }

   if (thisToken.tokenId == "T_RPARENTHESES") {
      nextSemToken();
   }

   ast.endChildren();
}

function analyzeId() {
   // For now, just add the leaf node and move on
   ast.addNode(thisToken.value, "leaf");
   nextSemToken();
}

function analyzeAssignStmt() {

   if (verbose == true) {
      putMessage("SEMANTIC ANALYSIS - Analyzing <AssignmentStatement>");
   }

   ast.addNode("AssignmentStatement", "branch");
 
   if (thisToken.tokenId == "T_ID") {
      analyzeId();
   }

   if (thisToken.tokenId == "T_ASSIGNOP") {
      // Analyze the following expression
      nextSemToken();
      analyzeExpr();
   }

   ast.endChildren();

}

function analyzeVarDecl() {
   /* TODO:
   *  - check if the variable exists already
   *  - add as a new entry to the symbol table
   */

   if (verbose == true) {
      putMessage("SEMANTIC ANALYSIS - Analyzing <VarDecl>");
   }

   // Add a branch to the AST
   ast.addNode("VarDecl", "branch");

   // Analyze the type for the declaration
   if (thisToken.value == "int" || thisToken.value == "string" || thisToken.value == "boolean") {
      ast.addNode(thisToken.value, "leaf");
   }

   nextSemToken();

   if (thisToken.tokenId == "T_ID") {
      analyzeId();
   }

   ast.endChildren();

}

function analyzeWhile() {

   if (verbose == true) {
      putMessage("SEMANTIC ANALYSIS - Analyzing <WhileStatement>");
   }

   ast.addNode("WhileStatement", "branch");

   // Look for the parenthesis/boolean
   nextSemToken();

   if (thisToken.tokenId == "T_BOOLVAL" || thisToken.tokenId == "T_LPARENTHESES") {
      // analyze boolean
      analyzeBoolExpr();

      // when returning from analyzeBoolExpr(), look for brackets
      nextSemToken();

      analyzeBlock();
   }

   ast.endChildren();

}

function analyzeIf() {

   if (verbose == true) {
      putMessage("SEMANTIC ANALYSIS - Analyzing <IfStatement>");
   }

   ast.addNode("IfStatement", "branch");

   // Check the following tokens
   nextSemToken();

   // This is basically a combination of the 
   // two if-statements from analyzeExpr()
   if (thisToken.tokenId == "T_BOOLVAL" || thisToken.tokenId == "T_LPARENTHESES") {
      // Analyze the boolean expression and what follows
      // and then move to the new scope for the <IfStatement>
      analyzeBoolExpr();

      // nextSemToken();
      console.log(thisToken.value);
      analyzeBlock();

   }

   ast.endChildren();

}

// Branch out to different <Expr>'s
function analyzeExpr() {
   
   if (verbose == true) {
      putMessage("SEMANTIC ANALYSIS - Analyzing <Expr>");
   }

   // Digits
   if (thisToken.tokenId == "T_DIGIT") {
      // We'll change this to analyze an int
      analyzeInt();
   }

   // Opening quotes
   else if (thisToken.tokenId == "T_OPENQUOTE") {
      // We'll change this to analyze an opening quote
      analyzeStringExpr();
   }

   // A left parenthesis
   else if (thisToken.tokenId == "T_LPARENTHESES") {
      // Changed to analyze the expected boolean statement
      analyzeBoolExpr();
   }

   // Booleans
   else if (thisToken.tokenId == "T_BOOLVAL") {
      // We'll change this to analyze a boolean
      analyzeBoolExpr();
   }

   // ID
   else if (thisToken.tokenId == "T_ID") {
      // We'll change this to analyze an ID
      analyzeId();
   }
}

function analyzeInt() {

   if (verbose == true) {
      putMessage("SEMANTIC ANALYSIS - Analyzing <IntExpr>");
   }

   // Handle digits through analysizeId() for now
   analyzeId();

   if (thisToken.tokenId == "T_INTOP") {
      // Might need to do something else for addition...
      nextSemToken();

      // Move back to analyzeExpr() for the second <Expr> for addition
      analyzeExpr();
   }

}

function analyzeBoolExpr() {
   /*
   *  TODO:
   *  - Check the types of the two tokens in a token1 == token2 situation
   * 
   */
  console.log(thisToken.value);
   if (verbose == true) {
      putMessage("SEMANTIC ANALYSIS - Analyzing <BoolExpr>");
   }

   if (thisToken.tokenId == "T_LPARENTHESES") {
      // Analyze the following expression
      nextSemToken();
      analyzeExpr();
   }

   if (thisToken.tokenId == "T_ID" || thisToken.tokenId == "T_BOOLVAL") {
      // Move to analyzeId() so we can put it in the AST
      analyzeId();
   }

   // Check if we have a 
   if (thisToken.tokenId == "T_BOOLOP") {
      // Move to analyzeExpr() to check the following token
      // ast.addNode(thisToken.value, "branch");
      nextSemToken();
      analyzeExpr();
   }

   if (thisToken.tokenId == "T_RPARENTHESES") {
      nextSemToken();
   }

}

function analyzeStringExpr() {
   // We are gonna need a variable to hold the CharList
   var thisString = thisToken.value;

   if (verbose == true) {
      putMessage("SEMANTIC ANALYSIS - Analyzing <StringExpr>");
   }

   if (thisToken.tokenId == "T_OPENQUOTE") {
      // If coming from analyzeExpr(), move on and analyze <CharList>
      nextSemToken();

      // Maybe a while loop can be used to store the string?
      while(thisToken.tokenId != "T_CLOSEQUOTE") {
         if (thisToken.tokenId == "T_CHAR") {
            thisString += thisToken.value;
         }
         nextSemToken();
      }

      // nextSemToken();
      console.log(thisToken.value);

      if (thisToken.tokenId == "T_CLOSEQUOTE") {
         thisString += thisToken.value;
      }

   }

   ast.addNode(thisString, "leaf");
   nextSemToken();

   // Not sure if I am storing CharList efficiently and safely
}

// function analyzeLeftParen() {
//    nextSemToken();

//    ast.addNode("(", "branch");

//    if (thisToken.tokenId == "T_RPARENTHESES") {
//       nextSemToken();
//    }

//    ast.endChildren();
// }

function resetVals() {

   semErrors = 0;

   semWarnings = 0;

   ast = new Tree();

   ast.addNode("Root", "branch");

   semSequenceIndex = 0;

   scopeLevel = 0;
}
