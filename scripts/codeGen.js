/* codegen.js */
// Basically, we want to use our AST to generate the 
// machine code.

// I'll start here by creating some global variables:

// array for us to store the code in
var code = [];

// array for us to store heap value + size
var heap = [];

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

// keep track of where we are in terms of the heap
var heapPointer = 256;

// keep track of where our latest string is
var stringPointer = null;

// have a variable ready to hold an address for certain cases
var tempAddress = null;
var tempAddressOne = "X1";
var tempAddressTwo = "X2";

function generate(previousAst) {

    document.getElementById("codeTranslation").textContent = "";

    putMessage("CODE GEN - Beginning code generation for Program " + programCount);
    
    ourAst = previousAst;

    checkTree(ourAst.root, 0);

    patchHex();

    putMessage("CODE GEN - Finished - Code generated below next to symbol table");
    console.log(sdt.contents);
    // Will un-comment/re-comment this when needed
    document.getElementById("codeTranslation").textContent += "Program " + programCount + ":\n";
    for (var i = 0; i < heap.length; i++) {
        code.push(heap[i]);
    }
    for (var i = 0; i < code.length; i++) {
        document.getElementById("codeTranslation").textContent += code[i] + " ";
    }
    document.getElementById("codeTranslation").textContent += "\n" + "-----------------";

    resetGenVals();
}

function checkTree(treePosition, node) {
    // Our AST contains Root, Program, Block, and Statement nodes,
    // each of which lead to different nonterminals from our grammar.
    // I think we're going to need separate functions for everything there.
    // VarDecl, AssignmentStatement and PrintStatement with a working project
    // 1,2 and 3 will score me a 50 (100/200) so I'll start there.
    
    console.log(currentScope);
    if (verbose == true) {
        putMessage("CODE GEN - Found " + treePosition.name + " ...");
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
        checkPrintStmt(treePosition.children, node);
    }
    else if (('0123456789').includes(treePosition.name)) {
        checkDigit(treePosition, node);
    }
    else if (treePosition.name == "true" || treePosition.name == "false") {
        checkBoolean(treePosition, node);
    }
    else if (treePosition.type == "string") {
        checkString(treePosition, node);
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
    console.log(children[1]);

    var newTemp = sdt.getData(children[0]);
    tempAddress = newTemp;

    code.push("8D");
    console.log(newTemp.temp);
    code.push(newTemp.temp);
    code.push("XX");
}

function checkAddition(children, node) {
    if (verbose == true) {
        putMessage("CODE GEN - Checking addition expression");
    }

    var tempAddition = children[1].name;

    checkTree(children[1], node);
    // Store what is found in tree above here:
    code.push("8D");
    code.push(tempAddressOne);
    code.push("XX");
    // Load the data and add contents of the original address
    code.push("A9");
    code.push(tempAddition.toString(16).toUpperCase());
    code.push("6D");
    code.push(tempAddressOne);
    code.push("XX");
}

function checkPrintStmt(children, node) {
    if (verbose == true) {
        putMessage("CODE GEN - Checking a PrintStatement");
    }
    // We're looking at an int, string (CharList), boolean
    // or other expression
    console.log(children[0]);

    if (children[0].type == "T_ID") {
        // Load the Y-register up with the contents of the Id
        var yAddress = sdt.getData(children[0]);
        var type = checkType(scopeMap.cur, children[0].name);

        // How are we gonna get the type?
        // Maybe the scopeMap?

        if (type == "string") {
            code.push("AC");
            code.push(yAddress.temp);
            code.push("XX");
            // Load the x register with 1
            code.push("A2");
            code.push("02");
            code.push("FF");
        }
        else if (type == "int") {
            code.push("AC");
            code.push(yAddress.temp);
            code.push("XX");
            // Load the x register with 1
            code.push("A2");
            code.push("01");
            code.push("FF");
        }
        else if (type == "boolean") {
            code.push("AC");
            code.push(yAddress.temp);
            code.push("XX");
            // Load the x register with 1
            code.push("A2");
            code.push("02");
            code.push("FF");
        }
    }

}

function checkDigit(children, node) {
    // Use this just to add the digit to the code
    if (verbose == true) {
        putMessage("CODE GEN - Checking a Digit");
    }
    code.push("A9");
    code.push("0" + children.name);
}

function checkBoolean(children, node) {
    if (verbose == true) {
        putMessage("CODE GEN - Checking a boolean Value");
    }
    
    //TODO: store true and false in heap.
    code.push("A9");
    if (children.name == "true") {
        code.push("01");
    }
    else {
        code.push("00");
    }

    heap.unshift("00");
    heapPointer--;
    
    // We need to add the values to the heap
    console.log(heapPointer.toString(16));

    var stringLength = children.name.length;
    console.log(stringLength);
    console.log(children.name);

    // Going to store the size of the heap somewhere
    // and put the values in an array, which I will then
    // concatenate to the code[] array.
    var tempChar = "";
    var tempString = "" + children.name + "";
    for (var i = stringLength - 1; i >= 0; i--) {
        tempChar = tempString.charCodeAt(i).toString(16).toUpperCase();
        heap.unshift(tempChar);
        heapPointer--;
    }
    // Store the static pointer
    stringPointer = heapPointer;
    
    // Add it to the code
    console.log(stringPointer);
    code.push("A9");
    code.push(stringPointer.toString(16).toUpperCase());
}

function checkString(children, node) {
    if (verbose == true) {
        putMessage("CODE GEN - Checking a string");
    }

    heap.unshift("00");
    heapPointer--;
    
    // We need to add the values to the heap
    console.log(heapPointer.toString(16));

    var stringLength = children.name.length;
    console.log(stringLength);
    console.log(children.name);

    // Going to store the size of the heap somewhere
    // and put the values in an array, which I will then
    // concatenate to the code[] array.
    var tempChar = "";
    var tempString = "" + children.name + "";
    for (var i = stringLength - 1; i >= 0; i--) {
        tempChar = tempString.charCodeAt(i).toString(16).toUpperCase();
        heap.unshift(tempChar);
        heapPointer--;
    }
    // Store the static pointer
    stringPointer = heapPointer;
    
    // Add it to the code
    console.log(stringPointer);
    code.push("A9");
    code.push(stringPointer.toString(16).toUpperCase());
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
    var tempOne = code.length + sdt.contents.length;
    var tempTwo = tempOne + 1;

    for (var i = 0; i < bytes; i++) {
        hex = storage;
        for (var j = 0; j < code.length; j++) {
            if (code[j] == sdt.contents[i].temp) {
                sdt.contents[i].offset = hex.toString(16).toUpperCase() + "00";
                code[j] = hex.toString(16).toUpperCase();
                code[j + 1] = "00";
            }
            else if (code[j] == tempAddressOne) {
                code[j] = tempOne.toString(16).toUpperCase();
                code[j + 1] = "00";
            }
            else if (code[j] == tempAddressTwo) {
                code[j] = tempTwo.toString(16).toString();
                code[j + 1] = "00";
            }
        }
        storage++;
    }

    for (var i = code.length; i < heapPointer; i++) {
        code.push("00");
    }
}

function resetGenVals() {
    code = [];

    heap = [];

    finalCode = "";

    ourAst = new Tree();

    sdt = new StaticData();

    currentScope = 0;

    staticAddress = 0;

    heapPointer = 256;

    stringPointer = null;

    tempAddress = null;
}