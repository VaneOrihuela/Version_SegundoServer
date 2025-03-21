class Token {
    constructor(signoInicio, tipo, longitud, datos) {
        this.signoInicio = signoInicio;
        this.tipo = tipo;
        this.longitud = longitud;
        this.datos = datos;
    }
}

class ConvertirToken {
    constructor(dataToken) {
        this.dataToken = dataToken.replace(/\n/g, ""); // Remover saltos de línea
        this.resultadoToken = [];
    }

    convertirHexAAscii(hexString) {
        let asciiString = "";
        for (let i = 0; i < hexString.length; i += 2) {
            let hexChar = hexString.substring(i, i + 2);
            const charCode = parseInt(hexChar, 16);
            if (isNaN(charCode)) {
                return ''; // Si no es un número válido, devuelve una cadena vacía
            }
            asciiString += String.fromCharCode(charCode);
        }
        return  asciiString;
    }
    convertirHexADecimal(hexString) {
        // Usamos parseInt con base 16 para convertir el valor hexadecimal a decimal
        return parseInt(hexString, 16);
    }

    Separar() {
        let restante = this.dataToken;
        let esPrimerDato = true;

        while (restante.length > 0) {
            let signoInicio, tipo, longitud, datos = "";

            if (this.resultadoToken.length === 0) {
                // Primer bloque (primeros 12 caracteres)
                signoInicio = restante.substring(0, 4);
                tipo = restante.substring(4, 8);
                longitud = restante.substring(8, 12);
                restante = restante.substring(12);
            } else {
                // A partir de "2120", extraer 12 caracteres más
                signoInicio = restante.substring(0, 4);
                tipo = restante.substring(4, 8);
                longitud = restante.substring(8, 12);
                restante = restante.substring(12);
            }

            // Extraer datos hasta el próximo "2120" o hasta el final
            let siguiente2120 = restante.indexOf("2120");
            if (siguiente2120 !== -1) {
                datos = restante.substring(0, siguiente2120);
                restante = restante.substring(siguiente2120); // Mantener el próximo "2120"
            } else {
                datos = restante;
                restante = ""; // No hay más "2120", terminamos
            }

            // Guardar objeto con los datos en la lista
            this.resultadoToken.push(new Token(signoInicio, tipo, longitud, esPrimerDato ? null : datos.trim()));

            esPrimerDato = false; // A partir de aquí, los registros tendrán datos
        }

        return this.resultadoToken;
    }
}

// Exportamos las clases para que puedan usarse en otros archivos
module.exports = { ConvertirToken, Token };
