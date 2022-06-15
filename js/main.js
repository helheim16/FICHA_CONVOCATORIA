window.onload = () => {
    // Para realizar el trabajo utilicé la extension live server de VSCode
    const TABLA_CONVOCATORIAS = document.querySelector('#tabla_convocatorias');
    const TABLA_ARTICULOS_PLIEGOS = document.querySelector('#tabla_datos_pliego');
    const TABLA_CONDICIONES = document.querySelector('#tabla_condiciones_pliego');
    const TABLA_ARTICULOS = document.querySelector('#tabla_articulos_solicitados');
    const BOTON = document.querySelector('#btn_solicitar');
    const URL = 'http://localhost:5500/ficha_convocatorias.xml';
    let xmldoc, convocatoria, pliegos, registros, itemsSeleccionados;
    let request = new XMLHttpRequest();

    BOTON.onclick = () => {
        // Elimino el contenido previo de las tablas
        limpiarTabla(TABLA_CONVOCATORIAS);
        limpiarTabla(TABLA_ARTICULOS_PLIEGOS);
        limpiarTabla(TABLA_CONDICIONES);
        limpiarTabla(TABLA_ARTICULOS);

        request.open('GET', URL);
        request.send();
        console.log('Enviado a ' + URL);
    }

    request.onreadystatechange = function() {
        if (this.readyState === 4 && this.status === 200) {

            xmldoc = request.responseXML;

            // Obtengo los datos necesarios del archivo xml
            convocatoria = xmldoc.getElementsByTagName('convocatoria');
            pliegos = xmldoc.getElementsByTagName('pliegos')[0].childNodes;
            registros = pliegos[0].childNodes[0].childNodes;
            itemsSeleccionados = xmldoc.getElementsByTagName('get_items_solicitados')[0].childNodes;

            // Se completan las tablas
            let tabla = new Tabla();
            tabla.crearTablaConvocatorias(TABLA_CONVOCATORIAS, convocatoria);
            tabla.crearTablaPliegos(TABLA_ARTICULOS_PLIEGOS, pliegos);
            tabla.crearTablaCondicionesPliego(TABLA_CONDICIONES, registros);
            tabla.crearTablaArticulos(TABLA_ARTICULOS, itemsSeleccionados);

        } else {
            switch (this.status) {
                case 404:
                    alert('Error 404, no se ha enconctrado el archivo');
                    break;

                case 500:
                    alert('Internal Server Error');
                    break;

                case 202:
                    alert('No Content');
                    break;

                case 408:
                    alert('Request Timeout');
                    break;

                case 400:
                    alert('Bad Request');
                    break;

                case 401:
                    alert('Unauthorized');
                    break;

                case 429:
                    alert('Too Many Requests');
                    break;

                case 401:
                    alert('Unauthorized');
                    break;
            }
        }
    };

    function Tabla() {
        // Todas las funciones crear llevan a la misma funcion comun por una cuestion de legibilidad

        // Esta propiedad almacena los tags que deberan ser extraidos por las tablas, dedicando un elemento del arreglo a cada una
        this.tags = [
            ['expediente_tipo_documentacion', ['expediente_numero', 'expediente_ejercicio'], 'asunto_convocatoria'],
            ['retiro_pliego_direccion', 'retiro_pliego_plazo_horario', 'acto_apertura_direccion', 'acto_apertura_fecha_inicio', 'acto_apertura_horario_inicio'],
            ['numero', 'titulo', 'descripcion'],
            ['descripcion', 'cantidad', 'unidad_medida', 'precio_estimado', 'area_destinataria']
        ];

        this.crearTablaConvocatorias = function(tabla, convocatoria) {
            this.crearTabla(tabla, convocatoria, this.tags[0]);
        };

        this.crearTablaPliegos = function(tabla, pliego) {
            this.crearTabla(tabla, pliego, this.tags[1])
        };

        this.crearTablaCondicionesPliego = function(tabla, registrosPliego) {
            this.crearTabla(tabla, registrosPliego, this.tags[2])
        };

        this.crearTablaArticulos = function(tabla, itemsSelec) {
            this.crearTabla(tabla, itemsSelec, this.tags[3])
        };

        this.crearTabla = function(tabla, datos, tagsArray) {
            /* Recorre la coleccion dada y por cada elemento de la coleccion crea un tr, 
               completando el mismo con td que contengan los atributos del elemento indice */

            for (let index = 0; index < datos.length; index++) {
                const element = datos[index];
                let tr = document.createElement('tr');

                for (let i = 0; i < tagsArray.length; i++) {
                    const tag = tagsArray[i];
                    let td = document.createElement('td');

                    // Si el elemento trabajado es un arreglo es porque se desea colocar el contenido de dos tags en la misma columna o td
                    if (Array.isArray(tag)) {
                        td.innerHTML = element.getAttribute(tag[0]) + '/' + element.getAttribute(tag[1]);
                    } else {
                        td.innerHTML = element.getAttribute(tag);
                    }
                    tr.appendChild(td);
                }
                tabla.appendChild(tr)
            }
        };
    }

    // Elimina el contenido de la tabla indicada
    function limpiarTabla(t) {
        while (t.childNodes.length > 2) {
            console.log('ELIMINADO')
            t.removeChild(t.lastChild);
        }
    }
};