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
    let regex = /^(SUBI|ADDI) X([0-9]|[1-2][0-9]|3[0]),X([0-9]|[1-2][0-9]|3[0]),#\d+$|^(LDUR|STUR) X([0-9]|[1-2][0-9]|3[0]),\[X([0-9]|[1-2][0-9]|3[0]),#\d\]+$|^(CBZ|CBNZ) X([1-9]|[1-2][0-9]|3[0]),#\d+$|^(ADD|SUB|AND|ORR) X([0-9]|[1-2][0-9]|3[0]),X([0-9]|[1-2][0-9]|3[0]),X([0-9]|[1-2][0-9]|3[0])$|^(BR|BL) X([0-9]|[1-2][0-9]|3[0])$|^(B) #\d+$/;
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

function add(destination, source1, source2) {
    // Encontrar los índices de los registros
    let destIndex = parseInt(destination.substring(1));
    let src1Index = parseInt(source1.substring(1));
    let src2Index = parseInt(source2.substring(1));

    // Obtener los valores de los registros
    let src1Value = registro[src1Index].contenido;
    let src2Value = registro[src2Index].contenido;

    // Sumar los valores de los registros fuente
    let result = src1Value + src2Value;

    // Almacenar el resultado en el registro destino
    registro[destIndex].contenido = result;

    // Actualizar la tabla de registros para reflejar el cambio
    actualizarTablaRegistros();
}

function sub(destination, source1, source2) {
    // Encontrar los índices de los registros
    let destIndex = parseInt(destination.substring(1));
    let src1Index = parseInt(source1.substring(1));
    let src2Index = parseInt(source2.substring(1));

    // Obtener los valores de los registros
    let src1Value = registro[src1Index].contenido;
    let src2Value = registro[src2Index].contenido;

    // Sumar los valores de los registros fuente
    let result = src1Value - src2Value;

    // Almacenar el resultado en el registro destino
    registro[destIndex].contenido = result;

    // Actualizar la tabla de registros para reflejar el cambio
    actualizarTablaRegistros();
}

function addi(destination, source, immediate) {
    // Encontrar los índices de los registros
    let destIndex = parseInt(destination.substring(1));
    let srcIndex = parseInt(source.substring(1));
    let immediateValue = parseInt(immediate.substring(1));

    // Obtener el valor del registro fuente
    let srcValue = registro[srcIndex].contenido;

    // Sumar el valor del registro fuente con la constante inmediata
    let result = srcValue + immediateValue;

    // Almacenar el resultado en el registro destino
    registro[destIndex].contenido = result;

    // Actualizar la tabla de registros para reflejar el cambio
    actualizarTablaRegistros();
}

function subi(destination, source, immediate) {
    // Encontrar los índices de los registros
    let destIndex = parseInt(destination.substring(1));
    let srcIndex = parseInt(source.substring(1));
    let immediateValue = parseInt(immediate.substring(1));

    // Obtener el valor del registro fuente
    let srcValue = registro[srcIndex].contenido;

    // Sumar el valor del registro fuente con la constante inmediata
    let result = srcValue - immediateValue;

    // Almacenar el resultado en el registro destino
    registro[destIndex].contenido = result;

    // Actualizar la tabla de registros para reflejar el cambio
    actualizarTablaRegistros();
}

function and(destination, source1, source2) {
    // Encontrar los índices de los registros
    let destIndex = parseInt(destination.substring(1));
    let src1Index = parseInt(source1.substring(1));
    let src2Index = parseInt(source2.substring(1));

    // Obtener los valores de los registros fuente
    let src1Value = registro[src1Index].contenido;
    let src2Value = registro[src2Index].contenido;

    // Realizar la operación AND
    let result = src1Value & src2Value;

    // Almacenar el resultado en el registro destino
    registro[destIndex].contenido = result;

    // Actualizar la tabla de registros para reflejar el cambio
    actualizarTablaRegistros();
}
function orr(destination, source1, source2) {
    // Encontrar los índices de los registros
    let destIndex = parseInt(destination.substring(1));
    let src1Index = parseInt(source1.substring(1));
    let src2Index = parseInt(source2.substring(1));

    // Obtener los valores de los registros fuente
    let src1Value = registro[src1Index].contenido;
    let src2Value = registro[src2Index].contenido;

    // Realizar la operación AND
    let result = src1Value | src2Value;

    // Almacenar el resultado en el registro destino
    registro[destIndex].contenido = result;

    // Actualizar la tabla de registros para reflejar el cambio
    actualizarTablaRegistros();
}

