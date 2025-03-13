const validator = require('validator');

class TokenModelValidate {
    // Definimos los campos del modelo (similares a un esquema de Mongoose)
    static fields = {
      fechaTransaccion: {
        type: String,  // Se supone que es una fecha en formato string
        required: true,
        validate: (value) => value && validator.matches(value, /^\d{2}\d{2}\d{2}$/), // Aseguramos que no sea nula ni vacía y que sea una fecha válida,Verifica el formato YYMMDD
        errorMessage: "La fecha de transacción es inválida o está vacía.",
      },
      tiendaTerminal: {
        type: String,
        required: true,
        validate: (value) => !validator.isEmpty(value), // Validación de entero
        errorMessage: "La tienda terminal no puede estar vacío.",
      },
      numeroTarjeta: {
        type: String,
        required: true,
        validate: (value) => !validator.isEmpty(value), // Validación de no vacío
        errorMessage: "El número de tarjeta no puede estar vacío.",
      },
      boleta: {
        type: String,
        required: true,
        validate: (value) => !validator.isEmpty(value), // Validación de no vacío
        errorMessage: "La boleta debe ser un número entero válido y no estar vacía.",
      },
      tipo: {
        type: Number,
        required: true,
        validate: (value) => [0, 1, 2].includes(value), // Validación de tipo permitido
        errorMessage: "El tipo debe ser 0, 1 o 2.",
      },
    };
  
    constructor(parametros) {
      this.fechaTransaccion = parametros.fechaTransaccion;
      this.tiendaTerminal = parametros.tiendaTerminal;
      this.numeroTarjeta = parametros.numeroTarjeta;
      this.boleta = parametros.boleta;
      this.tipo = parametros.tipo;
    }
    
    // Método estático para validar los datos
    static validate(parametros) {
        // Aseguramos que errores es siempre un array vacío, nunca null o undefined
        const errores = [];

        // Iteramos sobre los campos definidos en el modelo y validamos
        for (const campo in TokenModelValidate.fields) {
            const campoDef = TokenModelValidate.fields[campo];
            
            // Validar si el campo está presente (incluyendo el valor 0, false o "")
            if (campoDef.required && (parametros[campo] === undefined || parametros[campo] === null)) {                
                errores.push(`${campo} es requerido.`);
                continue;
            }

            // Validar si el campo cumple con el tipo y las validaciones
            if (campoDef.validate && !campoDef.validate(parametros[campo])) {
                console.log('Error en validación:', campo);
                console.log('Valor:', parametros[campo]);
                console.log('Mensaje de error:', campoDef.errorMessage);
                errores.push(campoDef.errorMessage);
            }
        }
        
        // Devolvemos errores o null si no hay errores
        return errores.length > 0 ? errores : [];
    }
}

module.exports = TokenModelValidate;
