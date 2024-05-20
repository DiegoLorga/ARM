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
    instructionMemory.forEach(function (instruction, index) {
        let listItem = document.createElement("li");
        // Calcular la dirección hexadecimal en base al índice multiplicado por 4
        let direccionHexadecimal = (index * 4).toString(16).toUpperCase().padStart(2, '0');
        listItem.textContent = direccionHexadecimal + ": " + instruction;

        let deleteButton = document.createElement("button");
        deleteButton.textContent = "Eliminar";
        deleteButton.onclick = function () {
            borrarInstruccion(index);
        };

        listItem.appendChild(deleteButton);
        listaInstrucciones.appendChild(listItem);
    });
}

function agregarInstrucciones() {
    let instrucciones = document.getElementById("instrucciones").value.split("\n");
    instrucciones.forEach(function (instruccion) {
        instruccion = instruccion.trim().toUpperCase(); // Convertir a mayúsculas y eliminar espacios en blanco
        if (validarInstruccion(instruccion)) {
            addInstruction(instruccion);
        } else {
            alert("La instrucción ingresada no es válida: " + instruccion);
        }
    });
}

function validarInstruccion(instruccion) {
    // Validar el formato de la instrucción
    let regex = /^(SUBI|ADDI|STUR|LDUR) X([1-9]|[1-2][0-9]|3[0]),X([1-9]|[1-2][0-9]|3[0]),#\d+$|^(CBZ|CBNZ) X([1-9]|[1-2][0-9]|3[0]),#\d+$|^(ADD|SUB|AND|OR) X([1-9]|[1-2][0-9]|3[0]),X([1-9]|[1-2][0-9]|3[0]),X([1-9]|[1-2][0-9]|3[0])$|^(BR|BL) X([1-9]|[1-2][0-9]|3[0])$|^(B) #\d+$/
    return regex.test(instruccion);
}