function stur(source, baseRegister, offset) {
    // Encontrar los índices de los registros
    let srcIndex = parseInt(source.substring(1));
    let baseIndex = parseInt(baseRegister.substring(1));

    // Calcular la dirección en la memoria usando el registro base y el desplazamiento
    let direccion = registro[baseIndex].contenido + offset;

    // Obtener el valor del registro fuente
    let valor = registro[srcIndex].contenido;

    // Almacenar el valor en la memoria en la dirección calculada
    memory[direccion].contenido = valor;

    // Actualizar la tabla de memoria para reflejar el cambio
    actualizarTablaMemoria();
}

function ldur(destination, baseRegister, offset) {
    // Encontrar los índices de los registros
    let destIndex = parseInt(destination.substring(1));
    let baseIndex = parseInt(baseRegister.substring(1));

    // Calcular la dirección en la memoria usando el registro base y el desplazamiento
    let direccion = registro[baseIndex].contenido + offset;

    // Obtener el valor de la memoria en la dirección calculada
    let valorCargado = memory[direccion].contenido;

    // Almacenar el valor en el registro destino
    registro[destIndex].contenido = valorCargado;

    // Actualizar la tabla de registros para reflejar el cambio
    actualizarTablaRegistros();
}

function actualizarTablaRegistros() {
    const tabla = document.getElementById('tablaRegistros').getElementsByTagName('tbody')[0];
    tabla.innerHTML = ''; // Limpiar la tabla

    // Llenar la tabla con los datos actualizados
    registro.forEach((reg, index) => {
        const nuevaFila = tabla.insertRow();
        
        const celdaLocalidad = nuevaFila.insertCell(0);
        const celdaContenido = nuevaFila.insertCell(1);

        celdaLocalidad.textContent = reg.localidad;
        celdaContenido.textContent = reg.contenido;
    });
}

function ejecutarInstruccionActual() {
    if (instructionMemory.length === 0) {
        alert("No hay instrucciones para ejecutar");
        return;
    }

    let instruccion = instructionMemory[currentInstructionIndex];
    ejecutarInstruccion(instruccion);

    // Pasar a la siguiente instrucción después de ejecutarla
    siguienteInstruccion();
}

function ejecutarInstruccion(instruccion) {
    let partes = instruccion.split(" ");

    let opcode = partes[0];


    if (opcode === 'ADD') {
        let registros = partes[1].split(",");
        let dest = registros[0];
        let src1 = registros[1];
        let src2 = registros[2];
        add(dest, src1, src2);
    } 
    if (opcode === 'SUB'){
        let registros = partes[1].split(",");
        let dest = registros[0];
        let src1 = registros[1];
        let src2 = registros[2];
        sub(dest, src1, src2);
    }
    if (opcode === 'ADDI'){
        let registros = partes[1].split(",");
        let dest = registros[0];
        let src = registros[1];
        let immediate = registros[2];
        addi(dest, src, immediate);
    }
    if (opcode === 'SUBI'){
        let registros = partes[1].split(",");
        let dest = registros[0];
        let src = registros[1];
        let immediate = registros[2];
        subi(dest, src, immediate);
    }
    if (opcode === 'AND'){
        let registros = partes[1].split(",");
        let dest = registros[0];
        let src1 = registros[1];
        let src2 = registros[2];
        and(dest, src1, src2);
    }
    if (opcode === 'ORR'){
        let registros = partes[1].split(",");
        let dest = registros[0];
        let src1 = registros[1];
        let src2 = registros[2];
        orr(dest, src1, src2);
    }
    if (opcode === 'STUR' || opcode === 'LDUR') {
        let partes = instruccion.split(/[\[\],\s]+/); // Usamos una expresión regular para dividir por '[', ']', ',' y espacios
        let dest = partes[1]; // X1
        let base = partes[2]; // X2
        let offset = parseInt(partes[3].substring(1)); // Convertir #3 a 3
        if (opcode === 'STUR') {
            stur(dest, base, offset);
        } else if (opcode === 'LDUR') {
            ldur(dest, base, offset);
        }
    }
        //des añadir más lógica para manejar otras instrucciones

}

