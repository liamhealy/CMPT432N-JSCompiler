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

// Holds all symbols that are declared
var declaredSymbols = [];

// Need to keep track of the scope
var scopeLevel = 0;

// Lets us know if we should be adding values together
var addition = false;

// Keep track of wether or not we are assigning values
var assigning = false;

// Keep track of types and values for assignment statements
var tempFirstType = "";
var tempSecondType = "";
var tempFirstVal = null;
var tempSecondVal = null;
var typeForWhile = null;

// Keep a variable ready to hold an id so we can
// set a symbol's value to it's own
var setId = tokenSequence[semSequenceIndex];

// Keep track of <PrintStatement> so that we don't
// receive unwarrented errors from the compiler thinking
// that we are in <AssignmentStatement>
var inPrint = false;

var newSymTable = "";

document.getElementById("symTables").innerHTML = "";

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
      warningCheck(declaredSymbols);
      // Output feedback
      if (semErrors == 0) {
         putMessage("SEMANTIC ANALYSIS - Analysis finished with " + semErrors + " errors and " + semWarnings + " warning(s).");
         // while (scopeMap.cur.parent != undefined) {
         //    scopeMap.cur = scopeMap.cur.parent;
         // }
         // if (scopeMap.cur.parent != null || scopeMap.cur.parent != undefined) {
         //    scopeMap.cur = scopeMap.cur.parent;
         // }
         // if (scopeMap.cur.symbolMap.length)
         
         // Basically a blank variable used to hold the table
         var tableHolder = createSymbolTable(scopeMap.cur);
         // console.log(scopeMap.cur.symbolMap[0]);
         
         // Now we actually define the table here and insert tableHolder into it:
         if (tableHolder != "") {
            newSymTable += "Symbol Table for program " + programCount + ":<br><table cellspacing=3 style=\"border:1px;\"><tr><th>ID</th><th>Type</th><th>Scope</th><th>Line</th></tr>" + tableHolder + "</table><br>";
         }
            // Then display it to the <div>
         document.getElementById("symTables").innerHTML += newSymTable;
      }
      else {
         putMessage("SEMANTIC ANALYSIS - Analysis failed with " + semErrors + " error(s) and " + semWarnings + " warning(s)");
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

      ast.addNode("Block", "branch", scopeLevel);
      
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

   scopeMap.endChildren();

}

function analyzeStmtList() {
   // Here is where we will continue from analyzeBlock()
   // Might look familiar as it is somewhat similar to parseStmtList()

   if (verbose == true) {
      putMessage("SEMANTIC ANALYSIS - Analyzing <StatementList>");
      console.log(thisToken.value);
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

   var exists = false;

   if (verbose == true) {
      putMessage("SEMANTIC ANALYSIS - Analyzing <PrintStatement>");
   }

   // Add this as a branch to the AST
   ast.addNode("PrintStatement", "branch");

   // Move to the left parenthesis
   nextSemToken();
   if (thisToken.tokenId == "T_LPARENTHESES") {
      inPrint = true;
      // Move to the expression or right parenthesis
      nextSemToken();

      if (thisToken.tokenId == "T_ID") {
         exists = checkParentScopes(scopeMap.cur, thisToken.value);
         if (exists == false) {
            semErrors++;
            if (verbose == true) {
               putMessage("SEMANTIC ANALYSIS - ERROR: The variable [" + thisToken.value + "] was used before it was declared at (" + thisToken.line + "," + thisToken.col + ") in scope " + scopeLevel);
            }
         }
         else {
            setAsUsed(scopeMap.cur, thisToken.value);
            analyzeId();
         }
      }
      else if (thisToken.tokenId == "T_BOOLVAL") {
         ast.addNode(thisToken.value, "leaf");
         nextSemToken();
      }

      // Expression analysis will be here.
      analyzeExpr();
   }

   if (thisToken.tokenId == "T_RPARENTHESES") {
      inPrint = false;
      nextSemToken();
   }

   ast.endChildren();
}

function analyzeId() {

   ast.addNode(thisToken.value, "leaf", scopeLevel, thisToken.tokenId);
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
}

function createSymbolTable(tempNode, newRow = "") { 
   if (tempNode.symbolMap.length > 0) {
      for (var i = 0; i < tempNode.symbolMap.length; i++) {
         newRow += "<tr><td>" + tempNode.symbolMap[i].getId() + "</td><td>" + tempNode.symbolMap[i].getType() + "</td><td>" + tempNode.symbolMap[i].getScope() + "</td><td>" + tempNode.symbolMap[i].getLine() + "</td></tr>";
      }
   }
   if (tempNode.children != undefined || tempNode.children != null) {
      for (var n = 0; n < tempNode.children.length; n++) {
         newRow = createSymbolTable(tempNode.children[n], newRow);
      }
   }
   return newRow;
}

function checkScopeLevels(tempNode, tempId) {
   if ((tempNode.parent != undefined || tempNode.parent != null) && tempNode.symbolMap.length > 0) {
      for (var i = 0; i < tempNode.symbolMap.length; i++) {
         if (tempId == tempNode.symbolMap[i].getId()) {
            return tempNode.symbolMap[i].getScope();
         }
      }
   }
   if (tempNode.parent != undefined || tempNode.parent != null) {
      return checkScopeLevels(tempNode.parent, tempId);
   }
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
            // tempNode.symbolMap[i].isUsed = true;
            tempNode.symbolMap[i].value = thisValue;
            console.log(tempNode.symbolMap[i].value);
         }
      }
   }
   if (tempNode.parent != undefined || tempNode.parent != null) {
      return setSymbolValue(tempNode.parent, tempId, thisValue);
   }
}

