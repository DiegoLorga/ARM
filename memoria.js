let instructionMemory = [];
let memory = [];
let registro = [];
let currentInstructionIndex = 0;
let currentPage = 1;
const itemsPerPage = 10;

// Esperar a que el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', function() {
    llenarTablaMemoria();
    llenarTablaRegistros();
});

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
    currentInstructionIndex = 0;
    actualizarListaInstrucciones();
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
    // Validar el formato de la instrucción usando regex
    let regex = /^(SUBI|ADDI|STUR|LDUR) X([0-9]|[1-2][0-9]|3[0]),X([0-9]|[1-2][0-9]|3[0]),#\d+$|^(CBZ|CBNZ) X([1-9]|[1-2][0-9]|3[0]),#\d+$|^(ADD|SUB|AND|OR) X([0-9]|[1-2][0-9]|3[0]),X([0-9]|[1-2][0-9]|3[0]),X([0-9]|[1-2][0-9]|3[0])$|^(BR|BL) X([0-9]|[1-2][0-9]|3[0])$|^(B) #\d+$/;
    return regex.test(instruccion);
}

function actualizarListaInstrucciones() {
    let tablaInstrucciones = document.getElementById("tablaInstrucciones").getElementsByTagName('tbody')[0];
    tablaInstrucciones.innerHTML = ""; // Limpiar la tabla

    instructionMemory.forEach(function (instruction, index) {
        // Calcular la dirección hexadecimal en base al índice multiplicado por 4
        let direccionHexadecimal = (index * 4).toString(16).toUpperCase().padStart(2, '0');

        // Crear una nueva fila
        let fila = document.createElement("tr");

        // Crear celdas
        let celdaDireccion = document.createElement("td");
        celdaDireccion.textContent = direccionHexadecimal;

        let celdaInstruccion = document.createElement("td");
        celdaInstruccion.textContent = instruction;

        let celdaAccion = document.createElement("td");
        let deleteButton = document.createElement("button");
        deleteButton.textContent = "Eliminar";
        deleteButton.onclick = function () {
            borrarInstruccion(index);
        };

        celdaAccion.appendChild(deleteButton);

        // Añadir celdas a la fila
        fila.appendChild(celdaDireccion);
        fila.appendChild(celdaInstruccion);
        fila.appendChild(celdaAccion);

        // Añadir la fila a la tabla
        tablaInstrucciones.appendChild(fila);
    });

    actualizarInstruccionActual();
}

function siguienteInstruccion() {
    if (currentInstructionIndex <= instructionMemory.length - 1) {
        currentInstructionIndex++;
        actualizarInstruccionActual();
    }
    if (currentInstructionIndex == instructionMemory.length) {
        currentInstructionIndex = 0;
        actualizarInstruccionActual();
    }
}

function instruccionAnterior() {
    if (currentInstructionIndex > 0) {
        currentInstructionIndex--;
        actualizarInstruccionActual();
    }
    else {
        currentInstructionIndex = instructionMemory.length -1;
        actualizarInstruccionActual();
    }
}

function actualizarInstruccionActual() {
    let filas = document.getElementById("tablaInstrucciones").getElementsByTagName('tr');
    for (let i = 1; i < filas.length; i++) { // Ignorar el encabezado
        if (i - 1 === currentInstructionIndex) {
            filas[i].classList.add('instruccion-actual');
            console.log(instructionMemory[currentInstructionIndex]);
        } else {
            filas[i].classList.remove('instruccion-actual');
        }
    }
}

function llenarTablaMemoria() {
    // Llenar la memoria con 32 filas por defecto
    for (let i = 0; i < 32; i++) {
        // Calcular la dirección en hexadecimal
        let direccionHexadecimal = (i * 8).toString(16).toUpperCase().padStart(2, '0');

        // Guardar los datos en la estructura
        memory.push({ localidad: direccionHexadecimal, contenido: i });
    }

    // Llenar la tabla con la primera página
    actualizarTablaMemoria();
}

function actualizarTablaMemoria() {
    const tabla = document.getElementById('tablaMemoria').getElementsByTagName('tbody')[0];
    tabla.innerHTML = ''; // Limpiar la tabla

    // Calcular los índices de los elementos a mostrar
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const itemsToShow = memory.slice(startIndex, endIndex);

    // Añadir las filas a la tabla
    itemsToShow.forEach(item => {
        const nuevaFila = tabla.insertRow();
        
        const celdaLocalidad = nuevaFila.insertCell(0);
        const celdaContenido = nuevaFila.insertCell(1);

        celdaLocalidad.textContent = item.localidad;
        celdaContenido.textContent = item.contenido;
    });
}

function cambiarPagina(direccion) {
    if (direccion === 'anterior' && currentPage > 1) {
        currentPage--;
    } else if (direccion === 'siguiente' && currentPage < Math.ceil(memory.length / itemsPerPage)) {
        currentPage++;
    }
    actualizarTablaMemoria();
}

function llenarTablaRegistros() {
    const tabla = document.getElementById('tablaRegistros').getElementsByTagName('tbody')[0];

    // Llenar la tabla con 32 filas por defecto
    for (let i = 0; i < 32; i++) {
        // Calcular la dirección en hexadecimal
        let direccionHexadecimal = 'X' + i;

        // Crear una nueva fila
        const nuevaFila = tabla.insertRow();
        
        // Crear celdas para Localidad y Contenido
        const celdaLocalidad = nuevaFila.insertCell(0);
        const celdaContenido = nuevaFila.insertCell(1);

        // Llenar las celdas con los datos correspondientes
        celdaLocalidad.textContent = direccionHexadecimal;
        celdaContenido.textContent = i;

        // Guardar los datos en la estructura
        registro.push({ localidad: direccionHexadecimal, contenido: i });
    }
}
