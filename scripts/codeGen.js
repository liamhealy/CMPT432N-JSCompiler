/* codegen.js */
// Basically, we want to use our AST to generate the 
// machine code.

// I'll start here by creating some global variables:

// array for us to store the code in
var code = [];

// this is going to store the final code translation
var finalCode = "";

// take our ast from semantic analysis
var ourAst = new Tree();

// declare a new Static Data Table
var sdt = new StaticData();

// keep track of the current scope level
var currentScope = 0;

// keep a static address variable for our table
var staticAddress = 0;

function generate(previousAst) {

    putMessage("CODE GEN - Beginning code generation for Program " + programCount);
    
    ourAst = previousAst;

    checkTree(ourAst.root, 0);

    patchHex();
    // Will un-comment this when we are ready to go
    // for (var i = 0; i < code.length; i++) {
    //     if (i > 1 && i % 7 === 0) {
    //         finalCode += code[i] + "\n";
    //     }
    //     else {
    //         finalCode += code[i] + " ";
    //     }
    // }
    // putMessage(finalCode);
}

function checkTree(treePosition, node) {
    // Our AST contains Root, Program, Block, and Statement nodes,
    // each of which lead to different nonterminals from our grammar.
    // I think we're going to need separate functions for everything there.
    // VarDecl, AssignmentStatement and PrintStatement with a working project
    // 1,2 and 3 will score me a 50 (100/200) so I'll start there.
    
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
        currentScope = treePosition.scope;
        checkIn(treePosition.children, node);
    }
    else if (treePosition.name == "VarDecl") {
        // We obviously need to change this...
        checkVarDecl(treePosition.children, node);
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

function checkVarDecl(children, node) {
    // TODO: add the hex data to code[]? Not exactly sure yet
    if (verbose == true) {
        putMessage("CODE GEN - Working on <VarDecl>");
    }

    sdt.addData("T" + staticAddress, children[1], currentScope, 0);
    var newTemp = sdt.getData(children[1]);
    
    console.log(newTemp.temp);
    loadHex("VarDecl");
    code.push(newTemp.temp);
    code.push("XX");
    staticAddress++;
}

function checkAssignStmt() {

}

function checkPrintStmt() {

}

function loadHex(randomString) {
    if (randomString == "VarDecl") {
        code.push("A9");
        code.push("00");
        code.push("8D");
    }
}

function patchHex() {

}

function resetGenVals() {
    code = [];

    ourAst = new Tree();

    sdt = new StaticData();

    currentScope = 0;

    staticAddress = 0;
}