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

    // Will un-comment/re-comment this when needed
    for (var i = 0; i < code.length; i++) {
        if (i > 1 && i % 7 === 0) {
            finalCode += code[i] + "\n";
        }
        else {
            finalCode += code[i] + " ";
        }
    }
    putMessage(finalCode);
}

function checkTree(treePosition, node) {
    // Our AST contains Root, Program, Block, and Statement nodes,
    // each of which lead to different nonterminals from our grammar.
    // I think we're going to need separate functions for everything there.
    // VarDecl, AssignmentStatement and PrintStatement with a working project
    // 1,2 and 3 will score me a 50 (100/200) so I'll start there.
    
    console.log(currentScope);
    if (verbose == true) {
        putMessage("CODE GEN - Found a <" + treePosition.name + "> ...");
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
        checkAssignStmt(treePosition.children, node);
    }
    else if (treePosition.name == "PrintStatement") {
        // We obviously need to change this...
        checkPrintStmt();
    }
    else if (('0123456789').includes(treePosition.name)) {
        checkDigit(treePosition, node);
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

function checkAssignStmt(children, node) {
    if (verbose == true) {
        putMessage("CODE GEN - Working on <AssignmentStatement>");
    }
    // Gotta get ready for an addition expression
    // or to simply add the value to the code
    checkTree(children[1], node);
    // for (var i = 0; i < sdt.contents.length; i++) {
    //     console.log(sdt.contents[i].variable);
    //     console.log(children[0]);
    //     if (sdt.contents[i].variable == children[0].name) {
    //         code.push(sdt.contents[i].temp);
    //         code.push("XX");
    //     }
    // }
    console.log(children[0]);

    var newTemp = sdt.getData(children[0]);

    code.push(newTemp.temp);
    code.push("XX");
}

function checkPrintStmt() {

}

function checkDigit(children, node) {
    // Use this just to add the digit to the code
    if (verbose == true) {
        putMessage("CODE GEN - Checking a Digit");
    }
    code.push("A9");
    code.push("0" + children.name);
    code.push("8D");
}

function loadHex(randomString) {
    if (randomString == "VarDecl") {
        code.push("A9");
        code.push("00");
        code.push("8D");
    }
}

function patchHex() {
    // Reapproaching backpatching...

    if (verbose == true) {
        putMessage("CODE GEN - Backpatching...");
    }
    var tempAddress = 0;
    var bytes = sdt.contents.length;
    var storage = 48 - bytes;
    var hex = storage;

    for (var i = 0; i < bytes; i++) {
        hex = storage;
        for (var j = 0; j < code.length; j++) {
            if (code[j] == sdt.contents[i].temp) {
                sdt.contents[i].offset = hex.toString(16).toUpperCase() + "00";
                code[j] = hex.toString(16).toUpperCase();
                code[j + 1] = "00";
                storage++;
            }   
        }
    }
}

function resetGenVals() {
    code = [];

    ourAst = new Tree();

    sdt = new StaticData();

    currentScope = 0;

    staticAddress = 0;

    finalCode = "";
}