function checkIfUsed(tempNode, tempId) {
   if ((tempNode.parent != undefined || tempNode.parent != null) && tempNode.symbolMap.length > 0) {
      for (var i = 0; i < tempNode.symbolMap.length; i++) {
         if (tempId == tempNode.symbolMap[i].getId()) {
            return tempNode.symbolMap[i].isUsed;
            // tempNode.symbolMap[i].value = thisValue;
            // console.log(tempNode.symbolMap[i].value);
         }
      }
   }
   if (tempNode.parent != undefined || tempNode.parent != null) {
      return checkIfUsed(tempNode.parent, tempId);
   }
}

function setAsUsed(tempNode, tempId) {
   if ((tempNode.parent != undefined || tempNode.parent != null) && tempNode.symbolMap.length > 0) {
      for (var i = 0; i < tempNode.symbolMap.length; i++) {
         if (tempId == tempNode.symbolMap[i].getId()) {
            tempNode.symbolMap[i].isUsed = true;
            console.log(tempNode.symbolMap[i].isUsed);
         }
      }
   }
   if (tempNode.parent != undefined || tempNode.parent != null) {
      return setAsUsed(tempNode.parent, tempId);
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
   var symScope = null;
   var validSym = false;

   var symbolType = null;

   if (thisToken.tokenId == "T_ID") {
      // TODO:
      //    - Check if variable was declared in scope
      setId = thisToken;
      var isDeclared = checkParentScopes(scopeMap.cur, thisToken.value);
      if (isDeclared == false) {
         semErrors++;
         if (verbose == true) {
            putMessage("SEMANTIC ANALYSIS - ERROR: Symbol [" + thisToken.value + "] at (" + thisToken.line + "," + thisToken.col + ") cannot be resolved to a variable in this scope");
         }
      }
      else {
         symbolType = checkType(scopeMap.cur, thisToken.value);
         analyzeId();
      }
   }

   // Setting of all values will occur after this
   if (thisToken.tokenId == "T_ASSIGNOP") {

      assigning = true;

      nextSemToken();

      if (symbolType == "int" && thisToken.tokenId == "T_DIGIT") {
         console.log("Found an int = digit assingment.");
         analyzeInt();
      }
      else if (symbolType == "string") {
         analyzeStringExpr();
      }
      else if (symbolType == "boolean") {
         analyzeBoolExpr();
      }
      // if (validSym == true) {
      //    // We are about to assign a value to a symbol
      //    assigning = true;
      //    // Analyze the following expression
      //    nextSemToken();
      // }
      // else {
      //    nextSemToken();
      // }
      assigning = false;
      
      // analyzeExpr();

      ast.endChildren();

   }
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
         declaredSymbols.push(thisToken.value);
         if (verbose == true) {
            putMessage("SEMANTIC ANALYSIS - New symbol [" + thisToken.value + "] of type [" + tokenSequence[semSequenceIndex - 1].value + "] found at (" + thisToken.line + "," + thisToken.col + ") in scope " + scopeLevel);
         }
         ast.addNode(thisToken.value, "leaf");
         nextSemToken();
      }
   }

   ast.endChildren();

}

