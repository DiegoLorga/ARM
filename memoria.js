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
        listItem.textContent = "Dirección " + index + ": " + instruction;

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
