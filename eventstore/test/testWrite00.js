var EventStore = require("../EventStore");
const Config = require("./testConfig.js");


try {
    eventStore = new EventStore(new Config().get());

    // *************
    var event00 = {
        name : "colacao",
        payload : 
        { 
            prato : "suco de melancia", 
            preco : 7.00, 
        },
        user : 
        {
            name : "Maria das Neves 6, a moça nota = 10",
            id : "PV - 4587"
        }    
    }
    eventStore.save(event00)
        .then((instance_id) => { 
            console.log("instance id = ", instance_id);
        })
        .catch((e) => {
            console.log("error save = ",e)
        });
    }
catch(e) {
    console.log("error test =",e);
}
/* 

// *************
eventStore.save({ name : "colacao", payload : { prato : "bananas", preco : 5.20 } })
.then((instance_id) => { 
    console.log("instance id = ", instance_id);
})
.catch((e) => {
    console.log("error = ",e)
});

// *************
eventStore.save({ name : "almoco", payload : { prato : "salada", preco : 17.30 } })
.then((instance_id) => { 
    console.log("instance id = ", instance_id);
})
.catch((e) => {
    console.log("error = ",e)
});

// *************
eventStore.save({ name : "lanche", payload : { prato : "misto quente", preco : 9.80 } })
.then((instance_id) => { 
    console.log("instance id = ", instance_id);
})
.catch((e) => {
    console.log("error = ",e)
});

// *************
eventStore.save({ name : "jantar", payload : { prato : "peixe", preco : 32.70 } })
.then((instance_id) => { 
    console.log("instance id = ", instance_id);
})
.catch((e) => {
    console.log("error = ",e)
});

// *************
eventStore.save({ name : "ceia", payload : { prato : "iogurte", preco : 2.90 } })
.then((instance_id) => { 
    console.log("instance id = ", instance_id);
})
.catch((e) => {
    console.log("error = ",e)
});

// *************
eventStore.save({ name : "cafedamanha", payload : { prato : "salada de frutas", preco : 8.40 } })
.then((instance_id) => { 
    console.log("instance id = ", instance_id);
})
.catch((e) => {
    console.log("error = ",e)
});

// *************
eventStore.save({ name : "colacao", payload : { prato : "biscoitos", preco : 5.60 } })
.then((instance_id) => { 
    console.log("instance id = ", instance_id);
})
.catch((e) => {
    console.log("error = ",e)
});

// *************
eventStore.save({ name : "almoco", payload : { prato : "churrasco", preco : 25.10 } })
.then((instance_id) => { 
    console.log("instance id = ", instance_id);
})
.catch((e) => {
    console.log("error = ",e)
});

// *************
eventStore.save({ name : "almoco", payload : { prato : "churrasco", preco : 25.10 } })
.then((instance_id) => { 
    console.log("instance id = ", instance_id);
})
.catch((e) => {
    console.log("error = ",e)
});

// *************
eventStore.save({ name : "lanche", payload : { prato : "bolo", preco : 4.50 } })
.then((instance_id) => { 
    console.log("instance id = ", instance_id);
})
.catch((e) => {
    console.log("error = ",e)
});

// *************
eventStore.save({ name : "jantar", payload : { prato : "frango xadrez", preco : 24.70 } })
.then((instance_id) => { 
    console.log("instance id = ", instance_id);
})
.catch((e) => {
    console.log("error = ",e)
});

// *************
eventStore.save({ name : "ceia", payload : { prato : "cerveja!!", preco : 45.80 } })
.then((instance_id) => { 
    console.log("instance id = ", instance_id);
})
.catch((e) => {
    console.log("error = ",e)
}); */