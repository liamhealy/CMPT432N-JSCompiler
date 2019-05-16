/* codegen.js */
// Basically, we want to use our AST to generate the 
// machine code.

// I'll start here by creating some global variables:

// array for us to store the code in
var code = [];

// take our ast from semantic analysis
var ourAst = new Tree();

// declare a new Static Data Table
var sdt = new StaticData();

// keep track of the current scope level
var currentScope = 0;

// var staticAddress = 0;

function generate(previousAst) {

    putMessage("CODE GEN - Beginning code generation for Program " + programCount);
    
    ourAst = previousAst;

    checkTree(ourAst.root, 0);
}

function checkTree(treePosition, node) {
    // Our AST contains Root, Program, Block, and Statement nodes,
    // each of which lead to different nonterminals from our grammar.
    // I think we're going to need separate functions for everything there.
    // VarDecl, AssignmentStatement and PrintStatement with a working project
    // 1,2 and 3 will score me a 50 (100/200) so I'll start there.
    
    currentScope = treePosition.scope;
    console.log(currentScope);
    if (verbose == true) {
        putMessage("CODE GEN - Checking <" + treePosition.name + "> ...");
    }

    // Gonna try and go with an If-Else format here:
    if (treePosition.name == "Root") {
        checkIn(treePosition.children, node);
    }
    else if (treePosition.name == "Program") {
        checkIn(treePosition.children, node);
    }
    else if (treePosition.name == "Block") {
        checkIn(treePosition.children, node);
    }
    else if (treePosition.name == "VarDecl") {
        // We obviously need to change this...
        checkVarDecl();
    }
    else if (treePosition.name == "AssignmentStatement") {
        // We obviously need to change this...
        checkAssignStmt();
    }
    else if (treePosition.name == "PrintStatement") {
        // We obviously need to change this...
        checkPrintStmt();
    }
}

function checkIn(children, node) {
    console.log(children);
    // See what 'children' we have here and check them
    for (var i = 0; i < children.length; i++) {
        checkTree(children[i], node);
    }
}

function checkVarDecl() {

}

function checkAssignStmt() {

}

function checkPrintStmt() {

}