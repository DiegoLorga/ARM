let instructionMemory = [];
let memory = [];
let registro = [];
let currentInstructionIndex = 0;
let currentPage = 1;
const itemsPerPage = 10;

// Esperar a que el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', function () {
    llenarTablaMemoria();
    llenarTablaRegistros();
});

function calcularOpcode(instruccion) {

    // Dividir la instrucción en partes
    const partes = instruccion.split(" ");
    const operacion = partes[0];
    const registros = partes[1]; // Tomar toda la parte de los registros como un solo string

    let opcodeBase;
    let opcodeBinario = "";

    // Determinar el tipo de instrucción y definir el opcode base
    switch (operacion) {
        // Instrucciones tipo R
        case 'ADD':
            opcodeBase = '10001011000'; // 11 bits para ADD
            break;
        case 'SUB':
            opcodeBase = '11001011000'; // 11 bits para SUB
            break;
        case 'AND':
            opcodeBase = '10001010000'; // 11 bits para AND
            break;
        case 'ORR':
            opcodeBase = '10101010000'; // 11 bits para ORR
            break;
        case 'BR':
            opcodeBase = '11010110000'; // 10 bits para BR
            break;
        // Instrucciones tipo I
        case 'ADDI':
            opcodeBase = '1001000100'; // 10 bits para ADDI
            break;
        case 'SUBI':
            opcodeBase = '1101000100'; // 10 bits para SUBI
            break;
        // Instrucciones tipo D
        case 'STUR':
            opcodeBase = '11111000000'; // 11 bits para STUR
            break;
        case 'LDUR':
            opcodeBase = '11111000010'; // 11 bits para LDUR
            break;
        // Instrucciones tipo B
        case 'B':
            opcodeBase = '000101'; // 6 bits para B
            break;
        case 'BL':
            opcodeBase = '100101'; // 6 bits para BL
            break;
        //Instrucciones tipo CB
        case 'CBZ':
            opcodeBase = '10110100'; // 8 bits para CBZ
            break;
        case 'CBNZ':
            opcodeBase = '10110101'; // 8 bits para CBNZ
            break;
        default:
            console.error("Instrucción no válida");
            return;
    }

    if (operacion === 'ADD' || operacion === 'SUB' || operacion === 'AND' || operacion === 'ORR' || operacion === 'BR') {
        // Instrucciones tipo R
        const registrosR = registros.split(",");
        let rmBin = registrosR[1] ? Number(registrosR[1].replace('X', '')).toString(2).padStart(5, '0') : '00000';
        let rnBin = registrosR[2] ? Number(registrosR[2].replace('X', '')).toString(2).padStart(5, '0') : '00000';
        let rdBin = registrosR[0] ? Number(registrosR[0].replace('X', '')).toString(2).padStart(5, '0') : '00000';
        let shamt = '000000'; // shamt fijo para instrucciones tipo R

        // Concatenar para formar el opcode binario completo tipo R
        opcodeBinario = opcodeBase + rmBin + shamt + rnBin + rdBin;

    } else if (operacion === 'ADDI' || operacion === 'SUBI') {
        // Instrucciones tipo I
        const registrosI = registros.split(",");
        let rdBin = Number(registrosI[0].replace('X', '')).toString(2).padStart(5, '0'); // 5 bits para rd
        let rnBin = Number(registrosI[1].replace('X', '')).toString(2).padStart(5, '0'); // 5 bits para rn
        let immediateValue = Number(registrosI[2].replace('#', ''));

        // Convertir el inmediato a binario y aplicar complemento a dos si es negativo
        let immediateBin = aplicarComplementoADos(immediateValue, 12); // 12 bits para el valor inmediato

        // Concatenar para formar el opcode binario completo tipo I
        opcodeBinario = opcodeBase + immediateBin + rnBin + rdBin;

    } else if (operacion === 'STUR' || operacion === 'LDUR') {
        // Instrucciones tipo D

        const rdPart = registros.split(",")[0].replace('X', '');
        let rdBin = Number(rdPart).toString(2).padStart(5, '0'); // 5 bits para rd

        const match = registros.match(/\[X(\d+),#(\d+)\]/);
        if (!match) {
            console.error("Formato de instrucción tipo D no válido");
            return;
        }

        let rnBin = Number(match[1]).toString(2).padStart(5, '0'); // 5 bits para rn
        let immediateValue = Number(match[2]);

        // Convertir el inmediato a binario y aplicar complemento a dos si es negativo
        let immediateBin = aplicarComplementoADos(immediateValue, 9); // 9 bits para el valor inmediato
        let op = '00'; // campo op fijo para instrucciones tipo D

        opcodeBinario = opcodeBase + immediateBin + op + rnBin + rdBin;

    } else if (operacion === 'B' || operacion === 'BL') {
        // Instrucciones tipo B
        let immediateValue = Number(registros.replace('#', '').trim());

        // Convertir el inmediato a binario y aplicar complemento a dos si es negativo
        let immediateBin = aplicarComplementoADos(immediateValue, 26); // 26 bits para el valor inmediato

        opcodeBinario = opcodeBase + immediateBin;

    } else if (operacion === 'CBZ' || operacion === 'CBNZ') {
        // Instrucciones tipo CB

        const [rdPart, immediateValue] = registros.split(",");
        let rdBin = Number(rdPart.replace('X', '')).toString(2).padStart(5, '0'); // 5 bits para rd
        let immediate = Number(immediateValue.replace('#', '').trim());

        // Convertir el inmediato a binario y aplicar complemento a dos si es negativo
        let immediateBin = aplicarComplementoADos(immediate, 19); // 19 bits para el valor inmediato

        opcodeBinario = opcodeBase + immediateBin + rdBin;
    }

    let opcodeHexadecimal = parseInt(opcodeBinario, 2).toString(16).toUpperCase().padStart(8, '0');

    document.getElementById('opcode-binary').textContent = opcodeBinario;
    document.getElementById('opcode-hex').textContent = `${opcodeHexadecimal}`;
}

// Función para aplicar el complemento a dos a un número
function aplicarComplementoADos(valor, bits) {
    if (valor >= 0) {
        return valor.toString(2).padStart(bits, '0'); // Si es positivo, simplemente convierte a binario
    } else {
        // Si es negativo, calcula el complemento a dos
        let binario = (Math.pow(2, bits) + valor).toString(2);
        return binario.padStart(bits, '0'); // Asegura que tenga el tamaño correcto en bits
    }
}


function addInstruction(instruction) {
    instructionMemory.push(instruction);
    const partes = instruction.split(" ")
    mostrarAlerta('Instruccion(es) insertada(s) correctamente.');
    actualizarListaInstrucciones();
    const operacion = partes[0]
    const registros = partes[1].split(",");
    //console.log("esta es la instruccion", operacion)
    //console.log("registros", registros);
    calcularOpcode(instruction)
}

function borrarInstruccion(index) {
    instructionMemory.splice(index, 1);
    actualizarListaInstrucciones();
}

function borrarTodasLasInstrucciones() {
    // Crear el elemento de la alerta
    var alerta = document.createElement('div');
    alerta.className = `toast-3`;
    alerta.setAttribute('role', 'alert');
    alerta.setAttribute('aria-live', 'assertive');
    alerta.setAttribute('aria-atomic', 'true');

    // Crear el cuerpo del toast
    var alertaBody = document.createElement('div');
    alertaBody.className = 'toast-body';
    alertaBody.textContent = '¿Estás seguro de que deseas borrar todas las instrucciones?';

    // Crear botones dentro del toast
    var botones = document.createElement('div');
    botones.className = 'mt-2 pt-2 border-top';

    var botonConfirmar = document.createElement('button');
    botonConfirmar.className = 'btn btn-primary btn-sm';
    botonConfirmar.textContent = 'Confirmar';
    botonConfirmar.addEventListener('click', function () {
        alerta.remove(); // Remover el toast al hacer clic en Confirmar
        instructionMemory = [];
        currentInstructionIndex = 0;
        actualizarListaInstrucciones();
        mostrarAlerta('Todas las instrucciones han sido borradas.');
    });

    var botonCerrar = document.createElement('button');
    botonCerrar.className = 'btn btn-secondary btn-sm';
    botonCerrar.setAttribute('data-bs-dismiss', 'toast');
    botonCerrar.textContent = 'Close';

    // Agregar eventos de clic a los botones
    botonCerrar.addEventListener('click', function () {
        alerta.remove(); // Remover el toast al hacer clic en Close
    });

    // Agregar botones al contenedor de botones
    botones.appendChild(botonConfirmar);
    botones.appendChild(botonCerrar);

    // Agregar botones al cuerpo del toast
    alertaBody.appendChild(botones);

    // Agregar el cuerpo del toast al toast
    alerta.appendChild(alertaBody);

    // Agregar el toast al cuerpo del documento
    document.body.appendChild(alerta);

    setTimeout(function () {
        alerta.classList.add('show');
    }, 10);

    // Ocultar la alerta después de 2 segundos
    setTimeout(function () {
        $(alerta).toast('hide');
    }, 10000);

}


function agregarInstrucciones() {
    let instrucciones = document.getElementById("instrucciones").value.split("\n");
    instrucciones.forEach(function (instruccion) {
        instruccion = instruccion.trim().toUpperCase(); // Convertir a mayúsculas y eliminar espacios en blanco
        if (validarInstruccion(instruccion)) {
            addInstruction(instruccion);
            document.getElementById("instrucciones").value = '';
        } else {
            mostrarAlertaMal("La instrucción ingresada no es válida: " + instruccion, 'danger');
        }
    });

}

function validarInstruccion(instruccion) {
    // Validar el formato de la instrucción usando regex
    let regex = /^(SUBI|ADDI) X([0-9]|[1-2][0-9]|3[0]),X([0-9]|[1-2][0-9]|3[0]),#\d+$|^(LDUR|STUR) X([0-9]|[1-2][0-9]|3[0]),\[X([0-9]|[1-2][0-9]|3[0]),#\d+\]+$|^(CBZ|CBNZ) X([0-9]|[1-2][0-9]|3[0]),#-?\d+$|^(ADD|SUB|AND|ORR) X([0-9]|[1-2][0-9]|3[0]),X([0-9]|[1-2][0-9]|3[0]),X([0-9]|[1-2][0-9]|3[0])$|^(BR) X([0-9]|[1-2][0-9]|3[0])$|^(B|BL) #-?\d+$/;
    return regex.test(instruccion);
}

function actualizarListaInstrucciones() {
    let tablaInstrucciones = document.getElementById("tablaInstrucciones").getElementsByTagName('tbody')[0];
    tablaInstrucciones.innerHTML = ""; // Limpiar la tabla

    instructionMemory.forEach(function (instruction, index) {
        let direccionHexadecimal = (index * 4).toString(16).toUpperCase().padStart(2, '0');

        let fila = document.createElement("tr");

        let celdaDireccion = document.createElement("td");
        celdaDireccion.textContent = direccionHexadecimal;

        let celdaInstruccion = document.createElement("td");
        celdaInstruccion.textContent = instruction;
        celdaInstruccion.setAttribute("contenteditable", "false"); // Inicialmente no editable

        let celdaAccion = document.createElement("td");

        // Botón Eliminar
        let deleteButton = document.createElement("button");
        deleteButton.textContent = "Eliminar";
        deleteButton.onclick = function () {
            borrarInstruccion(index);
        };

        // Botón Editar
        let editButton = document.createElement("button");
        editButton.textContent = "Editar";
        editButton.onclick = function () {
            celdaInstruccion.setAttribute("contenteditable", "true");
            celdaInstruccion.focus(); // Poner foco en la celda editable
        };

        // Botón Agregar
        let addButton = document.createElement("button");
        addButton.textContent = "Agregar";
        addButton.onclick = function () {
            agregarNuevaInstruccion(index + 1); // Agregar instrucción justo debajo de la fila actual
        };

        // Manejar la actualización al presionar "Enter"
        celdaInstruccion.addEventListener("keydown", function (event) {
            if (event.key === "Enter") {
                event.preventDefault(); // Evitar que se agregue una nueva línea
                let nuevaInstruccion = celdaInstruccion.textContent.trim().toUpperCase();
                if (validarInstruccion(nuevaInstruccion)) {
                    instructionMemory[index] = nuevaInstruccion;
                    celdaInstruccion.setAttribute("contenteditable", "false");
                    mostrarAlerta('Instrucción actualizada correctamente.');
                } else {
                    mostrarAlertaMal("La instrucción ingresada no es válida: " + nuevaInstruccion, 'danger');
                    celdaInstruccion.textContent = instructionMemory[index]; // Revertir cambios
                    celdaInstruccion.setAttribute("contenteditable", "false");
                }
                actualizarInstruccionActual();
            }
        });

        // Añadir botones a la celda de acción
        celdaAccion.appendChild(editButton);
        celdaAccion.appendChild(addButton);
        celdaAccion.appendChild(deleteButton);

        fila.appendChild(celdaDireccion);
        fila.appendChild(celdaInstruccion);
        fila.appendChild(celdaAccion);

        tablaInstrucciones.appendChild(fila);
        calcularOpcode(instruction)
    });
    actualizarInstruccionActual();
}

function agregarNuevaInstruccion(posicion) {
    let nuevaFila = document.createElement("tr");

    let nuevaCeldaDireccion = document.createElement("td");
    nuevaCeldaDireccion.textContent = (posicion * 4).toString(16).toUpperCase().padStart(2, '0');

    let nuevaCeldaInstruccion = document.createElement("td");
    nuevaCeldaInstruccion.setAttribute("contenteditable", "true"); // Celda editable
    nuevaCeldaInstruccion.focus(); // Poner foco en la nueva celda

    let nuevaCeldaAccion = document.createElement("td");

    // Botón Eliminar para la nueva fila
    let deleteButton = document.createElement("button");
    deleteButton.textContent = "Eliminar";
    deleteButton.onclick = function () {
        borrarInstruccion(posicion);
    };

    // Botón Editar para la nueva fila
    let editButton = document.createElement("button");
    editButton.textContent = "Editar";
    editButton.onclick = function () {
        nuevaCeldaInstruccion.setAttribute("contenteditable", "true");
        nuevaCeldaInstruccion.focus(); // Poner foco en la celda editable
    };

    // Botón Agregar para la nueva fila
    let addButton = document.createElement("button");
    addButton.textContent = "Agregar";
    addButton.onclick = function () {
        agregarNuevaInstruccion(posicion + 1);
    };

    // Manejar la adición de la nueva instrucción al presionar "Enter"
    nuevaCeldaInstruccion.addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
            event.preventDefault();
            let nuevaInstruccion = nuevaCeldaInstruccion.textContent.trim().toUpperCase();
            if (validarInstruccion(nuevaInstruccion)) {
                instructionMemory.splice(posicion, 0, nuevaInstruccion); // Insertar en la posición indicada
                actualizarListaInstrucciones();
                mostrarAlerta('Nueva instrucción agregada correctamente.');
            } else {
                mostrarAlertaMal("La instrucción ingresada no es válida: " + nuevaInstruccion, 'danger');
                nuevaCeldaInstruccion.textContent = ""; // Limpiar la celda si la instrucción no es válida
            }
        }
    });

    // Añadir botones a la nueva celda de acción
    nuevaCeldaAccion.appendChild(editButton);
    nuevaCeldaAccion.appendChild(addButton);
    nuevaCeldaAccion.appendChild(deleteButton);

    nuevaFila.appendChild(nuevaCeldaDireccion);
    nuevaFila.appendChild(nuevaCeldaInstruccion);
    nuevaFila.appendChild(nuevaCeldaAccion);

    let tablaInstrucciones = document.getElementById("tablaInstrucciones").getElementsByTagName('tbody')[0];
    tablaInstrucciones.insertBefore(nuevaFila, tablaInstrucciones.childNodes[posicion]); // Insertar la fila en la posición correcta
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
    mostrarOpcodeActual(); // Mostrar el opcode de la instrucción actual
}

