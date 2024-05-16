let instructionMemory = [];

function addInstruction(instruction) {
    instructionMemory.push(instruction);
    actualizarListaInstrucciones();
}

function borrarInstruccion(index) {
    instructionMemory.splice(index, 1);
    actualizarListaInstrucciones();
}

function borrarTodasLasInstrucciones() {
    instructionMemory = [];
    actualizarListaInstrucciones();
}

function actualizarListaInstrucciones() {
    let listaInstrucciones = document.getElementById("listaInstrucciones");
    listaInstrucciones.innerHTML = "";
    instructionMemory.forEach(function(instruction, index) {
        let listItem = document.createElement("li");
        // Convertir el índice a hexadecimal con ceros a la izquierda
        let direccionHexadecimal = "0x" + ("00" + index.toString(16).toUpperCase()).slice(-2);
        console.log("Hola")
        listItem.textContent = "Direccion " + direccionHexadecimal + ": " + instruction;

        let deleteButton = document.createElement("button");
        deleteButton.textContent = "Eliminar";
        deleteButton.onclick = function() {
            borrarInstruccion(index);
        };

        listItem.appendChild(deleteButton);
        listaInstrucciones.appendChild(listItem);
    });
}


function agregarInstrucciones() {
    let instrucciones = document.getElementById("instrucciones").value.split("\n");
    instrucciones.forEach(function(instruccion) {
        if (instruccion.trim() !== "") {
            addInstruction(instruccion.trim().toUpperCase());
        }
    });
}
