/* codegen.js */
// Basically, we want to use our AST to generate the 
// machine code.

// I'll start here by creating some global variables:

// array for us to store the code in
var code = [];

// take our ast from semantic analysis
var ourAst = ast;

function generate() {

    putMessage("CODE GEN - Beginning code generation for Program " + programCount);
    
    checkTree(ourAst.root, 0);
}

function checkTree(treePosition, node) {
    // Our AST contains Root, Program, Block, and Statement nodes,
    // each of which lead to different nonterminals from our grammar.
    // I think we're going to need separate functions for everything there.
    // VarDecl, AssignmentStatement and PrintStatement with a working project
    // 1,2 and 3 will score me a 50 (100/200) so I'll start there.
    
    // Gonna try and go with an If-Else format here:
    if (treePosition.name == "Root") {
        putMessage("Awesome, we found the root.");
        checkIn(treePosition, node);
    }
    else if (treePosition.name == "Program") {
        putMessage("Cool, we found <Program> too.");
        checkIn(treePosition, node);
    }
    else if (treePosition.name == "Block") {
        putMessage("Cool, we found <Block> too.");
        checkIn(treePosition, node);
    }
}

function checkIn(treePosition, node) {
    if (verbose == true) {
        putMessage("CODE GEN - Checking <" + treePosition.name + ">...");
    }
    // See what 'children' we have here and check them
    for (var i = 0; i < treePosition.length; i++) {
        checkTree(treePosition.cur.children[i], node);
    }
}