function instruccionAnterior() {
    if (currentInstructionIndex > 0) {
        currentInstructionIndex--;
        actualizarInstruccionActual();
    }
    else {
        currentInstructionIndex = instructionMemory.length - 1;
        actualizarInstruccionActual();
    }
    mostrarOpcodeActual(); // Mostrar el opcode de la instrucción actual
}

function mostrarOpcodeActual() {
    const instruccionActual = instructionMemory[currentInstructionIndex];
    if (instruccionActual) {
        calcularOpcode(instruccionActual); // Calcular y mostrar el opcode de la instrucción actual
    }
}

function actualizarInstruccionActual() {
    let filas = document.getElementById("tablaInstrucciones").getElementsByTagName('tr');
    for (let i = 1; i < filas.length; i++) { // Ignorar el encabezado
        if (i - 1 === currentInstructionIndex) {
            filas[i].classList.add('instruccion-actual');
            console.log("Instruccion actual", instructionMemory[currentInstructionIndex]);
        } else {
            filas[i].classList.remove('instruccion-actual');
        }
    }
    mostrarOpcodeActual(); // Asegurarse de que el opcode se muestre también al actualizar la instrucción actual
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

function actualizarTablaRegistro() {
    const tabla = document.getElementById('tablaRegistros').getElementsByTagName('tbody')[0];
    tabla.innerHTML = ''; // Limpiar la tabla

    // Calcular los índices de los elementos a mostrar
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const itemsToShow = registro.slice(startIndex, endIndex);

    // Añadir las filas a la tabla
    itemsToShow.forEach(item => {
        const nuevaFila = tabla.insertRow();

        const celdaLocalidad = nuevaFila.insertCell(0);
        const celdaContenido = nuevaFila.insertCell(1);

        celdaLocalidad.textContent = item.localidad;
        celdaContenido.textContent = item.contenido;
    });
}

function cambiarPagina2(direccion) {
    if (direccion === 'anterior' && currentPage > 1) {
        currentPage--;
    } else if (direccion === 'siguiente' && currentPage < Math.ceil(registro.length / itemsPerPage)) {
        currentPage++;
    }
    actualizarTablaRegistro();
}

function llenarTablaRegistros() {
    const tabla = document.getElementById('tablaRegistros').getElementsByTagName('tbody')[0];

    // Llenar la tabla con 32 filas por defecto
    for (let i = 0; i < 31; i++) {
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
        actualizarTablaRegistro();
    }
}

function mostrarAlerta(message) {

    // Crear el elemento de la alerta con la clase toast-2
    var alerta = document.createElement('div');
    alerta.className = `toast`;
    alerta.setAttribute('role', 'alert');
    alerta.setAttribute('aria-live', 'assertive');
    alerta.setAttribute('aria-atomic', 'true');

    // Crear el cuerpo del toast
    var alertaBody = document.createElement('div');
    alertaBody.className = 'toast-body';
    alertaBody.textContent = message;

    // Agregar el cuerpo del toast al toast
    alerta.appendChild(alertaBody);

    // Agregar el toast al cuerpo del documento
    document.body.appendChild(alerta);

    setTimeout(function () {
        alerta.classList.add('show');
    }, 10);

    // Ocultar la alerta después de 2 segundos
    setTimeout(function () {
        $(alerta).toast('hide');
    }, 2000);


}

function mostrarAlertaMal(message, type = 'danger') {
    // Crear el elemento de la alerta con la clase toast-2
    var alerta = document.createElement('div');
    alerta.className = `toast-2`;
    alerta.setAttribute('role', 'alert');
    alerta.setAttribute('aria-live', 'assertive');
    alerta.setAttribute('aria-atomic', 'true');

    // Crear el cuerpo del toast
    var alertaBody = document.createElement('div');
    alertaBody.className = 'toast-body';
    alertaBody.textContent = message;

    // Crear botones dentro del toast
    var botones = document.createElement('div');
    botones.className = 'mt-2 pt-2 border-top';

    var botonCerrar = document.createElement('button');
    botonCerrar.className = 'btn btn-secondary btn-sm';
    botonCerrar.textContent = 'Cerrar';

    // Agregar eventos de clic a los botones
    botonCerrar.addEventListener('click', function () {
        alerta.remove(); // Remover el toast al hacer clic en Close
    });

    botones.appendChild(botonCerrar);

    // Agregar botones al cuerpo del toast
    alertaBody.appendChild(botones);

    // Agregar el cuerpo del toast al toast
    alerta.appendChild(alertaBody);

    // Agregar el toast al cuerpo del documento
    document.body.appendChild(alerta);

    setTimeout(function () {
        alerta.classList.add('show');
    }, 10);

    // Ocultar la alerta después de 2 segundos
    setTimeout(function () {
        $(alerta).toast('hide');
    }, 10000);
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

function cbnz(registro1, constante) {
    // Obtener el valor del registro (ejemplo: X1)
    let src1Index = parseInt(registro1.substring(1));
    let src1Value = registro[src1Index].contenido;
    let instruccion = instructionMemory[currentInstructionIndex];
    let posicionActual = currentInstructionIndex; // Cambiado de instructionMemory.indexOf(instruccion) a currentInstructionIndex

    console.log("Posicion Actual:", posicionActual);
    console.log("Instrucción a ejecutar:", instruccion);
    console.log("Valor del registro:", src1Value);

    // Verificar si el valor del registro es diferente de cero
    if (src1Value !== 0) {
        // Calcular la nueva posición a la que se debe saltar
        let nuevaPosicion = posicionActual + constante; // Sumar constante a la posición actual

        // Verificar que la nueva posición esté dentro del rango de instrucciones
        if (nuevaPosicion >= 0 && nuevaPosicion < instructionMemory.length) {
            console.log("Nueva Posición:", nuevaPosicion);
            return nuevaPosicion;
        } else {
            console.error('Error: Intento de saltar fuera del rango de instrucciones.');
            mostrarAlertaMal('Error: Intento de saltar fuera del rango de instrucciones.');
            return posicionActual; // Mantener la posición actual si hay un error
        }
    } else {
        // Si el valor del registro es cero, no se hace nada y se continua con la siguiente instrucción
        return posicionActual;
    }
}

function cbz(registro1, constante) {
    // Obtener el valor del registro (ejemplo: X1)
    let src1Index = parseInt(registro1.substring(1));
    let src1Value = registro[src1Index].contenido;
    let instruccion = instructionMemory[currentInstructionIndex];
    let posicionActual = currentInstructionIndex; // Cambiado de instructionMemory.indexOf(instruccion) a currentInstructionIndex

    console.log("Posicion Actual:", posicionActual);
    console.log("Instrucción a ejecutar:", instruccion);
    console.log("Valor del registro:", src1Value);

    // Verificar si el valor del registro es cero
    if (src1Value === 0) {
        // Calcular la nueva posición a la que se debe saltar
        let nuevaPosicion = posicionActual + constante; // Sumar constante a la posición actual

        // Verificar que la nueva posición esté dentro del rango de instrucciones
        if (nuevaPosicion >= 0 && nuevaPosicion < instructionMemory.length) {
            console.log("Nueva Posición:", nuevaPosicion);
            return nuevaPosicion;
        } else {
            console.error('Error: Intento de saltar fuera del rango de instrucciones.');
            mostrarAlertaMal('Error: Intento de saltar fuera del rango de instrucciones.');
            return posicionActual; // Mantener la posición actual si hay un error
        }
    } else {
        // Si el valor del registro no es cero, no se hace nada y se continua con la siguiente instrucción
        return posicionActual;
    }
}

function b(constante) {
    let instruccion = instructionMemory[currentInstructionIndex];
    let posicionActual = currentInstructionIndex; // Cambiado de instructionMemory.indexOf(instruccion) a currentInstructionIndex

    console.log("Posicion Actual:", posicionActual);

    // Verificar si el valor de constante es un número válido
    if (!isNaN(constante)) {
        // Calcular la nueva posición a la que se debe saltar
        let nuevaPosicion = posicionActual + constante; // Sumar constante a la posición actual

        // Verificar que la nueva posición esté dentro del rango de instrucciones
        if (nuevaPosicion >= 0 && nuevaPosicion < instructionMemory.length) {
            console.log("Nueva Posición:", nuevaPosicion);
            return nuevaPosicion;
        } else {
            console.error('Error: Intento de saltar fuera del rango de instrucciones.');
            mostrarAlertaMal('Error: Intento de saltar fuera del rango de instrucciones.');
            return posicionActual; // Mantener la posición actual si hay un error
        }
    } else {
        console.error('Error: Constante no válida.');
        return posicionActual; // Mantener la posición actual si hay un error
    }
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
    let partes = instruccion.split(" ");
    let opcode = partes[0];

    // Ejecutar la instrucción actual
    if (opcode === 'CBNZ' || opcode === 'CBZ') {
        let registros = partes[1].split(",");
        let registro = registros[0];
        let constante = parseInt(registros[1].substring(1)); // Convertir #3 a 3
        const nuevaPosicion = opcode === 'CBNZ' ? cbnz(registro, constante) : cbz(registro, constante);

        if ((opcode === 'CBNZ' && nuevaPosicion !== currentInstructionIndex) || (opcode === 'CBZ' && nuevaPosicion !== currentInstructionIndex)) {
            currentInstructionIndex = nuevaPosicion;
            console.log(["ESTA ES LA POSICION A LA QUE DEBE SALTAR: ", nuevaPosicion]);
            actualizarInstruccionActual();
        } else {
            siguienteInstruccion();
        }

    } else if (opcode === 'B') {
        let constanteStr = partes[1];
        let constante = parseInt(constanteStr.substring(1)); // Convertir #2 a 2
        const nuevaPosicion = b(constante);

        if (nuevaPosicion !== currentInstructionIndex) {
            currentInstructionIndex = nuevaPosicion;
            console.log(["ESTA ES LA POSICION A LA QUE DEBE SALTAR: ", nuevaPosicion]);
            actualizarInstruccionActual();
        } else {
            siguienteInstruccion();
        }

    } else if (opcode === 'BL') { 
        let constanteStr = partes[1];
        let constante = parseInt(constanteStr.substring(1)); // Convertir #2 a 2

        if (isNaN(constante)) {
            console.error("Error: Constante no válida");
            siguienteInstruccion();
            return;
        }

        const nuevaPosicion = b(constante); // Usa la misma lógica para calcular la nueva posición

        if (nuevaPosicion !== currentInstructionIndex) {
            currentInstructionIndex = nuevaPosicion;
            console.log(["ESTA ES LA POSICION A LA QUE DEBE SALTAR: ", nuevaPosicion]);
            console.log(currentInstructionIndex);
        
            // Guardar la dirección de retorno en el registro de enlace (LR o x30)
            registro['x30'] = currentInstructionIndex;
            console.log("Dirección de retorno guardada en x30:", registro['x30']);

            actualizarInstruccionActual();
        } else {
            siguienteInstruccion();
        }
    } else if (opcode === 'BR') {
        // BR se usa para saltar a la dirección almacenada en x30
        if (registro['x30'] !== undefined) {
            // Establecemos la posición de la instrucción actual a la dirección almacenada en x30
            currentInstructionIndex = registro['x30'];
            console.log("ESTA ES LA POSICION A LA QUE DEBE REGRESAR: ", currentInstructionIndex);
            actualizarInstruccionActual();
        } else {
            console.error("Error: x30 no tiene una dirección válida");
            siguienteInstruccion();
        }
    } else {
        // Ejecutar otras instrucciones
        ejecutarInstruccion(instruccion);
        siguienteInstruccion();
    }
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
    if (opcode === 'SUB') {
        let registros = partes[1].split(",");
        let dest = registros[0];
        let src1 = registros[1];
        let src2 = registros[2];
        sub(dest, src1, src2);
    }
    if (opcode === 'ADDI') {
        let registros = partes[1].split(",");
        let dest = registros[0];
        let src = registros[1];
        let immediate = registros[2];
        addi(dest, src, immediate);
    }
    if (opcode === 'SUBI') {
        let registros = partes[1].split(",");
        let dest = registros[0];
        let src = registros[1];
        let immediate = registros[2];
        subi(dest, src, immediate);
    }
    if (opcode === 'AND') {
        let registros = partes[1].split(",");
        let dest = registros[0];
        let src1 = registros[1];
        let src2 = registros[2];
        and(dest, src1, src2);
    }
    if (opcode === 'ORR') {
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
}