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

// Need to build an AST and scope tree before a symbol table
var ast = new Tree();

ast.addNode("Root", "branch");

var scopeMap = new ScopeTree();

// Reset the sequence index and current token indicator
// using the variables from parser.js
var semSequenceIndex = 0;

function nextSemToken() {
   // Move to the next token
   semSequenceIndex = semSequenceIndex + 1;

   thisToken = tokenSequence[semSequenceIndex];
}

// Holds all generated symbols
var symbolSequence = [];

// Need to keep track of the scope
var scopeLevel = 0;

// Lets us know if we should be adding values together
var addition = false;

// Keep track of types and values for assignment statements
var tempFirstType = "";
var tempSecondType = "";
var tempFirstVal = null;
var tempSecondVal = null;

// Keep a variable ready to hold an id so we can
// set a symbol's value to it's own.
var setId;

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
         putMessage("SEMANTIC ANALYSIS - Analysis failed with " + semErrors + " error(s) and " + semWarnings + " warnings");
      }
   }

   ast.endChildren();
}

// Non-terminals and terminals will be handled down here

function analyzeBlock() {
   if (verbose == true) {
      putMessage("SEMANTIC ANALYSIS - Analyzing <Block>");
   }
   
   if (thisToken.tokenId == "T_LBRACE") {
      // Don't display in the AST, just move on.   
      scopeLevel++;

      scopeMap.addNode("Scope " + scopeLevel, "branch", scopeLevel);

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

// Check the type of the variable being analyzed
function checkType(tempNode, tempId) {
   if ((tempNode.parent != undefined || tempNode.parent != null) && tempNode.symbolMap.length > 0) {
      for (var i = 0; i < tempNode.symbolMap.length; i++) {
         if (tempId == tempNode.symbolMap[i].getId()) {
            return tempNode.symbolMap[i].getType();
         }
      }
   }
   if (tempNode.parent != undefined || tempNode.parent != null) {
      return checkType(tempNode.parent, tempId);
   }
}

// Check to see if a var exists within the effective
// range of its declaration
function checkParentScopes(tempNode, tempId) {
   if ((tempNode.parent != undefined || tempNode.parent != null) && tempNode.symbolMap.length > 0) {
      for (var i = 0; i < tempNode.symbolMap.length; i++) {
         if (tempId == tempNode.symbolMap[i].getId()) {
            return true;
         }
      }
   }
   if (tempNode.parent != undefined || tempNode.parent != null) {
      return checkParentScopes(tempNode.parent, tempId);
   }
   return false;
   // if (tempNode.symbolMap.length > 0) {
   //    for (var i = 0; i < tempNode.symbolMap.length; i++) {
   //       if (tempId == tempNode.symbolMap[i].getId()) {
   //          tempBool = true;
   //          break;
   //       }
   //    }
   // }

   // if (tempBool == false) {
   //    tempBool = checkParentScopes(tempNode, thisToken.value);
   //    console.log(checkParentScopes(tempNode, thisToken.value));
   //    console.log(tempBool);
   // }

   // if (tempNode.parent.symbolMap.length > 0) {
   //    for (var i = 0; i < tempNode.parent.symbolMap.length; i++) {
   //       console.log(tempNode.parent.symbolMap[i].getId());
   //       if (tempId === tempNode.parent.symbolMap[i].getId()) {
   //          console.log("time to return");
   //          tempBool = true;
   //          break;
   //       }
   //    }
   // }
   // // tempNode = tempNode.parent;
   // if (tempBool == true) {
   //    return tempBool;
   // }

   // if (tempNode.parent.name !== undefined || tempNode.parent !== null && tempBool != true) {
   //    checkParentScopes(tempNode.parent, tempId);
   // }
   // // else if (tempNode.cur.symbolMap.length > 0) {
   // //    if (tempId == tempNode.cur.parent.symbolMap[i].getId()) {
   // //       return true;
   // //    }
   // // }
   // // tempNode.cur = tempNode.cur.parent;
   // return tempBool;
}

function getSymbolValue(tempNode, tempId) {
   if ((tempNode.parent != undefined || tempNode.parent != null) && tempNode.symbolMap.length > 0) {
      for (var i = 0; i < tempNode.symbolMap.length; i++) {
         if (tempId == tempNode.symbolMap[i].getId()) {
            return tempNode.symbolMap[i].value;
         }
      }
   }
   if (tempNode.parent != undefined || tempNode.parent != null) {
      return getSymbolValue(tempNode.parent, tempId);
   }
}

function setSymbolValue(tempNode, tempId, thisValue) {
   if ((tempNode.parent != undefined || tempNode.parent != null) && tempNode.symbolMap.length > 0) {
      for (var i = 0; i < tempNode.symbolMap.length; i++) {
         if (tempId == tempNode.symbolMap[i].getId()) {
            tempNode.symbolMap[i].isUsed = true;
            tempNode.symbolMap[i].value = thisValue;
            console.log(tempNode.symbolMap[i].value);
         }
      }
   }
   if (tempNode.parent != undefined || tempNode.parent != null) {
      return setSymbolValue(tempNode.parent, tempId, thisValue);
   }
}

function analyzeAssignStmt() {

   if (verbose == true) {
      putMessage("SEMANTIC ANALYSIS - Analyzing <AssignmentStatement>");
   }

   ast.addNode("AssignmentStatement", "branch");
   
   var mainVar = null;
   var declared = false;
   var tempValue = 0;
   var firstType = "";
   var secondType = "";

   if (thisToken.tokenId == "T_ID") {
      // Check to see if the variable was declared
      if (scopeMap.cur.symbolMap.length > 0) {
         for (var i = 0; i < scopeMap.cur.symbolMap.length; i++) {
            if (thisToken.value == scopeMap.cur.symbolMap[i].getId()) {
               declared = true;
               break;
            }
         }
      }
      if (declared == false) {
         declared = checkParentScopes(scopeMap.cur, thisToken.value);
         // console.log(checkParentScopes(scopeMap.cur, thisToken.value));
         // console.log(declared);
      }
      // console.log(scopeMap.cur.parent.symbolMap);
      // console.log(scopeMap.cur.parent.name);
      // console.log(scopeMap.cur.parent.symbolMap[0].getId());
      // If we didn't find it in this scope check
      // all of the parent scopes
      // declare = checkParentScopes(scopeMap.cur, thisToken.value)
      if (declared == false) {
         semErrors++;
         if (verbose == true) {
            putMessage("SEMANTIC ANALYSIS - ERROR: The id [" + thisToken.value + "] was used before it was declared at (" + thisToken.line + "," + thisToken.col + ") in scope level " + scopeLevel);
         }
      }
      else {
         // Check the type of the first var here
         // and store it as firstType before moving
         // to the next token.
         mainVar = thisToken;
         setId = thisToken.value;
         tempFirstType = checkType(scopeMap.cur, thisToken.value);
         tempValue = thisToken.value;
      }
      analyzeId();
   }

   // Setting of all values will occur after this
   if (thisToken.tokenId == "T_ASSIGNOP") {
      // Analyze the following expression
      nextSemToken();

      // if (addition == true) {
      //    if (thisToken.tokenId == "T_DIGIT") {
      //       if (tokenSequence[semSequenceIndex + 1].tokenId != "T_INTOP") {
      //          if (tempFirstType != thisToken.value) {
      //             tempFirstVal = Number(thisToken.value);
      //          }   
      //          else {
      //             tempFirstVal = Number(tempFirstVal) + Number(thisToken.value);
      //          }
      //       }
      //    }
      //    else if (thisToken.tokenId == "T_ID") {
            
      //    }
      // }
      // addition = true;
      // if (addition == true) {
      //    if (thisToken.tokenId == "T_DIGIT") {
      //       if (tempFirstType == "int") {
      //          if (tokenSequence[semSequenceIndex + 1].tokenId != "T_INTOP" && tempFirstVal != tempValue) {
      //             tempFirstVal = Number(thisToken.value);
      //          }
      //          else {
      //             tempFirstVal = Number(tempFirstVal) + Number(thisToken.value);
      //          }
      //       }
      //    }
      //    else if (thisToken.tokenId == "T_ID" && tempFirstType == "int") {
      //       console.log("reached.");
      //       var newType = checkType(scopeMap.cur, thisToken.value);
      //       console.log(newType);
      //    }
         // console.log("at least raching this");
         // setSymbolValue(scopeMap.cur, tempValue, tempFirstVal);
      
      // setSymbolValue(scopeMap.cur, tempValue, tempFirstVal);

      // Move to analyzeExpr() and assign variables values in their respective places
      analyzeExpr();
      if (tempSecondVal != null) {
         setSymbolValue(scopeMap.cur, setId, tempSecondVal);
      }
      else {
         setSymbolValue(scopeMap.cur, setId, tempFirstVal);
      }
   }

   ast.endChildren();

}

// function checkIfRedeclared(tempNode, tempToken, tempScope) {
//    var i = 0;
//    var tempSymbol = tempNode.cur.symbolMap[i];
//    while (i < tempNode.cur.symbolMap.length) {
//       tempSymbol = tempNode.cur.symbolMap[i];
//       if (tempSymbol.symbolId == tempToken.value && tempSymbol.symbolScope == tempScope) {
//          return true;
//       }
//       else {
//          i++;
//       }
//    }
//    return false;
// }

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

   // Maybe create a separate ID function for assignments
   // that will help with building the symbol table?
   nextSemToken();

   if (thisToken.tokenId == "T_ID") {

      // Don't go to analyzeId() from here,
      // we need to check for errors in this case
      
      // Is the variable being declared a second
      // time illegaly? Check for that here:
      var redeclared = false;
      var i = 0;

      while (i < scopeMap.cur.symbolMap.length) {
         if (scopeMap.cur.symbolMap[i].getId() == thisToken.value) {
            redeclared = true;
            console.log(scopeMap.cur.symbolMap[i]);
            break;
         }
         else {
            i++;
         }
      }

      // checkIfRedeclared(scopeMap.cur.symbolMap, thisToken.value, scopeLevel);
      if (redeclared == true) {
         semErrors++;
         if (verbose == true) {
            putMessage("SEMANTIC ANALYSIS - ERROR: Variable [" + thisToken.value + "] at (" + thisToken.line + "," + thisToken.col + ") was declared more than once in the same scope");
         }
         ast.addNode(thisToken.value, "leaf");
         nextSemToken();
      }
      else {
         // We first initialize a temporary symbol
         // and then we push that to the array
         // that holds the symbols for the current scope.
         var tempSymbol = new Symbol(thisToken.value, tokenSequence[semSequenceIndex - 1].value, null, thisToken.line, thisToken.col, programCount, scopeLevel, true, false);
         scopeMap.cur.symbolMap.push(tempSymbol);
         if (verbose == true) {
            putMessage("SEMANTIC ANALYSIS - New symbol [" + thisToken.value + "] of type [" + tokenSequence[semSequenceIndex - 1].value + "] found at (" + thisToken.line + "," + thisToken.col + ") in scope " + scopeLevel);
         }
         ast.addNode(thisToken.value, "leaf");
         nextSemToken();
      }
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

function checkIfUsed(tempNode, tempId) {
   if ((tempNode.parent != undefined || tempNode.parent != null) && tempNode.symbolMap.length > 0) {
      for (var i = 0; i < tempNode.symbolMap.length; i++) {
         if (tempId == tempNode.symbolMap[i].getId()) {
            return tempNode.symbolMap[i].isUsed;
         }
      }
   }
   if (tempNode.parent != undefined || tempNode.parent != null) {
      return checkType(tempNode.parent, tempId);
   }
}

function analyzeInt() {

   if (verbose == true) {
      putMessage("SEMANTIC ANALYSIS - Analyzing <IntExpr>");
   }

   var exists = false;
   var varIsUsed = false;
   var thisType = checkType(scopeMap.cur);

   // Check for the + operator ahead of the digit/variable
   if (tokenSequence[semSequenceIndex + 1].tokenId == "T_INTOP") {
      // Set it so that the next var/digit/expression
      // is analyzed in addition with the previous one
      addition = true;
   }
   else {
      addition = false;
      tempFirstVal = Number(thisToken.value);
   }

   if (addition == true) {
      if (tempFirstVal == null) {
         tempFirstVal = Number(thisToken.value);
      }
      else {
         tempSecondVal = Number(thisToken.value) + Number(tempFirstVal);
         // setSymbolValue(scopeMap.cur, thisToken.value, tempSecondVal);

         // console.log(tempSecondVal);
         // currently working
         // setSymbolValue(scopeMap.cur, setId, tempSecondVal);

         // Make sure we don't continue to add
      }
   }

   // Handle digits through analyzeId() for now
   analyzeId();

   if (thisToken.tokenId == "T_INTOP") {
      // Set it so that the next var/digit/expression
      // is analyzed in addition with the previous one
      if (tokenSequence[semSequenceIndex + 1].tokenId == "T_ID") {
         varIsUsed = checkIfUsed(scopeMap.cur, tokenSequence[semSequenceIndex + 1].tokenId);
         console.log(varIsUsed);
         thisType = checkType(scopeMap.cur, tokenSequence[semSequenceIndex + 1].value);
         console.log(thisType);
         exists = checkParentScopes(scopeMap.cur, tokenSequence[semSequenceIndex + 1].value);
         console.log(exists);
         if (exists == true && thisType != "int") {
            semErrors++;
            if (verbose == true) {
               putMessage("SEMANTIC ANALYSIS - ERROR: The operator [" + thisToken.value + "] at (" + thisToken.line + "," + thisToken.col + ") cannot be used on two variables of different types");
            }
            // Move on
            addition = false;
            nextSemToken();
            analyzeExpr();
         }
         else if (exists == false) {
            semErrors++;
            if (verbose == true) {
               putMessage("SEMANTIC ANALYSIS - ERROR: The variable [" + tokenSequence[semSequenceIndex + 1].value + "] at (" + tokenSequence[semSequenceIndex + 1].line + "," + tokenSequence[semSequenceIndex + 1].col + ") was never declared");
            }
            // Move on
            addition = false;
            nextSemToken();
            analyzeExpr();
         }
         // else if (varIsUsed === undefined) {
         //    semErrors++;
         //    if (verbose == true) {
         //       putMessage("SEMANTIC ANALYSIS - ERROR: The variable [" + tokenSequence[semSequenceIndex + 1].value + "] at (" + tokenSequence[semSequenceIndex + 1].line + "," + tokenSequence[semSequenceIndex + 1].col + ") may have been initialized but it does not hold any value");
         //    }
         //    // Move on
         //    nextSemToken();
         //    analyzeExpr();
         // }
         else {
            addition = false;
            tempFirstVal = tokenSequence[semSequenceIndex - 1].value;

            // Might need to do something else for addition...
            nextSemToken();

            // Move back to analyzeExpr() for the second <Expr> for addition
            analyzeExpr();
         }
      }
      else if (tokenSequence[semSequenceIndex + 1].tokenId == "T_DIGIT") {
         nextSemToken();
         if (tempFirstVal == null) {
            tempFirstVal = Number(thisToken.value);
         }
         else {
            tempSecondVal = Number(thisToken.value) + Number(tempFirstVal);
         }
         addition = false;
         nextSemToken();
         analyzeExpr();
      }
   }
   analyzeExpr();

   if (addition == true) {
      tempSecondVal = Number(thisToken.value) + Number(tempFirstVal);
      console.log(tempSecondVal);
   }

}

function analyzeBoolExpr() {
   /*
   *  TODO:
   *  - Check the types of the two tokens in a token1 == token2 situation
   * 
   */
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

   if (tempFirstType != "string") {
      semErrors++;
      if (verbose == true) {
         putMessage("SEMANTIC ANALYSIS - ERROR: variable ");
      }
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

   thisToken = tokenSequence[semSequenceIndex];

   scopeLevel = 0;

   symbolSequence = [];

   scopeMap = new ScopeTree();

   tempFirstType = "";

   tempSecondType = "";

   tempFirstVal = null;

   tempSecondVal = null;

   additon = false;
}
