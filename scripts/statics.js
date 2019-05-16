/* statics.js */
// This file is going to hold a constructor function
// for our static data table

function StaticData() {
    
    // our "table"
    this.contents = [];

    // handle adding new data
    this.addData = function(temp, variable, scope, offset) {
        // declare the new data's fields
        var data = { temp: temp,
                     variable: variable,
                     scope: scope,
                     offset: offset
                   };

        //push the new data to the contents of this table
        this.contents.push(data);
    };

    this.getData = function(tempVariable) {
        for (var i = 0; i < this.contents.length; i++) {
            if (this.contents[i].variable == tempVariable) {
                return this.contents[i];
            }
        }
    }

    this.has = function(randomTemp) {
        for (var i = 0; i < this.contents.length; i++) {
            if (this.contents[i].temp == randomTemp) {
                return true;
            }
        }
        return false;
    }

    this.setOffset = function(randomTemp, newAddress) {
        for (var i = 0; i < this.contents.length; i++) {
            if (this.contents[i].temp == randomTemp) {
                this.contents[i].offset = newAddress;
            }
        }
    }
}