function warningCheck(tempArray) {
   var symbolUsed = false;
   var currentScope = 0;
   for (var i = 0; i < tempArray.length; i++) {
      symbolUsed = checkIfUsed(scopeMap.cur, tempArray[i]);
      currentScope = checkScopeLevels(scopeMap.cur, tempArray[i]);
      if (symbolUsed == false) {
         semWarnings++;
         if (verbose == true) {
            putMessage("SEMANTIC ANALYSIS - Warning: The variable [" + tempArray[i] + "] was declared in scope " + currentScope + " but its value is never read");
         }
      }
   }
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

// function checkIfUsed(tempNode, tempId) {
//    if ((tempNode.parent != undefined || tempNode.parent != null) && tempNode.symbolMap.length > 0) {
//       for (var i = 0; i < tempNode.symbolMap.length; i++) {
//          if (tempId == tempNode.symbolMap[i].getId()) {
//             return tempNode.symbolMap[i].isUsed;
//          }
//       }
//    }
//    if (tempNode.parent != undefined || tempNode.parent != null) {
//       return checkIfUsed(tempNode.parent, tempId);
//    }
// }

function analyzeInt() {

   if (verbose == true) {
      putMessage("SEMANTIC ANALYSIS - Analyzing <IntExpr>");
   }

   var exists = false;
   var varIsUsed = false;
   var thisType = checkType(scopeMap.cur, setId.value);
   // var temp = false;

   // if (assigning == true) {
   //    if (thisToken.tokenId == "T_DIGIT" && thisType != "int") {
   //       semErrors++;
   //       if (verbose == true) {
   //          putMessage("SEMANTIC ANALYSIS - ERROR: The variable [" + setId.value + "] at (" + setId.line + "," + setId.col + ") was expecting an assigned value of type [" + thisType + "] but instead received a value of type [int]\n");
   //       }
   //       nextSemToken();
   //       analyzeExpr();
   //    }
   // }

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
   if (assigning == true) {
      if (thisToken.tokenId == "T_INTOP") {
         // Set it so that the next var/digit/expression
         // is analyzed in addition with the previous one
         if (tokenSequence[semSequenceIndex + 1].tokenId == "T_ID") {
            varIsUsed = checkIfUsed(scopeMap.cur, tokenSequence[semSequenceIndex + 1].value);
            console.log(varIsUsed);
            thisType = checkType(scopeMap.cur, tokenSequence[semSequenceIndex + 1].value);
            console.log(thisType);
            exists = checkParentScopes(scopeMap.cur, tokenSequence[semSequenceIndex + 1].value);
            console.log(exists);
            if (exists == true && thisType != "int") {
               // setAsUsed(scopeMap.cur, tokenSequence[semSequenceIndex + 1].value);
               // console.log(checkIfUsed(scopeMap.cur, tokenSequence[semSequenceIndex + 1].value));
               semErrors++;
               if (verbose == true) {
                  putMessage("SEMANTIC ANALYSIS - ERROR: The variable [" + setId.value + "] at (" + setId.line + "," + setId.col + ") was expecting an assigned value of type [int], but received a value of type [" + thisType + "] instead\n");
               }
               // The operator [" + thisToken.value + "] at (" + thisToken.line + "," + thisToken.col + ") cannot be used on two variables of different types
               // Move on
               addition = false;
               // thisToken = tokenSequence[semSequenceIndex + 2];
               nextSemToken();
               analyzeExpr();
            }
            else if (exists == false) {
               semErrors++;
               if (verbose == true) {
                  putMessage("SEMANTIC ANALYSIS - ERROR: The variable [" + tokenSequence[semSequenceIndex + 1].value + "] at (" + tokenSequence[semSequenceIndex + 1].line + "," + tokenSequence[semSequenceIndex + 1].col + ") was never declared\n");
               }
               // Move on
               addition = false;
               // thisToken = tokenSequence[semSequenceIndex + 2];
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
               // thisToken = tokenSequence[semSequenceIndex + 2];
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
            // thisToken = tokenSequence[semSequenceIndex + 2];
            analyzeExpr();
         }
      }
   }
   else if (inPrint == true && thisToken.tokenId == "T_INTOP") {
      nextSemToken();
      if (thisToken.tokenId == "T_ID") {
         ast.addNode(thisToken.value, "leaf");
         nextSemToken();
      }
   }
   // analyzeExpr();

   if (addition == true) {
      tempSecondVal = Number(thisToken.value) + Number(tempFirstVal);
      console.log(tempSecondVal);
   }

   exists = false;
   varIsUsed = false;
   varOneType = null;
   varTwoType = null;

}

function analyzeBoolExpr() {
   /*
   *  TODO:
   *  - Check the types of the two tokens in a token1 == token2 situation
   * 
   */

   var exists = false;
   var varIsUsed = false;
   var varOneType = null;
   var varTwoType = null;
   var comparingVal = null;

   if (verbose == true) {
      putMessage("SEMANTIC ANALYSIS - Analyzing <BoolExpr>");
   }

   if (thisToken.tokenId == "T_LPARENTHESES") {
      // Analyze the following expression
      nextSemToken();
      analyzeExpr();
   }

   varIsUsed = checkIfUsed(scopeMap.cur, setId.value);
   console.log(varIsUsed);
   thisType = checkType(scopeMap.cur, setId.value);
   console.log(thisType);
   exists = checkParentScopes(scopeMap.cur, setId.value);
   console.log(exists);
   // comparingVal = getSymbolValue(scopeMap.cur, setId.value);
   // console.log(comparingVal);

   if (assigning == true) {
      if (exists == true && thisType != "boolean") {
         // setAsUsed(scopeMap.cur, tokenSequence[semSequenceIndex + 1].value);
         // console.log(checkIfUsed(scopeMap.cur, tokenSequence[semSequenceIndex + 1].value));
         semErrors++;
         if (verbose == true) {
            putMessage("SEMANTIC ANALYSIS - ERROR: The variable [" + setId.value + "] at (" + setId.line + "," + setId.col + ") was expecting an assigned value of type [" + thisType + "], but received a value of type [boolean] instead\n");
         }
         // The operator [" + thisToken.value + "] at (" + thisToken.line + "," + thisToken.col + ") cannot be used on two variables of different types
         // Move on
         // thisToken = tokenSequence[semSequenceIndex + 2];
         nextSemToken();
         // analyzeExpr();
      }
      else if (exists == false) {
         semErrors++;
         if (verbose == true) {
            putMessage("SEMANTIC ANALYSIS - ERROR: The variable [" + setId.value + "] at (" + setId.line + "," + setId.col + ") was never declared\n");
         }
         // Move on
         // thisToken = tokenSequence[semSequenceIndex + 2];
         nextSemToken();
         // analyzeExpr();
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
         // tempFirstVal = setId.value;
         tempFirstVal = thisToken.value;
         ast.addNode(thisToken.value, "leaf");
         nextSemToken();
      }
   }
   else {
      if (thisToken.tokenId == "T_ID") {
         
         comparingVal = getSymbolValue(scopeMap.cur, thisToken.value);
         console.log(comparingVal);
         varIsUsed = checkIfUsed(scopeMap.cur, thisToken.value);
         console.log(varIsUsed);

         if (varOneType == null) {
            varOneType = checkType(scopeMap.cur, thisToken.value);
            console.log(varOneType);
            // setAsUsed(scopeMap.cur, thisToken.value);
         }
         else {
            varTwoType = checkType(scopeMap.cur, thisToken.value);
            console.log(varTwoType);
            if (varOneType != varTwoType) {
               semErrors++;
               if (verbose == true) {
                  putMessage("SEMANTIC ANALYSIS - ERROR: A variable of type [" + varOneType + "] cannot be compared to a variable of type [" + varTwoType + "]");
               }
               nextSemToken();
            }
            else {
               // setAsUsed(scopeMap.cur, thisToken.value);
            }
         }

         // setAsUsed(scopeMap.cur, thisToken.value);
         exists = checkParentScopes(scopeMap.cur, thisToken.value);
         console.log(exists);



         // if (thisToken.tokenId == "T_ID" && varIsUsed == false) {}
         // Move to analyzeId() so we can put it in the AST
         analyzeId();
      }
      else if (thisToken.tokenId == "T_BOOLVAL") {
         console.log(typeForWhile);
         if (typeForWhile != "boolean") {
            semErrors++;
            if (verbose == true) {
               putMessage("SEMANTIC ANALYSIS - ERROR: A variable of type [" + typeForWhile + "] cannot be compared to a boolean value");
            }
            nextSemToken();
            // This means that this is our first and only condiiton
         }
         analyzeId();
      }
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

   exists = false;
   varIsUsed = false;
   varOneType = null;
   varTwoType = null;

}

function analyzeStringExpr() {
   // We are gonna need a variable to hold the CharList
   var thisString = thisToken.value;
   var exists = false;
   var varIsUsed = false;
   var thisType = checkType(scopeMap.cur, setId.value);

   if (verbose == true) {
      putMessage("SEMANTIC ANALYSIS - Analyzing <StringExpr>");
   }

   // if (thisType != "string") {
   //    semErrors++;
   //    if (verbose == true) {
   //       putMessage("SEMANTIC ANALYSIS - ERROR: variable ");
   //    }
   // }

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
   else {
      // if (assigning == true) {
      //    semErrors++;
      //    if (verbose == true) {
      //       putMessage("SEMANTIC ANALYSIS - ERROR: Variable [" + setId.value + "] at (" + setId.line + "," + setId.col + ") was expecting an assignment of type [" + thisType + "], but instead received a value of type [string]");
      //    }
      //    while(thisToken.tokenId != "T_CLOSEQUOTE") {
      //       if (thisToken.tokenId == "T_CHAR") {
      //          thisString += thisToken.value;
      //       }
      //       nextSemToken();
      //    }
      //    analyzeExpr();
      // }
   }

   // if ('0123456789'.includes(thisString)) {
   //    semErrors++;
   //    if (verbose == true) {
   //       putMessage("SEMANTIC ANALYSIS - Variable [" + setId.value + "] at (" + setId.line + "," + setId.col + ") was expecting an assignment of type string, but instead received otherwise.");
   //    }
   // }

   varIsUsed = checkIfUsed(scopeMap.cur, setId.value);
   console.log(varIsUsed);
   thisType = checkType(scopeMap.cur, setId.value);
   console.log(thisType);
   exists = checkParentScopes(scopeMap.cur, setId.value);
   console.log(exists);

   if (assigning == true) {
      if (exists == true && thisType != "string") {
         // setAsUsed(scopeMap.cur, tokenSequence[semSequenceIndex + 1].value);
         // console.log(checkIfUsed(scopeMap.cur, tokenSequence[semSequenceIndex + 1].value));
         semErrors++;
         if (verbose == true) {
            putMessage("SEMANTIC ANALYSIS - ERROR: The variable [" + setId.value + "] at (" + setId.line + "," + setId.col + ") was expecting an assigned value of type [" + thisType + "], but received a value of type [string] instead\n");
         }
         // The operator [" + thisToken.value + "] at (" + thisToken.line + "," + thisToken.col + ") cannot be used on two variables of different types
         // Move on
         // thisToken = tokenSequence[semSequenceIndex + 2];
         nextSemToken();
      }
      else if (exists == false) {
         semErrors++;
         if (verbose == true) {
            putMessage("SEMANTIC ANALYSIS - ERROR: The variable [" + setId.value + "] at (" + setId.line + "," + setId.col + ") was never declared\n");
         }
         // Move on
         // thisToken = tokenSequence[semSequenceIndex + 2];
         nextSemToken();
         // analyzeExpr();
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
         // tempFirstVal = setId.value;
         tempFirstVal = thisString;
         // Might need to do something else for addition...
         // thisToken = tokenSequence[semSequenceIndex + 2];
         // nextSemToken();

         // Move back to analyzeExpr() for the second <Expr> for addition
         // analyzeExpr();
      }
   }

   console.log(getSymbolValue(scopeMap.cur, setId));
   ast.addNode(thisString, "leaf");
   nextSemToken();

   // Not sure if I am storing CharList efficiently and safely

   exists = false;
   varIsUsed = false;
   thisType = null;
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

   setId = tokenSequence[semSequenceIndex];

   assigning = false;

   declaredSymbols = [];
   
   newSymTable = "";

}
