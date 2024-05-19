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
        // Calcular la dirección hexadecimal en base al índice multiplicado por 4
        let direccionHexadecimal = (index * 4).toString(16).toUpperCase().padStart(2, '0');
        listItem.textContent = direccionHexadecimal + ": " + instruction;

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
